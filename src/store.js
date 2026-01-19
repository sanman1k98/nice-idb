import { NiceIDBIndex } from './idx.js';
import { getAsyncIterableRecords, getStrings, promisify } from './util.js';

/** @typedef {import('#types').ObjectStore} ObjectStore */

/**
 * @implements {ObjectStore}
 * @implements {AsyncIterable<IDBCursorWithValue>}
 */
export class NiceIDBStore {
	/** @type {IDBObjectStore} */ #store;

	/**
	 * @param {IDBObjectStore} store - The object store instance to wrap.
	 */
	constructor(store) {
		this.#store = store;
	}

	/**
	 * List of index names for this store.
	 * @deprecated
	 * @see {@link IDBObjectStore.prototype.indexNames}
	 */
	get indexes() {
		return getStrings(this.#store.indexNames);
	}

	get autoIncrement() {
		return this.#store.autoIncrement;
	}

	get keyPath() {
		return this.#store.keyPath;
	}

	get name() {
		return this.#store.name;
	}

	/**
	 * List of index names for this store.
	 * @see {@link IDBObjectStore.prototype.indexNames}
	 */
	get indexNames() {
		return getStrings(this.#store.indexNames);
	}

	/**
	 * Open a named index in the current store.
	 *
	 * @param {string} name
	 * @returns {NiceIDBIndex} An object for accessing the index.
	 */
	index(name) {
		const idx = this.#store.index(name);
		return new NiceIDBIndex(idx);
	}

	/**
	 * @param {any} value
	 * @param {IDBValidKey} [key]
	 */
	async add(value, key) {
		return promisify(this.#store.add(value, key));
	}

	/**
	 * Clear all records from the store.
	 *
	 * @returns {Promise<undefined>}
	 */
	async clear() {
		return promisify(this.#store.clear());
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange} [query]
	 */
	async count(query) {
		return promisify(this.#store.count(query));
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange} query
	 */
	async delete(query) {
		return promisify(this.#store.delete(query));
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange} query
	 */
	async get(query) {
		return promisify(this.#store.get(query));
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange | null} [query]
	 * @param {number} [count]
	 */
	async getAll(query, count) {
		return promisify(this.#store.getAll(query, count));
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange | null} [query]
	 * @param {number} [count]
	 */
	async getAllKeys(query, count) {
		return promisify(this.#store.getAllKeys(query, count));
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange} query
	 */
	async getKey(query) {
		return promisify(this.#store.getKey(query));
	}

	/**
	 * @param {any} value
	 * @param {IDBValidKey} [key]
	 */
	async put(value, key) {
		return promisify(this.#store.put(value, key));
	}

	/**
	 * Traverse the store with an {@link IDBCursorWithValue} in a `for await ... of` loop.
	 *
	 * @example
	 *
	 * ```ts
	 * const store = db.tx('store-name', 'readonly').store('store-name');
	 * for await (const cursor of store.iter({ dir: 'prev' })) {
	 *   const { key, value } = cursor;
	 *   console.log(key, value);
	 *   // `cursor.continue()` is automatically called.
	 * }
	 * ```
	 *
	 * @param {import('./util').CursorOptions} [opts]
	 * @returns {AsyncIterable<IDBCursorWithValue>} The cursor instance.
	 */
	async* iter(opts) {
		yield* getAsyncIterableRecords(this.#store, opts, true);
	}

	/**
	 * Traverse the store's keys with an {@link IDBCursor} in a `for await ... of` loop.
	 *
	 * @see {@link NiceIDBStore#iter}
	 *
	 * @param {import('./util').CursorOptions} [opts]
	 * @returns {AsyncIterable<IDBCursor>} The cursor instance.
	 */
	async* iterKeys(opts) {
		yield* getAsyncIterableRecords(this.#store, opts, false);
	}

	/**
	 * Shortcut for {@link NiceIDBStore#iter}.
	 *
	 * @example
	 *
	 * ```ts
	 * for await (const cursor of db.tx('store-name', 'readonly').store('store-name')) {
	 *   const { key, value } = cursor;
	 *   console.log(key, value);
	 * }
	 * ```
	 */
	async* [Symbol.asyncIterator]() {
		yield* getAsyncIterableRecords(this.#store);
	}

	/** An upgradable object store to be used within "upgrade transactions". */
	static Upgradable = class NiceIDBUpgradableStore extends NiceIDBStore {
		/** @type {IDBObjectStore} */ #store;

		/**
		 * @param {IDBObjectStore} store
		 * @param {IDBTransaction | null} tx
		 */
		constructor(store, tx) {
			if (!(tx instanceof IDBTransaction) || tx.mode !== 'versionchange')
				throw new TypeError('Expected an upgrade transaction');
			super(store);
			this.#store = store;
		}

		/**
		 * @param {string} name
		 * @param {string | string[]} keyPath
		 * @param {IDBIndexParameters | undefined} [options]
		 */
		createIndex(name, keyPath, options) {
			const idx = this.#store.createIndex(name, keyPath, options);
			return new NiceIDBIndex(idx);
		}

		/**
		 * @param {string} name
		 */
		deleteIndex(name) {
			return this.#store.deleteIndex(name);
		}
	};
}
