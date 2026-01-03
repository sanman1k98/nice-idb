import { NiceIDBIndex } from './idx.js';
import { getAsyncIterableRecords, getStrings, promisify } from './util.js';

/** @typedef {import('#types').ObjectStore} ObjectStore */

/**
 * @implements {ObjectStore}
 */
export class NiceIDBObjectStore {
	/** @type {IDBObjectStore} */
	#store;
	/** @type {boolean} */
	autoIncrement;
	/** @type {string | string[] | null} */
	keyPath;
	/** @type {string} */
	name;
	/** @type {IDBTransaction} */
	transaction;

	/**
	 * @param {IDBObjectStore} store - The object store instance to wrap.
	 */
	constructor(store) {
		this.#store = store;

		this.autoIncrement = store.autoIncrement;
		this.keyPath = store.keyPath;
		this.name = store.name;
		this.transaction = store.transaction;
	}

	/**
	 * List of index names for this store.
	 * @see {@link IDBObjectStore.prototype.indexNames}
	 */
	get indexes() {
		return getStrings(this.#store.indexNames);
	}

	/**
	 * @param {string} name - Name of the index.
	 * @param {string | string[]} keyPath - The key path.
	 * @param {IDBIndexParameters} [options] - Additional options to configure the index.
	 * @returns {NiceIDBIndex} The newly created index.
	 */
	createIndex(name, keyPath, options) {
		const idx = this.#store.createIndex(name, keyPath, options);
		return new NiceIDBIndex(idx);
	}

	/**
	 * @param {string} name - Name of the index.
	 */
	deleteIndex(name) {
		return this.#store.deleteIndex(name);
	}

	/**
	 * @param {any} value
	 * @param {IDBValidKey} [key]
	 */
	async add(value, key) {
		return promisify(this.#store.add(value, key));
	}

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
	 * @param {import('./util').CursorOptions} opts
	 */
	async* iter(opts) {
		yield* getAsyncIterableRecords(this.#store, opts, true);
	}

	/**
	 * @param {import('./util').CursorOptions} opts
	 */
	async* iterKeys(opts) {
		yield* getAsyncIterableRecords(this.#store, opts, false);
	}

	async* [Symbol.asyncIterator]() {
		yield* getAsyncIterableRecords(this.#store);
	}
}
