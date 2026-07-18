const vscode = require('vscode');
const { format } = require('mdr-compiler');

const EMPTY_LIST_ITEM_PATTERN = /^\s*[+-]\s*$/;

function activeMdrEditor() {
  const editor = vscode.window.activeTextEditor;
  return editor?.document.languageId === 'mdr' ? editor : undefined;
}

function activate(context) {
  const provider = vscode.languages.registerDocumentFormattingEditProvider('mdr', {
    provideDocumentFormattingEdits(document) {
      try {
        const source = document.getText();
        const formatted = format(source);
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
