/**
 * src/lib/index.ts
 * Barrel for shared library utilities.
 *
 * NOTE: Individual files are also directly accessible via tsconfig path aliases:
 *   @/lib/mock-data       -> src/lib/mock-data.ts
 *   @/lib/preferences     -> src/lib/preferences.ts
 *   @/lib/use-persistent-collection -> src/lib/use-persistent-collection.ts
 */

export * from "./mock-data";
export * from "./preferences";
export { usePersistentCollection } from "./use-persistent-collection";
