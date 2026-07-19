function unquote(value) {
  return value.trim().replace(/^("|')(.*)\1$/, '$2');
}

function parseFrontmatter(source) {
  const newline = '(?:\\r\\n|\\n|\\r)';
  const match = new RegExp(`^(?:\\uFEFF)?---${newline}([\\s\\S]*?)${newline}---(?:${newline}|$)`)
    .exec(source);
  if (!match) return { attributes: {}, body: source };

  const attributes = {};
  const breadcrumbs = [];
  const scripts = [];
  let currentBreadcrumb;
  let currentList;
  for (const line of match[1].split(/\r\n|\n|\r/)) {
    const property = /^([\w-]+):\s*(.*)$/.exec(line);
    if (property) {
      const [, key, value] = property;
      if (key === 'title' || key === 'layout') attributes[key] = unquote(value);
      currentList = value === '' ? key : undefined;
      continue;
    }
    const scriptValue = /^\s*-\s+(.+)$/.exec(line);
    if (currentList === 'scripts' && scriptValue) {
      scripts.push(unquote(scriptValue[1]));
      continue;
    }
    const breadcrumbValue = /^\s*-\s+(href|label):\s*(.*)$/.exec(line);
    if (breadcrumbValue) {
      const [, key, value] = breadcrumbValue;
      currentBreadcrumb ??= {};
      currentBreadcrumb[key] = unquote(value);
      if (currentBreadcrumb.href && currentBreadcrumb.label) {
        breadcrumbs.push(currentBreadcrumb);
        currentBreadcrumb = undefined;
      }
      continue;
    }
    const breadcrumbProperty = /^\s+(href|label):\s*(.*)$/.exec(line);
    if (breadcrumbProperty && currentBreadcrumb) {
      const [, key, value] = breadcrumbProperty;
      currentBreadcrumb[key] = unquote(value);
      if (currentBreadcrumb.href && currentBreadcrumb.label) {
        breadcrumbs.push(currentBreadcrumb);
        currentBreadcrumb = undefined;
      }
    }
  }
  if (breadcrumbs.length > 0) attributes.breadcrumbs = breadcrumbs;
  if (scripts.length > 0) attributes.scripts = scripts;
  return { attributes, body: source.slice(match[0].length) };
}

module.exports = { parseFrontmatter };
