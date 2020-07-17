const { SITES_PATH } = require("./constants");

function digest(data) {
  if (!data.items) return [];
  return data.items.map(digestItem).filter(Boolean);
}

function digestItem(item) {
  if (!item || item.kind !== "storage#object") return false;
  return storageNameToId(item.name);
}

function storageNameToId(storageName) {
  return storageName
    .replace(SITES_PATH, "")
    .replace("/", "")
    .replace(".json", "");
}

module.exports = {
  digest,
};
