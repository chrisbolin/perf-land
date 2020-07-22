import { SITES_PATH } from "./constants";

interface Item {
  kind?: string;
  name: string;
}

interface Results {
  items?: Item[];
}

export function digest(results: Results): string[] {
  if (!results.items) return [];
  return results.items.flatMap(digestItem);
}

function digestItem(item: Item) {
  if (!item || item.kind !== "storage#object") return [];
  return [storageNameToId(item.name)];
}

function storageNameToId(storageName: string) {
  return storageName
    .replace(SITES_PATH, "")
    .replace("/", "")
    .replace(".json", "");
}
