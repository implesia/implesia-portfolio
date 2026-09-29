const listeners = new Set<() => void>();

export function emitFlash() {
  listeners.forEach((listener) => listener());
}

export function onFlash(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
