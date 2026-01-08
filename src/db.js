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
 * A callback that makes changes to the database like creating or deleting
 * object stores and indexes.
 * @callback UpgradeCallback
 * @returns {void | Promise<void>}
 */

/**
 * Defines the changes to the database for a specific version.
 * @callback DefineVersionedUpgrade
 * @param {number} versionNumber - A positive integer.
 * @param {UpgradeCallback} upgrade - A callback which, within its
 * scope, makes changes to the database.
 * @returns {void}
 */

/**
 * Defines all versions of the database, starting from version 1.
 * @callback DefineDatabaseSchema
 * @param {DefineVersionedUpgrade} defineVersion - Use to define each version
 * of the database by making changes to its schema.
 * @param {NiceIDB} db - The database instance to upgraded.
 * @param {NiceIDBTransaction} tx - The "upgrade transaction" instance.
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
	 * @param {DefineDatabaseSchema} defineSchema - A callback defining the database schema for each version of it.
	 * @returns {Promise<NiceIDB>} The upgraded database instance.
	 */
	static async define(name, defineSchema) {
		// Declare variables for our instances.
		/** @type {NiceIDB | undefined} */ let db;
		/** @type {NiceIDBTransaction | undefined} */ let tx;

		// Create proxies that will access our instances.

		const dbProxy = new Proxy(Object.create(NiceIDB.prototype), {
			get(_, prop) {
				if (!db)
					throw new ReferenceError('Can only use database within `defineVersion` callbacks');
				const value = Reflect.get(db, prop);
				if (typeof value === 'function')
					return value.bind(db);
			},
		});

		const txProxy = new Proxy(Object.create(NiceIDBTransaction.prototype), {
			get(_, prop) {
				if (!tx)
					throw new ReferenceError('Can only use transaction within `defineVersion` callbacks');
				const value = Reflect.get(tx, prop);
				if (typeof value === 'function')
					return value.bind(tx);
			},
		});

		/** @type {UpgradeCallback[]} */
		const allUpgrades = [];
		let highestDefinedVersion = 0;

		/** @satisfies {DefineVersionedUpgrade} */
		const defineVersion = (versionNumber, upgrade) => {
			if (!Number.isInteger(versionNumber))
				throw new TypeError('Expected integer for version number');
			if (typeof upgrade !== 'function')
				throw new TypeError('Expected function for upgrade callback', { cause: { type: typeof upgrade } });
			if (versionNumber !== highestDefinedVersion + 1) {
				throw new RangeError('Unexpected version number', {
					cause: { expected: highestDefinedVersion + 1, received: versionNumber },
				});
			}
			highestDefinedVersion++;
			allUpgrades.push(upgrade);
		};

		// Gather all the upgrade callbacks from each defined version.

		try {
			// Provide the database and transaction proxies as arguments.
			defineSchema(defineVersion, dbProxy, txProxy);
		} catch (error) {
			if (('isError' in Error && Error.isError(error)) || error instanceof Error) {
				throw new Error('Error defining schema', { cause: error });
			} else {
				throw new Error('Unknown error defining schema', { cause: error });
			}
		}

		const existing = await window.indexedDB.databases()
			.then(dbs => dbs.find(db => db.name === name));
		const existingVersion = existing?.version ?? 0;
		const versionDelta = highestDefinedVersion - existingVersion;

		// Check that all the previous versions of the database have been defined.
		if (versionDelta < 0) {
			throw new Error('Current version is greater than highest defined version', {
				cause: { existing: existingVersion, highestDefined: highestDefinedVersion },
			});
		}

		// Make a request to open the latest version.
		const request = window.indexedDB.open(name, highestDefinedVersion);

		return new Promise((resolve, reject) => {
			/** @type {() => void} */
			let unlisten;

			/** @satisfies {((this: IDBOpenDBRequest, event: IDBVersionChangeEvent) => void) | undefined} */
			const handleUpgrade = (versionDelta !== 0 || undefined) && async function () {
				// Create the instances used by the proxies.
				db = new NiceIDB(request.result);
				tx = new NiceIDBTransaction(/** @type {IDBTransaction} */(request.transaction));

				const pendingUpgrades = allUpgrades.slice(existingVersion);

				for (const [i, callback] of pendingUpgrades.entries()) {
					const version = i + 1;
					const promise = new Promise(resolve => resolve(callback()));
					try {
						await promise;
					} catch (error) {
						return reject(
							new Error('Failed upgrade', { cause: { version, error } }),
						);
					}
				}
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
		/** @type {NiceIDB} */
		let db;

		/** @satisfies {((this: IDBOpenDBRequest, event: IDBVersionChangeEvent) => void)} */
		const handleUpgrade = function (event) {
			if (typeof upgradeHandler !== 'function')
				throw new RangeError('Cannot open database without handling "upgradeneeded" event', { cause: event });
			db = new NiceIDB(request.result);
			const tx = new NiceIDBTransaction(/** @type {IDBTransaction} */(request.transaction));
			upgradeHandler(db, tx, event);
		};

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
