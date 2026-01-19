import { NiceIDBIndex } from './idx.js';
import { NiceIDBRequest } from './req.js';
import { NiceIDBStore } from './store.js';
import { NiceIDBTransaction } from './tx.js';
import { getStrings } from './util.js';

/** @typedef {import('#types').Database} Database */

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
 * @callback DefineDatabaseVersions
 * @param {DefineVersionedUpgrade} defineVersion - Use to define each version
 * of the database by making changes to its schema.
 * @param {NiceIDBUpgradableDatabase} db - The database instance to upgraded.
 * @param {NiceIDBUpgradeTransaction} tx - The "upgrade transaction" instance.
 * @returns {void | Promise<void>}
 */

/**
 * @typedef DatabaseUpgradeMethods
 * @property {(name: string, options?: IDBObjectStoreParameters) => NiceIDBUpgradableStore} createStore - Create an object store.
 * @property {(name: string) => void} deleteStore - Delete an object store.
 *
 * @typedef {NiceIDB & DatabaseUpgradeMethods} NiceIDBUpgradableDatabase
 * @typedef {InstanceType<typeof NiceIDBTransaction.Upgrade>} NiceIDBUpgradeTransaction
 * @typedef {InstanceType<typeof NiceIDBStore.Upgradable>} NiceIDBUpgradableStore
 */

/**
 * @typedef {object} UpgradeState
 * @property {boolean} [aborted] - To keep track of whether the transaction was aborted between executing upgrade callbacks.
 * @property {IDBTransaction | null} [tx] - A reference to the "upgrade transaction".
 * @property {number} latestVersion - The highest version number that was defined in the call to `NiceIDB.prototype.define()`.
 * @property {Map<number, UpgradeCallback>} versions - A map of version numbers to upgrade callbacks.
 * @property {() => void} revokeProxies - A function to call after handling the "upgradeneeded" event.
 */

/** @typedef {'ro' | 'rw' | 'readonly' | 'readwrite'} TransactionMode */

/**
 * Manage and connect to indexedDB databases.
 *
 * @example
 * import { NiceIDB } from 'nice-idb';
 *
 * // Open an existing database.
 * const db = await new NiceIDB('my-app-db').open();
 *
 * @example
 * // Define versions before opening.
 * const db = new NiceIDB('my-app-db')
 *   .define((version, db) => {
 *     version(1, () => {
 *       const logs = db.createStore('logs', { autoincrement: true });
 *       logs.createIndex('types', 'type');
 *       logs.createIndex('messages', 'message');
 *     });
 *   });
 * // Will open the last defined version.
 * await db.open();
 *
 * // Convenience method to create a transaction and access an object store.
 * const logs = db.store('logs', 'rw');
 * await logs.add({ type: 'info', message: 'Hello, World!' });
 *
 * @implements {Database}
 * @implements {Disposable}
 */
export class NiceIDB {
	static Request = NiceIDBRequest;
	static Transaction = NiceIDBTransaction;
	static Store = NiceIDBStore;
	static Index = NiceIDBIndex;

	static UpgradeTransaction = NiceIDBTransaction.Upgrade;
	static UpgradableStore = NiceIDBStore.Upgradable;

	/** @type {string} */ #name;
	/** @type {IDBDatabase | undefined} */ #db;
	/** @type {UpgradeState | undefined} */ #upgrade;

	/**
	 * Returns `true` when there is an active connection to the underlying database.
	 */
	get opened() {
		return this.#db !== undefined;
	}

	get name() {
		return this.#name;
	}

	get version() {
		if (this.#db === undefined)
			throw new Error('Connection to database has not been opened');
		return this.#db.version;
	}

	/**
	 * @param {IDBDatabase | string} db - A database name or instance.
	 */
	constructor(db) {
		if (db instanceof IDBDatabase) {
			this.#name = db.name;
			this.#db = db;
		} else if (typeof db === 'string') {
			this.#name = db;
		} else {
			throw new TypeError('Expected a string or IDBDatabase');
		}
	}

	#createProxies() {
		/** @type {ProxyHandler<NiceIDBUpgradableDatabase>} */
		const dbProxyHandler = {
			get: (_, k) => {
				if (k === 'name')
					return this.#name;
				if (!this.#db)
					throw new Error('Cannot access database outside of upgrade callback');

				if (k === 'createStore') {
					/** @type {(...args: Parameters<IDBDatabase['createObjectStore']>) => NiceIDBUpgradableStore} */
					return (...args) => {
						if (!this.#db || !this.#upgrade || !this.#upgrade.tx)
							throw new Error('Invalid upgrade state');
						const store = this.#db.createObjectStore(...args);
						return new NiceIDB.UpgradableStore(store, this.#upgrade.tx);
					};
				} else if (k === 'deleteStore') {
					/** @type {IDBDatabase['deleteObjectStore']} */
					return (name) => {
						if (!this.#db || !this.#upgrade || !this.#upgrade.tx)
							throw new Error('Invalid upgrade state');
						return this.#db.deleteObjectStore(name);
					};
				}

				const v = Reflect.get(this, k);
				return typeof v === 'function' ? v.bind(this) : v;
			},
		};

		/** @type {NiceIDBTransaction | undefined} */
		let txTarget;

		/** @type {ProxyHandler<NiceIDBTransaction>} */
		const txProxyHandler = {
			get: (_, k) => {
				if (!this.#upgrade || !this.#upgrade.tx)
					throw new Error('Cannot access transaction outside of upgrade callback');
				txTarget ??= new NiceIDB.UpgradeTransaction(this.#upgrade.tx);

				if (k === 'abort') {
					return () => {
						if (!this.#upgrade || !this.#upgrade.tx || !txTarget)
							throw new Error('Missing upgrade data');
						this.#upgrade.aborted = true;
						return txTarget.abort();
					};
				}
				const v = Reflect.get(txTarget, k);
				return typeof v === 'function' ? v.bind(txTarget) : v;
			},
		};

		const tx = Proxy.revocable(Object.create(null), txProxyHandler);
		const db = Proxy.revocable(/** @type {NiceIDBUpgradableDatabase} */
			(/** @type {unknown} */(this)),
			dbProxyHandler,
		);

		return { db, tx };
	}

	/**
	 * @param {DefineDatabaseVersions} defineVersions
	 */
	define(defineVersions) {
		if (typeof defineVersions !== 'function')
			throw new TypeError('Expected a callback as an argument');
		if (this.#db !== undefined)
			throw new Error('Cannot define versions on existing connection to database');
		if (this.#upgrade)
			throw new Error('Versions have already been defined');

		const { db, tx } = this.#createProxies();
		const versions = new Map();
		let latestVersion = 0;

		/** @type {DefineVersionedUpgrade} */
		const defineVersion = (num, callback) => {
			if (typeof num !== 'number' || !Number.isInteger(num) || num < 0)
				throw new TypeError('Version must be positive integer');
			if (typeof callback !== 'function')
				throw new TypeError('Expected callback function for the upgrade');
			if (num !== ++latestVersion)
				throw new Error('Versions must be defined in-order and in increments of one');
			versions.set(num, callback);
		};

		defineVersions(
			defineVersion,
			db.proxy,
			tx.proxy,
		);

		this.#upgrade = {
			versions,
			latestVersion,
			revokeProxies: () => {
				db.revoke();
				tx.revoke();
			},
		};

		return this;
	}

	/**
	 * Request to open a connection to this database.
	 *
	 * @example
	 * // Open an existing database.
	 * const db = await new NiceIDB('my-app-db').open();
	 *
	 * @example
	 * // Define versions before opening.
	 * const db = new NiceIDB('my-app-db')
	 *   .define((version, db) => {
	 *     version(1, () => {
	 *       const logs = db.createStore('logs', { autoincrement: true });
	 *       logs.createIndex('types', 'type');
	 *       logs.createIndex('messages', 'message');
	 *     });
	 *   });
	 *
	 * // Will open the last defined version.
	 * await db.open();
	 *
	 * @example
	 * // Call and attach event listeners.
	 * const db = await new NiceIDB('my-app-db').open().once('blocked', () => {
	 *   console.error('blocked from opening database');
	 *   // Handle the event...
	 * });
	 * @param {number} [version] - If not specified, will be the last defined version or the existing version.
	 * @returns {NiceIDBRequest<IDBOpenDBRequest, this>} A reference to `this`.
	 */
	open(version) {
		if (this.#db)
			throw new Error('Database connection is already open');

		if (version !== undefined) {
			if (typeof version !== 'number')
				throw new TypeError('Expected a positive integer number');
			else if (Number.isInteger(version) || version <= 0)
				throw new RangeError('Version must be a positive integer');
		}

		if (!this.#upgrade) {
			const req = indexedDB.open(this.#name, version);
			return new NiceIDBRequest(req, (db) => {
				return (this.#db = db, this);
			});
		}

		const upgrade = this.#upgrade;

		if (!version) {
			version = upgrade.latestVersion;
		} else if (version > upgrade.latestVersion) {
			throw new RangeError('Requested version is greater than latest defined version', {
				cause: {
					requested: version,
					latest: upgrade.latestVersion,
				},
			});
		}

		const req = window.indexedDB.open(this.#name, version);

		let upgradesNeeded = false;
		let upgradesFinished = false;
		let lastUpgrade = 0;

		/** @type {(event: IDBVersionChangeEvent & { oldVersion: number, newVersion: number }) => Promise<void>} */
		const handleUpgrade = async (event) => {
			upgradesNeeded = true;
			const { oldVersion, newVersion } = event;

			if (newVersion > upgrade.latestVersion)
				// Ensure we have defined upgrades for the requested version.
				throw new Error('Missing defined versions');

			// Save references to the native IndexedDB objects. They will be used by
			// the proxies created the call to `.define()`.
			upgrade.tx = /** @type {IDBTransaction} */(req.transaction);
			this.#db = req.result;

			for (let version = oldVersion + 1; version <= newVersion; version++) {
				const callback = upgrade.versions.get(version);
				if (!callback)
					throw new Error(`Missing callback for version ${version}`);

				lastUpgrade = version;
				await callback();

				if (!this.#upgrade)
					throw new Error('Upgrades exited early');
				if (upgrade.aborted)
					break;
			}

			upgradesFinished = true;
		};

		const upgradePromise = new Promise((resolve, reject) => {
			req.addEventListener('upgradeneeded', (event) => {
				handleUpgrade(/** @type {IDBVersionChangeEvent & { oldVersion: number, newVersion: number }} */(event)).then(resolve, reject);
			}, { once: true });
		});

		return new NiceIDBRequest(req, async (db) => {
			/** @type {Error[]} */
			const errors = [];

			if (upgradesNeeded) {
				if (!upgradesFinished)
					errors.push(new Error('Upgrades exited early', { cause: { lastUpgrade } }));
				await upgradePromise.catch(err => errors.push(err));
			}

			try {
				if (errors.length)
					throw new AggregateError(errors, 'Failed to open database');
			} catch (error) {
				db.close();
				this.#db = undefined;
				throw error;
			} finally {
				upgrade.revokeProxies();
				this.#upgrade = undefined;
			}

			return (this.#db = db, this);
		});
	}

	/**
	 * List of object stores in the database.
	 * @see {@link IDBDatabase.prototype.objectStoreNames}
	 */
	get storeNames() {
		if (!this.#db)
			throw new Error('Connection to database has not been opened');
		return getStrings(this.#db.objectStoreNames);
	}

	/**
	 * @param {keyof IDBDatabaseEventMap} type
	 * @param {(this: IDBDatabase, ev: Event | IDBVersionChangeEvent) => any} listener
	 * @param {boolean | AddEventListenerOptions} options
	 */
	addEventListener(type, listener, options) {
		if (!this.#db)
			throw new Error('Connection to database has not been opened');
		return this.#db.addEventListener(type, listener, options);
	}

	/**
	 * @param {keyof IDBDatabaseEventMap} type
	 * @param {(this: IDBDatabase, ev: Event | IDBVersionChangeEvent) => any} listener
	 * @param {boolean | EventListenerOptions} options
	 */
	removeEventListener(type, listener, options) {
		if (!this.#db)
			throw new Error('Connection to database has not been opened');
		return this.#db.removeEventListener(type, listener, options);
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
		if (!this.#db)
			throw new Error('Connection to database has not been opened');
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
	 * @returns {NiceIDBStore} The object store instance.
	 */
	store(name, mode, opts) {
		if (!this.#db)
			throw new Error('Connection to database has not been opened');
		if (mode === 'ro')
			mode = 'readonly';
		else if (mode === 'rw')
			mode = 'readwrite';
		const tx = this.#db.transaction(name, mode, opts);
		const store = tx.objectStore(name);
		return new NiceIDBStore(store);
	}

	close() {
		if (!this.#db)
			throw new Error('Connection to database has not been opened');
		this.#db.close();
	}

	[Symbol.dispose]() {
		if (!this.#db)
			throw new Error('Connection to database has not been opened');
		this.#db.close();
	}

	SELF_DESTRUCT() {
		if (this.#db)
			this.#db.close();
		const req = window.indexedDB.deleteDatabase(this.#name);
		return new NiceIDBRequest(req, () => null);
	}

	/**
	 * Compare two keys.
	 * @param {IDBValidKey} a
	 * @param {IDBValidKey} b
	 * @returns {-1 | 0 | 1} Comparison result.
	 * @see {@link window.indexedDB.cmp}
	 */
	static cmp(a, b) {
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
	 */
	static delete(name) {
		const req = indexedDB.deleteDatabase(name);
		return new NiceIDBRequest(req, () => null);
	}

	/**
	 * @param {string} name - Name of the database to open.
	 * @param {number} [version] - Optional version number.
	 */
	static open(name, version) {
		const req = indexedDB.open(name, version);
		return new NiceIDBRequest(req, db => new NiceIDB(db));
	}
}
