/** @import { NiceIDBErrorInfo } from './util.js' */
import { NiceIDBObjectStore } from './store.js';
import { NiceIDBTransaction } from './tx.js';
import { getStrings, promisify } from './util.js';

/** @typedef {import('#types').Database} Database */

/**
 * @callback NiceIDBUpgradeCallback
 * @param {NiceIDB} db - A database instance created from the result of the IDBOpenDBRequest.
 * @param {NiceIDBTransaction} tx - Any "upgrade transaction" instance created from the IDBOpenDBRequest with the `mode` set to "versionchange".
 * @param {IDBVersionChangeEvent} event - A reference to the IDBVersionChangeEvent.
 * @returns {void | Promise<void>}
 */

/**
 * @implements {Database}
 */
export class NiceIDB {
	/** @type {IDBDatabase} */
	#db;
	/** @type {string} */
	name;
	/** @type {number} */
	version;

	/**
	 * @param {IDBDatabase} db - The database instance to wrap.
	 */
	constructor(db) {
		this.#db = db;
		this.name = db.name;
		this.version = db.version;
	}

	/**
	 * List of object stores in the database.
	 * @see {@link IDBDatabase.prototype.objectStoreNames}
	 */
	get stores() {
		return getStrings(this.#db.objectStoreNames);
	}

	/**
	 * List of object stores in the database.
	 * @see {@link IDBDatabase.prototype.objectStoreNames}
	 */
	get storeNames() {
		return getStrings(this.#db.objectStoreNames);
	}

	/**
	 * @param {keyof IDBDatabaseEventMap} type
	 * @param {(this: IDBDatabase, ev: Event | IDBVersionChangeEvent) => any} listener
	 * @param {boolean | AddEventListenerOptions} options
	 */
	addEventListener(type, listener, options) {
		return this.#db.addEventListener(type, listener, options);
	}

	/**
	 * @param {keyof IDBDatabaseEventMap} type
	 * @param {(this: IDBDatabase, ev: Event | IDBVersionChangeEvent) => any} listener
	 * @param {boolean | EventListenerOptions} options
	 */
	removeEventListener(type, listener, options) {
		return this.#db.removeEventListener(type, listener, options);
	}

	/**
	 * Create a new object store.
	 * @param {string} name
	 * @param {IDBObjectStoreParameters} [options]
	 * @returns {NiceIDBObjectStore} An object store instance.
	 */
	createObjectStore(name, options) {
		const store = this.#db.createObjectStore(name, options);
		return new NiceIDBObjectStore(store);
	}

	/**
	 * @param {string} name
	 */
	deleteObjectStore(name) {
		return this.#db.deleteObjectStore(name);
	}

	/**
	 * Create a transaction instance.
	 *
	 * @example
	 *
	 * ```ts
	 * using tx = db.transaction('items');
	 * const items = tx.store('items');
	 * const count = await items.count();
	 * ```
	 *
	 * @param {string | string[]} stores - Name of stores include in the scope of the transaction.
	 * @param {IDBTransactionMode} [mode] - Defaults to "readonly"
	 * @param {IDBTransactionOptions} [options] - Defaults to `{ durability: "default" }`
	 * @returns {NiceIDBTransaction} A transaction instance.
	 */
	transaction(stores, mode, options) {
		const tx = this.#db.transaction(stores, mode, options);
		return new NiceIDBTransaction(tx);
	}

	/**
	 * Convenience method to access a single object store.
	 *
	 * @param {string} name - Name of the object store.
	 * @param {IDBTransactionMode} [mode] - The transaction mode to access the object store; defaults to "readonly".
	 * @returns {NiceIDBObjectStore} The object store instance.
	 */
	store(name, mode) {
		const tx = this.#db.transaction(name, mode);
		const store = tx.objectStore(name);
		return new NiceIDBObjectStore(store);
	}

	close() {
		this.#db.close();
	}

	[Symbol.dispose]() {
		this.#db.close();
	}

	/**
	 * Compare two keys.
	 * @param {IDBValidKey} a
	 * @param {IDBValidKey} b
	 * @returns {-1 | 0 | 1} Comparison result.
	 * @see {@link window.indexedDB.cmp}
	 */
	static compare(a, b) {
		return /** @type {-1 | 0 | 1} */(window.indexedDB.cmp(a, b));
	}

	/**
	 * Get the names and versions of all available databases.
	 * @see {@link window.indexedDB.databases}
	 */
	static async databases() {
		return window.indexedDB.databases();
	}

	/**
	 * Delete a database.
	 * @param {string} name
	 * @returns {Promise<null>} A Promise that resolves to `null` if successful.
	 */
	static async delete(name) {
		return promisify(window.indexedDB.deleteDatabase(name)).then(() => null);
	}

	/**
	 * Open a database.
	 * @param {string} name - Name of the database.
	 * @param {number} [version] - A positive integer. If ommitted and the database already exists, this method will open a connection to it.
	 * @param {NiceIDBUpgradeCallback} [upgradeHandler] - An optional callback to handle the "upgradeneeded" event.
	 * @returns {Promise<NiceIDB>} A Promise that resolves to a database instance.
	 */
	static async open(name, version, upgradeHandler) {
		/** @type {IDBOpenDBRequest} */
		const request = window.indexedDB.open(name, version);
		/** @type {(event: IDBVersionChangeEvent) => void} */
		let handleUpgrade;
		/** @type {NiceIDB} */
		let db;

		if (upgradeHandler) {
			handleUpgrade = (event) => {
				db = new NiceIDB(request.result);
				const tx = new NiceIDBTransaction(/** @type {IDBTransaction} */(request.transaction));
				upgradeHandler(db, tx, event);
			};
			request.addEventListener('upgradeneeded', handleUpgrade);
		}

		return new Promise((resolve, reject) => {
			/** @type {() => void} */
			let unlisten;

			/** @type {EventListener} */
			const handleSuccess = () => {
				unlisten();
				resolve(db ?? new NiceIDB(request.result));
			};

			/** @type {EventListener} */
			const handleFailure = (event) => {
				unlisten();
				const { error, source, transaction } = request;
				/** @satisfies {NiceIDBErrorInfo} */
				const cause = { error, event, request, source, transaction };
				reject(new Error('Failed to open database', { cause }));
			};

			unlisten = () => {
				request.removeEventListener('success', handleSuccess);
				request.removeEventListener('error', handleFailure);
				request.removeEventListener('blocked', handleFailure);
				request.removeEventListener('upgradeneeded', handleUpgrade);
			};

			request.addEventListener('success', handleSuccess);
			request.addEventListener('error', handleFailure);
			request.addEventListener('blocked', handleFailure);
			request.addEventListener('upgradeneeded', handleUpgrade);
		});
	}
}
