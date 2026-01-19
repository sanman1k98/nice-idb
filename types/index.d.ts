export { NiceIDB } from "./db.js";
export type DefineDatabaseVersions = import("./db.js").DefineDatabaseVersions;
export type DefineVersionedUpgrade = import("./db.js").DefineVersionedUpgrade;
export type UpgradeCallback = import("./db.js").UpgradeCallback;
export type NiceIDBTransaction = import("./tx.js").NiceIDBTransaction;
export type NiceIDBStore = import("./store.js").NiceIDBStore;
export type NiceIDBIndex = import("./idx.js").NiceIDBIndex;
export type NiceIDBError = import("./util.js").NiceIDBError;
export type NiceIDBErrorInfo = import("./util.js").NiceIDBErrorInfo;
export type KeyRangeOptions = import("./util.js").KeyRangeOptions;
export type CursorOptions = import("./util.js").CursorOptions;
export { getAsyncIterableEvents, getAsyncIterableRecords, isNiceIDBError, keyRange, parseError, promisify } from "./util.js";
//# sourceMappingURL=index.d.ts.map