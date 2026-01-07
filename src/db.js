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
 *
 * @callback DefineVersionChanges
 * @param {number} version - The version number.
 * @param {() => void | Promise<void>} changes - The changes to make for this version of the database.
 * @returns {void}
 */

/**
 * @callback DefineDatabaseVersions
 * @param {DefineVersionChanges} defineVersion - A callback to define sets of changes to the database.
 * @param {NiceIDB} db - A database instance.
 * @param {NiceIDBTransaction} tx - The "upgrade transaction" instance.
 * @param {IDBVersionChangeEvent} event - The `IDBVersionChangeEvent`.
 * @returns {void | Promise<void>}
 */

/**
 * @typedef {'ro' | 'rw' | 'readonly' | 'readwrite'} TransactionMode
 */

/**
 * Manage and connect to indexedDB databases.
 *
 * ```ts
 * import { NiceIDB } from 'nice-idb';
 *
 * // Open a connection a database with a callback to define its structure.
 * const db = await NiceIDB.open('database', 1, (db) => {
 *   const store = db.createObjectStore('messages', { autoincrement: true });
 *   store.createIndex('message', 'message', { unique: false });
 * });
 *
 * // Convenience method to create a transaction and access an object store.
 * const messages = db.store('messages', 'readwrite');
 * // Make request to add a value.
 * await messages.add({ message: 'Hello world!' });
 * ```
 *
 * @implements {Database}
 * @implements {Disposable}
 */
export class NiceIDB {
	/** @type {IDBDatabase} */
	#db;

	/**
	 * @param {IDBDatabase} db - The database instance to wrap.
	 */
	constructor(db) {
		this.#db = db;
	}

	get name() {
		return this.#db.name;
	}

	get version() {
		return this.#db.version;
	}

	/**
	 * List of object stores in the database.
	 * @deprecated Use `NiceIDB.prototype.storeNames` instead.
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
	createStore(name, options) {
		const store = this.#db.createObjectStore(name, options);
		return new NiceIDBObjectStore(store);
	}

	/**
	 * @param {string} name
	 */
	deleteStore(name) {
		return this.#db.deleteObjectStore(name);
	}

	/**
	 * Create a new object store.
	 * @deprecated
	 * @param {string} name
	 * @param {IDBObjectStoreParameters} [options]
	 * @returns {NiceIDBObjectStore} An object store instance.
	 */
	createObjectStore(name, options) {
		const store = this.#db.createObjectStore(name, options);
		return new NiceIDBObjectStore(store);
	}

	/**
	 * @deprecated
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
	 * @param {TransactionMode} [mode] - Defaults to "readonly"
	 * @param {IDBTransactionOptions} [options] - Defaults to `{ durability: "default" }`
	 * @returns {NiceIDBTransaction} A transaction instance.
	 */
	transaction(stores, mode, options) {
		if (mode === 'ro')
			mode = 'readonly';
		else if (mode === 'rw')
			mode = 'readwrite';
		const tx = this.#db.transaction(stores, mode, options);
		return new NiceIDBTransaction(tx);
	}

	/**
	 * Convenience method to access a single object store.
	 *
	 * @param {string} name - Name of the object store.
	 * @param {TransactionMode} [mode] - The transaction mode to access the object store; defaults to "readonly".
	 * @param {IDBTransactionOptions} [opts] - Defaults to `{ durability: "default" }`
	 * @returns {NiceIDBObjectStore} The object store instance.
	 */
	store(name, mode, opts) {
		if (mode === 'ro')
			mode = 'readonly';
		else if (mode === 'rw')
			mode = 'readwrite';
		const tx = this.#db.transaction(name, mode, opts);
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
	 * @returns {Promise<IDBDatabaseInfo[]>} A promise that resolves to the list of databases.
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
	 * @param {string} name - The name of the database to define the schema for.
	 * @param {DefineDatabaseVersions} defineVersions - A callback defining versions
	 * @returns {Promise<NiceIDB>} The upgraded database instance.
	 */
	static async define(name, defineVersions) {
		const { version: currentVersion = 0 }
			= await window.indexedDB.databases()
				.then(dbs => dbs.find(db => db.name === name))
				?? { version: 0 };

		/** @type {NiceIDB | undefined} */ let db;
		/** @type {NiceIDBTransaction | undefined} */ let tx;
		/** @type {IDBVersionChangeEvent | undefined} */ let event;

		const dbProxy = new Proxy(Object.create(NiceIDB.prototype), {
			get(_, prop) {
				if (!db)
					throw new Error('Can only use database within `defineVersion` callbacks');
				const value = Reflect.get(db, prop);
				if (typeof value === 'function')
					return value.bind(db);
			},
		});

		const txProxy = new Proxy(Object.create(NiceIDBTransaction.prototype), {
			get(_, prop) {
				if (!tx)
					throw new Error('Can only use transaction within `defineVersion` callbacks');
				const value = Reflect.get(tx, prop);
				if (typeof value === 'function')
					return value.bind(tx);
			},
		});

		const eventProxy = new Proxy(Object.create(IDBVersionChangeEvent.prototype), {
			get(_, prop) {
				if (!event)
					throw new Error('Can only use event within `defineVersion` callbacks');
				return Reflect.get(event, prop);
			},
		});

		/** @type {(() => void | Promise<void>)[]} */
		const allChanges = [];
		let highestVersion = 0;

		/** @satisfies {DefineVersionChanges} */
		const defineVersion = (version, changes) => {
			highestVersion++;
			if (version !== highestVersion)
				throw new RangeError('Versions must be defined in-order and in increments of 1');
			allChanges.push(changes);
		};

		// Invoke the callback given as an argument
		// console.log(`Calling "defineVersions"`);
		defineVersions(defineVersion, dbProxy, txProxy, eventProxy);

		const versionDelta = highestVersion - currentVersion;

		if (versionDelta < 0) {
			throw new RangeError('Missing version changes; current version is higher than highest defined version', {
				cause: { currentVersion, highestVersion },
			});
		}

		const request = window.indexedDB.open(name, highestVersion);

		return new Promise((resolve, reject) => {
			/** @type {() => void} */
			let unlisten;

			/** @satisfies {((this: IDBOpenDBRequest, event: IDBVersionChangeEvent) => void) | undefined} */
			const handleUpgrade = (versionDelta > 0 || undefined) && async function (ev) {
				// Assign values to these variables so that the proxies can be used.
				event = ev;
				db = new NiceIDB(request.result);
				tx = new NiceIDBTransaction(/** @type {IDBTransaction} */(request.transaction));

				const pendingChanges = allChanges
					.slice(currentVersion)
					.map(async (cb, i) => {
						return await new Promise(resolve => resolve(cb()))
							.catch((error) => {
								throw new Error('Failed to define version changes', {
									cause: { version: i + 1, error },
								});
							});
					});

				await Promise.all(pendingChanges).catch(reject);
			};

			/** @satisfies {EventListener} */
			const handleSuccess = () => {
				unlisten();
				resolve(db ?? new NiceIDB(request.result));
			};

			/** @satisfies {EventListener} */
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
				handleUpgrade && request.removeEventListener('upgradeneeded', handleUpgrade);
			};

			request.addEventListener('success', handleSuccess);
			request.addEventListener('error', handleFailure);
			request.addEventListener('blocked', handleFailure);
			handleUpgrade && request.addEventListener('upgradeneeded', handleUpgrade);
		});
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
