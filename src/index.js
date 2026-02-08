import { Database } from './db.js';
import { DBRequest } from './req.js';
import { cursorArgs, getAllArgs, keyRange } from './util.js';

export class NiceIDB {
	static cmp = indexedDB.cmp;
	static databases = indexedDB.databases;

	/**
	 * @param {string} name
	 * @returns {DBRequest<IDBOpenDBRequest>} An awaitable request.
	 */
	static delete(name) {
		const req = indexedDB.deleteDatabase(name);
		return new DBRequest(req);
	}

	static init = Database.init;

	static keyRange = keyRange;
	static cursorArgs = cursorArgs;
	static getAllArgs = getAllArgs;
}

/**
 * @typedef {import('./db.js').DefineDatabaseVersions} DefineDatabaseVersions
 * @typedef {import('./db.js').DefineVersionedUpgrade} DefineVersionedUpgrade
 * @typedef {import('./db.js').UpgradeCallback} UpgradeCallback
 * @typedef {import('./db.js').UpgradableDatabase} UpgradableDatabase
 */

/**
 * @typedef {import('./util.js').KeyRangeOptions} KeyRangeOptions
 * @typedef {import('./util.js').OpenCursorOptions} OpenCursorOptions
 * @typedef {import('./util.js').SourceGetAllOptions} SourceGetAllOptions
 */

export {
	Cursor as NiceIDBCursor,
	IndexCursor as NiceIDBIndexCursor,
} from './cursor.js';
export { Database as NiceIDBDatabase } from './db.js';
export { Index as NiceIDBIndex } from './idx.js';
export { DBRequest as NiceIDBRequest } from './req.js';
export { Store as NiceIDBStore } from './store.js';
export { Transaction as NiceIDBTransaction } from './tx.js';
export { cursorArgs, getAllArgs, keyRange } from './util.js';
