import { ImportResolveState, ProcessedImportState } from "../types";

function setItem(key: string, val: {}) {
  (window as any)["_app"] = (window as any)["_app"] || {};
  (window as any)["_app"][key] = val;
}

function getItem(key: string) {
  (window as any)["_app"] = (window as any)["_app"] || {};
  return (window as any)["_app"][key];
}

export function storeResolveState(state: ImportResolveState): { key: string } {
  const key = toResolveKey();
  setItem(key, state);
  return { key };
}

function toResolveKey(): string {
  return `/_/resolve`;
}

function toProcessedKey(): string {
  return `/bundle`;
}

export function storeProcessedState(
  state: ProcessedImportState
): { key: string } {
  const key = toProcessedKey();
  setItem(key, state);
  return { key };
}

export function stateFromResolveKey(
  key: string
): ImportResolveState | undefined {
  const state = getItem(key);
  if (state == null) {
    return undefined;
  }

  return state;
}
export function stateFromProcessedKey(
  key: string
): ProcessedImportState | undefined {
  const state = getItem(key);
  if (state == null) {
    return undefined;
  }

  return state;
}
