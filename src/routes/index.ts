import { ImportResolveState, ProcessedImportState } from "../types";

export function storeResolveState(state: ImportResolveState): { key: string } {
  const key = toResolveKey();
  window.localStorage.setItem(key, JSON.stringify(state));
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
  window.localStorage.setItem(key, JSON.stringify(state));
  return { key };
}

export function stateFromResolveKey(
  key: string
): ImportResolveState | undefined {
  const state = window.localStorage.getItem(key);
  if (state == null) {
    return undefined;
  }

  return JSON.parse(state);
}
export function stateFromProcessedKey(
  key: string
): ProcessedImportState | undefined {
  const state = window.localStorage.getItem(key);
  if (state == null) {
    return undefined;
  }

  return JSON.parse(state);
}
