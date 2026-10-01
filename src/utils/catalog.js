// Mutations return a new catalog; no seed records or deletion tombstones.
export function upsertTool(catalog, tool, originalId = '') {
  const existing = catalog.find(item => item.id === tool.id);
  if (originalId !== tool.id && existing) {
    throw new Error('That URL slug already belongs to another tool.');
  }
  if (originalId && !catalog.some(item => item.id === originalId)) {
    throw new Error('The original listing no longer exists. Reload the catalog.');
  }
  const targetId = originalId || tool.id;
  const index = catalog.findIndex(item => item.id === targetId);
  const records = [...catalog];
  if (index < 0) records.push(tool);
  else records[index] = { ...records[index], ...tool };
  return records;
}

export function removeTool(catalog, id) {
  return catalog.filter(tool => tool.id !== id);
}
