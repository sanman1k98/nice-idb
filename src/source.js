/** @import { OpenCursorOptions } from '#types' */
import { ReadOnlyCursor, ReadOnlyKeyCursor } from './cursor.js';
import { DBRequest } from './req.js';
import { cursorArgs } from './util.js';
import { Wrapper } from './wrap.js';

/**
 * Methods shared by both object stores and indexes.
 * @template {IDBIndex | IDBObjectStore} T
 * @extends {Wrapper<T>}
 */
export class ReadOnlySource extends Wrapper {
	/**
	 * @type {IDBTransactionMode}
	 */
	static mode = 'readonly';

	/**
	 * The name of this source.
	 */
	get name() { return super.target.name; }

	/**
	 * The key path of this source.
	 */
	get keyPath() { return super.target.keyPath; }

	/**
	 * Get the total number of records in this source, or the number of ones
	 * that match the provided key or key range.
	 * @param {IDBValidKey | IDBKeyRange} [key]
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/count}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBIndex/count}
	 */
	count(key) {
		const req = super.target.count(key);
		return DBRequest.promisify(req);
	}

	/**
	 * Get the record selected by the given key.
	 * @param {IDBValidKey | IDBKeyRange} query
	 */
	get(query) {
		const req = super.target.get(query);
		return DBRequest.promisify(req);
	}

	/**
	 * Get all records in this source matching the specified key range, or all
	 * the records in this source if no argument is provided.
	 * @param {IDBValidKey | IDBKeyRange | null | undefined} [query]
	 * @param {number | undefined} [count]
	 */
	getAll(query, count) {
		const req = super.target.getAll(query, count);
		return DBRequest.promisify(req);
	}

	/**
	 * Get all keys for all records in this source matching the specified key
	 * range, or all keys in this source if no argument is provided.
	 * @param {IDBValidKey | IDBKeyRange | null | undefined} [query]
	 * @param {number | undefined} [count]
	 */
	getAllKeys(query, count) {
		const req = super.target.getAllKeys(query, count);
		return DBRequest.promisify(req);
	}

	/**
	 * Get the first key in this source that matches the given key range.
	 * @param {IDBValidKey | IDBKeyRange} key
	 */
	getKey(key) {
		const req = super.target.getKey(key);
		return DBRequest.promisify(req);
	}

	/**
	 * Open a cursor.
	 * @param {OpenCursorOptions | undefined} [opts]
	 */
	cursor(opts) {
		const args = cursorArgs(opts);
		const req = super.target.openCursor(...args);
		return new ReadOnlyCursor(req);
	}

	/**
	 * Open a read-only key cursor.
	 * @param {OpenCursorOptions | undefined} [opts]
	 */
	keyCursor(opts) {
		const args = cursorArgs(opts);
		const req = super.target.openKeyCursor(...args);
		return new ReadOnlyKeyCursor(req);
	}

	[Symbol.asyncIterator]() { return this.cursor(); }
}
