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
 * @property {IDBVersionChangeEvent} event - The "upgradeneeded" event.
 * @property {NiceIDBUpgradeTransaction} tx - Wrapped upgrade IDBTransaction instance used as target for proxy.
 * @property {number | undefined} [running] - Set to `true` when the "upgradeneeded" event handler gets called.
 * @property {any} [error] - An Error that occured when attempting to execute the upgrade callbacks.
 */

/**
 * @typedef {object} VersionsData
 * @property {Map<number, UpgradeCallback>} callbacks - All upgrade callbacks.
 * @property {number} latest - The latest defined version.
 * @property {() => void} cleanup - Call after executing all upgrades.
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
	/** @type {IDBOpenDBRequest | undefined} */ #request;
	/** @type {NiceIDBUpgrader | undefined} */ #upgrader;
	/** @type {VersionsData | undefined} */ #versions;

	/** @type {IDBDatabase} */;
	get #db() {
		if (!this.#request)
			throw new Error('DatabaseNotOpened');
		else if (!this.#request.result)
			throw new Error('DatabaseOpenError', { cause: { error: this.#request.error } });
		return this.#request.result;
	}

	#closed = false;

	/**
	 * Returns `true` when there is an active connection to the underlying database.
	 */
	get opened() {
		return !!this.#request;
	}

	/**
	 * Returns `true` if manually closed with `NiceIDB.prototype.close()`.
	 */
	get closed() {
		return this.#closed;
	}

	get name() {
		return this.#name;
	}

	get version() {
		return this.#db.version;
	}

	/**
	 * @param {string} name - A database name.
	 */
	constructor(name) {
		if (typeof name !== 'string')
			throw new TypeError('Expected string');
		this.#name = name;
	}

	/**
	 * @param {string} name
	 * @param {IDBObjectStoreParameters} [options]
	 */
	#createStore(name, options) {
		const req = /** @type {IDBOpenDBRequest} */(this.#request);
		const store = req.result.createObjectStore(name, options);
		return new NiceIDB.UpgradableStore(store, req.transaction);
	}

	/**
	 * @param {string} name
	 */
	#deleteStore(name) {
		return this.#db.deleteObjectStore(name);
	}

	/** @type {ProxyHandler<NiceIDBUpgradableDatabase>} */
	static #proxyHandler = {
		get(t, k, r) {
			if (!t.#upgrader || !t.#request)
				throw new Error('Cannot access proxy outside of upgrade callback');
			let v;
			if (k === 'createStore')
				v = t.#createStore;
			else if (k === 'deleteStore')
				v = t.#deleteStore;
			else
				v = Reflect.get(t, k);
			if (typeof v !== 'function')
				return v;
			return /** @this {any} */ function (/** @type {any[]} */ ...args) {
				return v.apply(this === r ? t : this, args);
			};
		},
	};

	#createUpgradeableDatabaseProxy() {
		return Proxy.revocable(/** @type {any} */(this), NiceIDB.#proxyHandler);
	}

	#createUpgradeTransactionProxy() {
		/** @type {NiceIDBUpgradeTransaction} */ let target;
		/** @type {IDBTransaction | undefined} */ let tx;

		/** @type {ProxyHandler<NiceIDBUpgradeTransaction>} */
		const handler = {
			get: (_, k) => {
				if (!this.#upgrader || !this.#request || !this.#request.transaction)
					throw new Error('Cannot access proxy outside of upgrade callback');
				if (tx !== this.#request.transaction) {
					tx = this.#request.transaction;
					target = new NiceIDB.UpgradeTransaction(tx);
				}
				const v = Reflect.get(target, k);
				return typeof v === 'function' ? v.bind(target) : v;
			},
		};

		return Proxy.revocable(Object.create(null), handler);
	}

	/**
	 * Define each version of the database with callbacks that make changes to
	 * its structure. The callbacks will be used when opening the database to
	 * handle the "upgradeneeded" event.
	 *
	 * @example
	 * const db = new NiceIDB('my-app-db')
	 *   .define((version, db, tx) => {
	 *     version(1, () => {
	 *       const logs = db.createStore('logs', { autoincrement: true });
	 *       logs.createIndex('types', 'type');
	 *       logs.createIndex('messages', 'message');
	 *     });
	 *     version(2, () => {
	 *       const logs = tx.store('logs');
	 *       logs.createIndex('scopes', 'scope');
	 *     });
	 *   });
	 *
	 * @example
	 * const db = new NiceIDB('my-app-db')
	 *   .define((version, db, tx) => {
	 *     // This will throw an error.
	 *     const currentVersion = db.version;
	 *     version(1, () => {
	 *       // This is OK.
	 *       const currentVersion = db.version;
	 *     });
	 *   });
	 *
	 * @param {DefineDatabaseVersions} defineVersions
	 */
	define(defineVersions) {
		if (typeof defineVersions !== 'function')
			throw new TypeError('Expected a callback as an argument');
		if (this.#request !== undefined)
			throw new Error('Cannot define versions on a previously opened instance');
		if (this.#versions)
			throw new Error('Versions have already been defined');

		let latest = 0;
		const callbacks = new Map();

		/** @type {DefineVersionedUpgrade} */
		const defineVersion = (num, cb) => {
			if (typeof num !== 'number' || !Number.isInteger(num) || num < 0)
				throw new TypeError('Version must be positive integer');
			if (typeof cb !== 'function')
				throw new TypeError('Expected callback function for the upgrade');
			if (num !== ++latest)
				throw new Error('Versions must be defined in-order and in increments of one');
			callbacks.set(num, cb);
		};

		const db = this.#createUpgradeableDatabaseProxy();
		const tx = this.#createUpgradeTransactionProxy();

		defineVersions(
			defineVersion,
			db.proxy,
			tx.proxy,
		);

		if (latest === 0)
			throw new Error('No versions defined');

		const cleanup = () => {
			db.revoke();
			tx.revoke();
		};

		this.#versions = { callbacks, cleanup, latest };

		return this;
	}

	/**
	 * Open and upgrade the database using upgrade callbacks.
	 *
	 * @example
	 * // Define upgrade callbacks for each version.
	 * const db = new NiceIDB('my-app-db')
	 *   .define((version, db) => {
	 *     version(1, () => {
	 *       const logs = db.createStore('logs', { autoincrement: true });
	 *       logs.createIndex('types', 'type');
	 *       logs.createIndex('messages', 'message');
	 *     });
	 *   });
	 *
	 * // Will open and execute the required upgrades to get to latest vesrion.
	 * await db.upgrade();
	 *
	 * @param {number} [version] - The the last defined version, if not specified.
	 * @returns {Promise<this>} The database with the upgrades applied.
	 */
	async upgrade(version) {
		if (this.#request)
			throw new Error('Database connection is already open');
		else if (!this.#versions)
			throw new Error('UndefinedVersions');

		const versions = this.#versions;
		const requested = version ?? versions.latest;
		const existing = await indexedDB.databases().then(dbs =>
			dbs.find(db => db.name === this.#name),
		);

		let current = existing?.version ?? 0;

		while (current !== requested) {
			const upgrade = versions.callbacks.get(++current);
			if (!upgrade)
				throw new Error('MissingUpgrade');
			else if (typeof upgrade !== 'function')
				throw new TypeError('InvalidUpgrade');

			this.#request = indexedDB.open(this.#name, current);
			this.#upgrader = NiceIDBUpgrader.handle(this.#request, upgrade);

			try {
				await this.#upgrader.finish;
			} finally {
				this.#request?.result.close();
				this.#request = undefined;
			}
		}

		versions.cleanup();
		return await this.open();
	}

	/**
	 * Request to open a connection to this database.
	 *
	 * @example
	 * // Open an existing database.
	 * const db = await new NiceIDB('my-app-db').open();
	 *
	 * @example
	 * // Call and attach event listeners.
	 * const db = await new NiceIDB('my-app-db').open().once('blocked', () => {
	 *   console.error('blocked from opening database');
	 *   // Handle the event...
	 * });
	 *
	 * @param {number} [version] - Will be the existing version if not specified.
	 * @returns {NiceIDBRequest<IDBOpenDBRequest, this>} A wrapped open request that resolves to `this`.
	 */
	open(version) {
		if (this.#request)
			throw new Error('Database connection is already open');
		this.#request = indexedDB.open(this.#name, version);
		return new NiceIDBRequest(this.#request, () => this);
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
	 * @returns {NiceIDBStore} The object store instance.
	 */
	store(name, mode, opts) {
		if (mode === 'ro')
			mode = 'readonly';
		else if (mode === 'rw')
			mode = 'readwrite';
		const tx = this.#db.transaction(name, mode, opts);
		const store = tx.objectStore(name);
		return new NiceIDBStore(store);
	}

	close() {
		this.#closed = true;
		this.#db.close();
	}

	[Symbol.dispose]() {
		this.close();
	}

	destroy() {
		if (this.#request?.result)
			this.#request.result.close();
		this.#request = undefined;
		const req = indexedDB.deleteDatabase(this.#name);
		return new NiceIDBRequest(req);
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
		return new NiceIDBRequest(req);
	}
}

class NiceIDBUpgrader {
	/** @type {PromiseWithResolvers<void>} */ #result;
	/** @type {IDBOpenDBRequest} */ #request;
	/** @type {UpgradeCallback} */ #callback;

	get finish() {
		return this.#result.promise
			.finally(() => this.#unlisten());
	}

	get request() { return this.#request; }
	get then() { return this.finish.then; }

	/**
	 * @param {IDBOpenDBRequest} req
	 * @param {UpgradeCallback} cb
	 */
	constructor(req, cb) {
		this.#result = Promise.withResolvers();
		this.#request = req;
		this.#callback = cb;
		this.#listen();
	}

	/** @type {(event: IDBVersionChangeEvent) => void | Promise<void>} */
	#handleError() {
		this.#result.reject(this.#request?.error);
	}

	/** @type {(event: IDBVersionChangeEvent) => void | Promise<void>} */
	#handleAbort(event) {
		this.#result.reject(
			new Error('UpgradeAborted', { cause: { event } }),
		);
	}

	/** @type {(event: IDBVersionChangeEvent) => void | Promise<void>} */
	#handleBlocked(event) {
		this.#result.reject(
			new Error('UpgradeBlocked', { cause: { event } }),
		);
	}

	/** @type {(event: IDBVersionChangeEvent) => void | Promise<void>} */
	#handleUpgrade() {
		const promise = new Promise(resolve => resolve(this.#callback()));
		this.#result.resolve(promise);
	}

	/** @type {(event: IDBVersionChangeEvent) => Promise<void>} */
	async handleEvent(event) {
		switch (event.type) {
			case 'upgradeneeded': return this.#handleUpgrade(event);
			case 'blocked': return this.#handleBlocked(event);
			case 'abort': return this.#handleAbort(event);
			case 'error': return this.#handleError(event);
		}
	}

	/** @type {() => void} */
	#unlisten() {
		this.#request.removeEventListener('upgradeneeded', this);
		this.#request.removeEventListener('blocked', this);
		this.#request.removeEventListener('abort', this);
		this.#request.removeEventListener('error', this);
	}

	/** @type {() => void} */
	#listen() {
		this.#request.addEventListener('upgradeneeded', this);
		this.#request.addEventListener('blocked', this);
		this.#request.addEventListener('abort', this);
		this.#request.addEventListener('error', this);
	}

	/**
	 * @param {IDBOpenDBRequest} req
	 * @param {UpgradeCallback} cb
	 */
	static handle(req, cb) {
		return new this(req, cb);
	}
}
