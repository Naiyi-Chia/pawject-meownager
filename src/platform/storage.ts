/** All game persistence must use this boundary, never unprefixed localStorage. */
export function createGameStorage(storage: Storage, basePath: string) {
  const prefix = `pawject-meownager:${basePath === '/pawject-meownager/dev/' ? 'dev' : 'production'}:`;
  return {
    getItem(key: string) {
      return storage.getItem(prefix + key);
    },
    setItem(key: string, value: string) {
      storage.setItem(prefix + key, value);
    },
    removeItem(key: string) {
      storage.removeItem(prefix + key);
    },
  };
}

/** Lazy access keeps unavailable browser storage from blocking normal boot. */
export function getGameStorage() {
  return createGameStorage(window.localStorage, import.meta.env.BASE_URL);
}
