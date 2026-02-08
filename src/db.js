import { DBRequest } from './req.js';
import { ReadOnlyStore, ReadWriteStore, UpgradableStore } from './store.js';
import { ReadOnlyTransaction, ReadWriteTransaction, UpgradeTransaction } from './tx.js';
import { toStrings } from './util.js';

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
 * @param {UpgradableDatabase} db - The database instance to upgraded.
 * @param {UpgradeTransaction} tx - The "upgrade transaction" instance.
 * @returns {void | Promise<void>}
 */

/**
 * @typedef DatabaseUpgradeMethods
 * @property {(name: string, options?: IDBObjectStoreParameters) => UpgradableStore} createStore - Create an object store.
 * @property {(name: string) => void} deleteStore - Delete an object store.
 *
 * @typedef {Database & DatabaseUpgradeMethods} UpgradableDatabase
 */

/**
 * @typedef {object} VersionsData
 * @property {Map<number, UpgradeCallback>} callbacks - All upgrade callbacks.
 * @property {number} latest - The latest defined version.
 * @property {() => void} cleanup - Call after executing all upgrades.
 */

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
 * @implements {Disposable}
 */
export class Database {
	/** @type {string} */ #name;
	/** @type {IDBDatabase | undefined} */ #conn;
	/** @type {IDBOpenDBRequest | undefined} */ #request;
	/** @type {Upgrader | undefined} */ #upgrader;
	/** @type {VersionsData | undefined} */ #versions;

	/** @type {IDBDatabase} */;
	get #db() {
		if (this.#conn)
			return this.#conn;
		else if (!this.#request)
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

	get info() {
		return {
			name: this.#name,
			version: this.#request?.result.version,
		};
	}

	/**
	 * List of object stores in the database.
	 * @see {@link IDBDatabase.prototype.objectStoreNames}
	 */
	get storeNames() { return toStrings(this.#db.objectStoreNames); }

	/**
	 * @overload
	 * @param {string} name - A database name.
	 */
	/**
	 * @private
	 * @overload
	 * @param {IDBDatabase} db
	 */
	/**
	 * @param {string | IDBDatabase} arg - A database name.
	 */
	constructor(arg) {
		if (typeof arg === 'string') {
			this.#name = arg;
		} else if (arg instanceof IDBDatabase) {
			this.#name = arg.name;
			this.#conn = arg;
		} else {
			throw new TypeError('Expected string');
		}
	}

	/**
	 * @param {string} name
	 */
	static init(name) {
		return new this(name);
	}

	/**
	 * @param {string} name
	 * @param {IDBObjectStoreParameters} [options]
	 */
	#createStore(name, options) {
		const req = /** @type {IDBOpenDBRequest} */(this.#request);
		const store = req.result.createObjectStore(name, options);
		return new UpgradableStore(store);
	}

	/**
	 * @param {string} name
	 */
	#deleteStore(name) {
		return this.#db.deleteObjectStore(name);
	}

	/** @type {ProxyHandler<UpgradableDatabase>} */
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
		return Proxy.revocable(/** @type {any} */(this), Database.#proxyHandler);
	}

	#createUpgradeTransactionProxy() {
		/** @type {UpgradeTransaction} */ let target;
		/** @type {IDBTransaction | undefined} */ let tx;

		/** @type {ProxyHandler<UpgradeTransaction>} */
		const handler = {
			get: (_, k) => {
				if (!this.#upgrader || !this.#request || !this.#request.transaction)
					throw new Error('Cannot access proxy outside of upgrade callback');
				if (tx !== this.#request.transaction) {
					tx = this.#request.transaction;
					target = new UpgradeTransaction(tx);
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
		const { latest } = versions;
		const requested = version ?? latest;
		let current = await indexedDB.databases()
			.then(dbs => dbs.find(db => db.name === this.#name))
			.then(db => db?.version ?? 0);

		if (requested > latest)
			throw new RangeError('VersionTooHigh', { cause: { requested, current } });
		else if (requested < current)
			throw new RangeError('VersionTooLow', { cause: { requested, current } });

		while (current !== requested) {
			if (this.#request?.result)
				this.#request.result.close();

			const upgrade = versions.callbacks.get(++current);
			if (!upgrade)
				throw new Error('MissingUpgrade');
			else if (typeof upgrade !== 'function')
				throw new TypeError('InvalidUpgrade');

			this.#request = indexedDB.open(this.#name, current);
			this.#upgrader = Upgrader.handle(this.#request, upgrade);

			try {
				await this.#upgrader.finish;
			} catch (error) {
				this.#request.result?.close();
				this.#request = undefined;
				throw error;
			}
		}

		this.#upgrader = undefined;
		return this.open();
	}

	existing() {
		if (this.#request)
			throw new Error('ExistingDatabaseConnection');
		this.#request = indexedDB.open(this.#name);
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
	 * @returns {DBRequest<IDBOpenDBRequest, this>} A wrapped open request that resolves to `this`.
	 */
	open(version) {
		this.#request ??= indexedDB.open(this.#name, version);
		return new DBRequest(this.#request, () => this);
	}

	destroy() {
		if (this.#request?.result)
			this.#request.result.close();
		this.#request = undefined;
		const req = indexedDB.deleteDatabase(this.#name);
		return new DBRequest(req);
	}

	/**
	 * Create a transaction instance.
	 *
	 * @example
	 * using tx = db.transaction('items');
	 * const items = tx.store('items');
	 * const count = await items.count();
	 *
	 * @overload
	 * @param {string | string[]} stores
	 * @param {'readonly'} [mode]
	 * @param {IDBTransactionOptions} [opts]
	 * @returns {ReadOnlyTransaction}
	 */
	/**
	 * @overload
	 * @param {string | string[]} stores
	 * @param {'readwrite'} mode
	 * @param {IDBTransactionOptions} [opts]
	 * @returns {ReadWriteTransaction}
	 */
	/**
	 * @param {string | string[]} stores - Name of stores include in the scope of the transaction.
	 * @param {'readonly' | 'readwrite'} [mode] - Defaults to "readonly"
	 * @param {IDBTransactionOptions} [options] - Defaults to `{ durability: "default" }`
	 * @returns {ReadOnlyTransaction} A transaction instance.
	 */
	transaction(stores, mode, options) {
		const tx = this.#db.transaction(stores, mode, options);
		if (mode === 'readwrite')
			return new ReadWriteTransaction(tx);
		return new ReadOnlyTransaction(tx);
	}

	/**
	 * Convenience method to access a single object store.
	 *
	 * @overload
	 * @param {string} name
	 * @param {'readonly'} [mode]
	 * @param {IDBTransactionOptions} [opts]
	 * @returns {ReadOnlyStore}
	 */
	/**
	 * @overload
	 * @param {string} name
	 * @param {'readwrite'} mode
	 * @param {IDBTransactionOptions} [opts]
	 * @returns {ReadWriteStore}
	 */
	/**
	 * @param {string} name - Name of the object store.
	 * @param {'readonly' | 'readwrite'} [mode] - The transaction mode to access the object store; defaults to "readonly".
	 * @param {IDBTransactionOptions} [opts] - Defaults to `{ durability: "default" }`
	 * @returns {ReadOnlyStore} The object store instance.
	 */
	store(name, mode, opts) {
		const tx = this.#db.transaction(name, mode, opts);
		const store = tx.objectStore(name);
		if (mode === 'readwrite')
			return new ReadWriteStore(store);
		return new ReadOnlyStore(store);
	}

	close() {
		this.#closed = true;
		this.#db.close();
	}

	[Symbol.dispose]() { this.close(); }

	/**
	 * @template {keyof IDBDatabaseEventMap} K
	 * @overload
	 * @param {K} type
	 * @param {(this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any} listener
	 * @param {boolean | AddEventListenerOptions} options
	 * @returns {this}
	 */
	/**
	 * @param {string} type
	 * @param {(this: IDBDatabase, ev: Event) => any} listener
	 * @param {boolean | AddEventListenerOptions} options
	 */
	on(type, listener, options) {
		this.#db.addEventListener(type, listener, options);
		return this;
	}

	/**
	 * @template {keyof IDBDatabaseEventMap} K
	 * @overload
	 * @param {K} type
	 * @param {(this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any} listener
	 * @param {boolean | AddEventListenerOptions} options
	 * @returns {this}
	 */
	/**
	 * @param {string} type
	 * @param {(this: IDBDatabase, ev: Event) => any} listener
	 * @param {boolean | AddEventListenerOptions} options
	 */
	once(type, listener, options) {
		if (typeof options === 'boolean')
			options = { capture: true, once: true };
		else if (options && typeof options === 'object')
			Object.assign(options, { once: true });
		else if ((options ?? null) === null)
			options = { once: true };
		this.#db.addEventListener(type, listener, options);
		return this;
	}

	/**
	 * @template {keyof IDBDatabaseEventMap} K
	 * @overload
	 * @param {K} type
	 * @param {(this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any} listener
	 * @param {boolean | EventListenerOptions} options
	 * @returns {this}
	 */
	/**
	 * @param {string} type
	 * @param {(this: IDBDatabase, ev: Event) => any} listener
	 * @param {boolean | EventListenerOptions} options
	 */
	off(type, listener, options) {
		this.#db.removeEventListener(type, listener, options);
		return this;
	}

	/**
	 * @param {Event | string} event
	 * @param {EventInit} [init]
	 */
	emit(event, init) {
		if (event instanceof Event)
			return this.#db.dispatchEvent(event);
		return this.#db.dispatchEvent(new Event(event, init));
	}

	/**
	 * @template {keyof IDBDatabaseEventMap} K
	 * @overload
	 * @param {K} type
	 * @param {(this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any} listener
	 * @param {boolean | AddEventListenerOptions} options
	 * @returns {void}
	 */
	/**
	 * @param {string} type
	 * @param {(this: IDBDatabase, ev: Event) => any} listener
	 * @param {boolean | AddEventListenerOptions} options
	 * @returns {void}
	 */
	addEventListener(type, listener, options) {
		return this.#db.addEventListener(type, listener, options);
	}

	/**
	 * @template {keyof IDBDatabaseEventMap} K
	 * @overload
	 * @param {K} type
	 * @param {(this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any} listener
	 * @param {boolean | EventListenerOptions} options
	 * @returns {void}
	 */
	/**
	 * @param {string} type
	 * @param {(this: IDBDatabase, ev: Event) => any} listener
	 * @param {boolean | EventListenerOptions} options
	 * @returns {void}
	 */
	removeEventListener(type, listener, options) {
		return this.#db.removeEventListener(type, listener, options);
	}

	/**
	 * @param {Event} event
	 */
	dispatchEvent(event) {
		return this.#db.dispatchEvent(event);
	}
}

class Upgrader {
	/** @type {PromiseWithResolvers<void>} */
	#result = Promise.withResolvers();
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
		this.#request = req;
		this.#callback = cb;
		this.#listen();
	}

	/** @type {(event: IDBVersionChangeEvent) => void} */
	#handleError() {
		this.#result.reject(this.#request?.error);
	}

	/** @type {(event: IDBVersionChangeEvent) => void} */
	#handleAbort(event) {
		this.#result.reject(
			new Error('UpgradeAborted', { cause: { event } }),
		);
	}

	/** @type {(event: IDBVersionChangeEvent) => void} */
	#handleBlocked(event) {
		this.#result.reject(
			new Error('UpgradeBlocked', { cause: { event } }),
		);
	}

	/** @type {(event: IDBVersionChangeEvent) => void} */
	#handleUpgrade() {
		const promise = new Promise(resolve => resolve(this.#callback()));
		this.#result.resolve(promise);
	}

	/** @type {(event: IDBVersionChangeEvent) => void} */
	handleEvent(event) {
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
