/** @import { OpenCursorOptions } from './util.js' */
import { ReadWriteCursor } from './cursor.js';
import { ReadOnlyIndex, ReadWriteIndex } from './idx.js';
import { DBRequest } from './req.js';
import { ReadOnlySource } from './source.js';
import { cursorArgs, toStrings } from './util.js';

/**
 * @extends {ReadOnlySource<IDBObjectStore>}
 */
export class ReadOnlyStore extends ReadOnlySource {
	get autoIncrement() { return super.target.autoIncrement; }

	get indexNames() { return toStrings(super.target.indexNames); }

	/**
	 * @param {string} name
	 */
	index(name) {
		const idx = super.target.index(name);
		return new ReadOnlyIndex(idx);
	}
}

export class ReadWriteStore extends ReadOnlyStore {
	/**
	 * @param {IDBObjectStore} store
	 */
	static wrap(store) {
		return new this(store);
	}

	/**
	 * @param {any} value
	 * @param {IDBValidKey | undefined} [key]
	 */
	add(value, key) {
		const req = super.target.add(value, key);
		return DBRequest.promisify(req);
	}

	clear() {
		const req = super.target.clear();
		return DBRequest.promisify(req);
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange} key
	 */
	delete(key) {
		const req = super.target.delete(key);
		return DBRequest.promisify(req);
	}

	/**
	 * @param {any} value
	 * @param {IDBValidKey | undefined} [key]
	 */
	put(value, key) {
		const req = super.target.put(value, key);
		return DBRequest.promisify(req);
	}

	/**
	 * @param {OpenCursorOptions | undefined} [opts]
	 * @override
	 */
	cursor(opts) {
		const args = cursorArgs(opts);
		const req = super.target.openCursor(...args);
		return new ReadWriteCursor(req);
	}

	/**
	 * @param {string} name
	 * @override
	 */
	index(name) {
		const idx = super.target.index(name);
		return new ReadWriteIndex(idx);
	}
}

export class UpgradableStore extends ReadWriteStore {
	/**
	 * @param {string} name
	 * @param {string | string[]} keyPath
	 * @param {IDBIndexParameters | undefined} [options]
	 */
	createIndex(name, keyPath, options) {
		const idx = super.target.createIndex(name, keyPath, options);
		return new ReadWriteIndex(idx);
	}

	/**
	 * @param {string} name
	 */
	deleteIndex(name) {
		return super.target.deleteIndex(name);
	}
}

export const readonly = (/** @type {IDBObjectStore} */ store) => new ReadOnlyStore(store);
export const readwrite = (/** @type {IDBObjectStore} */ store) => new ReadWriteStore(store);
export const versionchange = (/** @type {IDBObjectStore} */ store) => new UpgradableStore(store);

export default { readonly, readwrite, versionchange };
