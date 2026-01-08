/**
 * @typedef {import('./db.js').NiceIDBUpgradeCallback} NiceIDBUpgradeCallback
 * @typedef {import('./db.js').DefineDatabaseSchema} DefineDatabaseSchema
 * @typedef {import('./db.js').DefineVersionedUpgrade} DefineVersionedUpgrade
 * @typedef {import('./db.js').UpgradeCallback} UpgradeCallback
 * @typedef {import('./util.js').NiceIDBError} NiceIDBError
 * @typedef {import('./util.js').NiceIDBErrorInfo} NiceIDBErrorInfo
 * @typedef {import('./util.js').KeyRangeOptions} KeyRangeOptions
 * @typedef {import('./util.js').CursorOptions} CursorOptions
 */

export { NiceIDB } from './db.js';
export {
	getAsyncIterableRecords,
	isNiceIDBError,
	keyRange,
	parseError,
	promisify,
} from './util.js';
