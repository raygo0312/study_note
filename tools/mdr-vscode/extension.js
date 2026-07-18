const vscode = require('vscode');
const { format } = require('mdr-compiler/formatter');
const { formatEmbedded } = require('./embedded-formatter');

const EMPTY_LIST_ITEM_PATTERN = /^\s*[+-]\s*$/;
const virtualDocuments = new Map();

async function virtualDocument(language) {
  if (!virtualDocuments.has(language)) {
    virtualDocuments.set(language, vscode.workspace.openTextDocument({ language, content: '' }));
  }
  return virtualDocuments.get(language);
}

function applyTextEdits(document, source, edits) {
  return [...edits].sort((left, right) =>
    document.offsetAt(right.range.start) - document.offsetAt(left.range.start))
    .reduce((value, edit) => {
      const start = document.offsetAt(edit.range.start);
      const end = document.offsetAt(edit.range.end);
      return `${value.slice(0, start)}${edit.newText}${value.slice(end)}`;
    }, source);
}

async function formatLanguage(language, source, options) {
  try {
    const available = await vscode.languages.getLanguages();
    if (!available.includes(language)) return undefined;
    const document = await virtualDocument(language);
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.replace(document.uri, new vscode.Range(
      document.positionAt(0), document.positionAt(document.getText().length),
    ), source);
    if (!await vscode.workspace.applyEdit(workspaceEdit)) return undefined;
    const edits = await vscode.commands.executeCommand(
      'vscode.executeFormatDocumentProvider', document.uri, options,
    );
    if (!Array.isArray(edits) || edits.length === 0) return source;
    return applyTextEdits(document, source, edits);
  } catch {
    // An unavailable embedded formatter must not prevent ordinary MDR format.
    return undefined;
  }
}

function activeMdrEditor() {
  const editor = vscode.window.activeTextEditor;
  return editor?.document.languageId === 'mdr' ? editor : undefined;
}

function activate(context) {
  const provider = vscode.languages.registerDocumentFormattingEditProvider('mdr', {
    async provideDocumentFormattingEdits(document, options) {
      try {
        const source = document.getText();
        const mdrFormatted = format(source);
        const formatted = await formatEmbedded(mdrFormatted,
          (language, content) => formatLanguage(language, content, options));
        if (source === formatted) return [];
        return [new vscode.TextEdit(
          new vscode.Range(document.positionAt(0), document.positionAt(source.length)),
          formatted,
        )];
      } catch (error) {
        vscode.window.showErrorMessage(`MDR format failed: ${error.message}`);
        return [];
      }
    },
  });
  const indentListItem = vscode.commands.registerCommand('mdr.indentListItem', async () => {
    const editor = activeMdrEditor();
    if (!editor) return;

    const lines = [...new Set(editor.selections.map((selection) => selection.active.line))];
    const listLines = lines.filter((line) =>
      EMPTY_LIST_ITEM_PATTERN.test(editor.document.lineAt(line).text));
    if (listLines.length === 0) return;

    await editor.edit((editBuilder) => {
      for (const line of listLines) {
        editBuilder.insert(new vscode.Position(line, 0), '  ');
      }
    });
  });

  const updateEmptyListContext = () => {
    const editor = activeMdrEditor();
    const selection = editor?.selection;
    const line = selection ? editor.document.lineAt(selection.active.line) : undefined;
    const isEmptyListLine = Boolean(editor
      && selection.isEmpty
      && EMPTY_LIST_ITEM_PATTERN.test(line.text));
    const isEmptyListItem = isEmptyListLine
      && selection.active.character === line.text.length;
    void vscode.commands.executeCommand('setContext', 'mdr.emptyListLine', isEmptyListLine);
    void vscode.commands.executeCommand('setContext', 'mdr.emptyListItem', isEmptyListItem);
  };

  const removeEmptyListItem = vscode.commands.registerCommand('mdr.removeEmptyListItem', async () => {
    const editor = activeMdrEditor();
    if (!editor) return;
    const line = editor.document.lineAt(editor.selection.active.line);
    if (!EMPTY_LIST_ITEM_PATTERN.test(line.text)) return;
    await editor.edit((editBuilder) => {
      editBuilder.delete(new vscode.Range(
        new vscode.Position(line.lineNumber, line.firstNonWhitespaceCharacterIndex),
        line.range.end,
      ));
    });
    updateEmptyListContext();
  });

  const activeEditorListener = vscode.window.onDidChangeActiveTextEditor(updateEmptyListContext);
  const selectionListener = vscode.window.onDidChangeTextEditorSelection(updateEmptyListContext);
  const documentListener = vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document === vscode.window.activeTextEditor?.document) updateEmptyListContext();
  });
  updateEmptyListContext();
  context.subscriptions.push(
    provider,
    indentListItem,
    removeEmptyListItem,
    activeEditorListener,
    selectionListener,
    documentListener,
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
