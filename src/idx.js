import { getAsyncIterableRecords, promisify } from './util.js';

/** @typedef {import('#types').Index} Index */

/**
 * @implements {Index}
 * @implements {AsyncIterable<IDBCursorWithValue>}
 */
export class NiceIDBIndex {
	/** @type {IDBIndex} */
	#idx;

	/** @param {IDBIndex} idx */
	constructor(idx) {
		this.#idx = idx;
	}

	get keyPath() {
		return this.#idx.keyPath;
	}

	get multiEntry() {
		return this.#idx.multiEntry;
	}

	get name() {
		return this.#idx.name;
	}

	get unique() {
		return this.#idx.unique;
	}

	/** @param {IDBValidKey | IDBKeyRange} [query] */
	async count(query) {
		return promisify(this.#idx.count(query));
	}

	/** @param {IDBValidKey | IDBKeyRange} query */
	async get(query) {
		return promisify(this.#idx.get(query));
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange | null} [query]
	 * @param {number} [count]
	 */
	async getAll(query, count) {
		return promisify(this.#idx.getAll(query, count));
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange | null} [query]
	 * @param {number} [count]
	 */
	async getAllKeys(query, count) {
		return promisify(this.#idx.getAllKeys(query, count));
	}

	/** @param {IDBValidKey | IDBKeyRange} query */
	async getKey(query) {
		return promisify(this.#idx.getKey(query));
	}

	/**
	 * Traverse the index with an {@link IDBCursorWithValue} in a `for await ... of` loop.
	 *
	 * @example
	 *
	 * ```ts
	 * const store = db.tx('store-name', 'readonly').store('store-name');
	 * const index = store.index('index-name');
	 * for await (const cursor of index.iter({ dir: 'prev' })) {
	 *   const { key, value } = cursor;
	 *   console.log(key, value);
	 *   // `cursor.continue()` is automatically called.
	 * }
	 * ```
	 *
	 * @param {import('./util').CursorOptions} opts
	 * @returns {AsyncIterable<IDBCursorWithValue>} The cursor instance.
	 */
	async* iter(opts) {
		yield* getAsyncIterableRecords(this.#idx, opts, true);
	}

	/**
	 * Traverse the index's keys with an {@link IDBCursor} in a `for await ... of` loop.
	 *
	 * @see {@link NiceIDBIndex#iter}
	 *
	 * @param {import('./util').CursorOptions} opts
	 * @returns {AsyncIterable<IDBCursor>} The cursor instance.
	 */
	async* iterKeys(opts) {
		yield* getAsyncIterableRecords(this.#idx, opts, false);
	}

	async* [Symbol.asyncIterator]() {
		yield* getAsyncIterableRecords(this.#idx);
	}
}
