/**
 * @typedef {import('./db.js').DefineDatabaseVersions} DefineDatabaseVersions
 * @typedef {import('./db.js').DefineVersionedUpgrade} DefineVersionedUpgrade
 * @typedef {import('./db.js').UpgradeCallback} UpgradeCallback
 *
 * @typedef {import('./tx.js').NiceIDBTransaction} NiceIDBTransaction
 *
 * @typedef {import('./store.js').NiceIDBStore} NiceIDBStore
 *
 * @typedef {import('./idx.js').NiceIDBIndex} NiceIDBIndex
 *
 * @typedef {import('./util.js').NiceIDBError} NiceIDBError
 * @typedef {import('./util.js').NiceIDBErrorInfo} NiceIDBErrorInfo
 * @typedef {import('./util.js').KeyRangeOptions} KeyRangeOptions
 * @typedef {import('./util.js').CursorOptions} CursorOptions
 */

export { NiceIDB } from './db.js';
export {
	getAsyncIterableEvents,
	getAsyncIterableRecords,
	isNiceIDBError,
	keyRange,
	parseError,
	promisify,
} from './util.js';
