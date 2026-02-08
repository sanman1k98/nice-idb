/** @import { OpenCursorOptions } from './util.js' */
import { ReadOnlyCursor, ReadOnlyKeyCursor } from './cursor';
import { DBRequest } from './req';
import { cursorArgs } from './util.js';

/**
 * @template {IDBObjectStore | IDBIndex} T
 */
export class ReadOnlySource {
	/** @type {T} */ #target;

	get name() { return this.#target.name; }

	get keyPath() { return this.#target.keyPath; }

	get target() { return this.#target; }

	get mode() {
		return this.#target instanceof IDBIndex
			? this.#target.objectStore.transaction.mode
			: this.#target.transaction.mode;
	}

	/**
	 * @param {T} source
	 */
	constructor(source) {
		this.#target = source;
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange} [key]
	 */
	count(key) {
		const req = this.#target.count(key);
		return DBRequest.wrap(req);
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange} query
	 */
	get(query) {
		const req = this.#target.get(query);
		return DBRequest.wrap(req);
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange | null | undefined} [query]
	 * @param {number | undefined} [count]
	 */
	getAll(query, count) {
		const req = this.#target.getAll(query, count);
		return DBRequest.wrap(req);
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange | null | undefined} [query]
	 * @param {number | undefined} [count]
	 */
	getAllKeys(query, count) {
		const req = this.#target.getAllKeys(query, count);
		return DBRequest.wrap(req);
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange} key
	 */
	getKey(key) {
		const req = this.#target.getKey(key);
		return DBRequest.wrap(req);
	}

	/**
	 * @param {OpenCursorOptions | undefined} [opts]
	 */
	cursor(opts) {
		const args = cursorArgs(opts);
		const req = this.#target.openCursor(...args);
		return new ReadOnlyCursor(req);
	}

	/**
	 * @param {OpenCursorOptions | undefined} [opts]
	 */
	keyCursor(opts) {
		const args = cursorArgs(opts);
		const req = this.#target.openKeyCursor(...args);
		return new ReadOnlyKeyCursor(req);
	}

	/**
	 * @param {OpenCursorOptions | undefined} [opts]
	 */
	async* iter(opts) {
		yield* this.cursor(opts);
	}

	/**
	 * @param {OpenCursorOptions | undefined} [opts]
	 */
	async* iterKeys(opts) {
		yield* this.keyCursor(opts);
	}

	[Symbol.asyncIterator]() { return this.cursor(); }
}
