/** @import { RegisterUpgrade, UpgradeCallback, UpgradeState } from '#types' */
import { RedirectableProxy } from './proxy.js';
import { DBRequest } from './req.js';
import { ReadOnlyStore, ReadWriteStore, UpgradableStore } from './store.js';
import { ReadOnlyTransaction, ReadWriteTransaction, UpgradeTransaction } from './tx.js';
import { toStrings } from './util.js';

export class BaseDatabase {
	/** @type {IDBDatabase | undefined} */ #target;

	/**
	 * For subclasses to access the wrapped instance.
	 * @protected
	 */
	get target() {
		if (!this.#target)
			throw new Error('InvalidState');
		return this.#target;
	}

	/**
	 * For subclasses to set the wrapped instance.
	 * @protected
	 */
	set target(arg) {
		if (arg instanceof IDBDatabase === false)
			throw new TypeError('Expected an IDBDatabase instance');
		this.#target = arg;
	}

	/**
	 * Name of the connected database.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/name}
	 */
	get name() { return this.target.name; }

	/**
	 * The version for this database connection.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/version}
	 */
	get version() { return this.target.version; }

	/**
	 * The names of object stores in the database.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/objectStoreNames}
	 */
	get storeNames() { return toStrings(this.target.objectStoreNames); }

	/**
	 * @overload
	 * @param {IDBDatabase} db An IDBDatabase instance to wrap.
	 */
	/**
	 * @protected
	 * @overload
	 * @param {undefined} [db]
	 */
	/**
	 * @param {IDBDatabase | undefined} arg
	 */
	constructor(arg) {
		this.#target = arg;
	}

	/**
	 * Compares two values as keys to determine equality and ordering for IndexedDB operations.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/cmp}
	 */
	static cmp = indexedDB.cmp;

	/**
	 * List available databases.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/databases}
	 */
	static databases = indexedDB.databases;

	/**
	 * Delete a database with the given name.
	 * @param {string} name
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/deleteDatabase}
	 */
	static delete(name) {
		const req = indexedDB.deleteDatabase(name);
		return DBRequest.promisify(req);
	}

	/**
	 * Delete the current database connected to this instance.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/deleteDatabase}
	 */
	delete() {
		if (this.#target)
			this.#target.close();
		return BaseDatabase.delete(this.name);
	}

	/**
	 * Close the database.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/close}
	 */
	close() { this.target.close(); }
	[Symbol.dispose]() { this.close(); }

	/**
	 * Get a wrapped transaction object to access the object stores.
	 * @overload
	 * @param {string | string[]} stores
	 * @param {'readonly' | undefined} [mode]
	 * @param {IDBTransactionOptions | undefined} [opts]
	 * @returns {ReadOnlyTransaction}
	 */
	/**
	 * @overload
	 * @param {string | string[]} stores
	 * @param {'readwrite'} mode
	 * @param {IDBTransactionOptions | undefined} [opts]
	 * @returns {ReadWriteTransaction}
	 */
	/**
	 * @param {string | string[]} stores
	 * @param {'readonly' | 'readwrite' | undefined} [mode]
	 * @param {IDBTransactionOptions | undefined} [opts]
	 */
	transaction(stores, mode, opts) {
		const tx = this.target.transaction(stores, mode, opts);
		if (mode === 'readwrite')
			return new ReadWriteTransaction(tx);
		return new ReadOnlyTransaction(tx);
	}

	/**
	 * A convenience method to create a transaction and get an object store.
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
	 * @param {string} name
	 * @param {'readonly' | 'readwrite'} [mode]
	 * @param {IDBTransactionOptions} [opts]
	 */
	store(name, mode, opts) {
		const tx = this.target.transaction(name, mode, opts);
		const store = tx.objectStore(name);
		if (mode === 'readwrite')
			return new ReadWriteStore(store);
		return new ReadOnlyStore(store);
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
	on(type, listener, options) {
		this.target.addEventListener(type, listener, options);
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
		this.target.addEventListener(type, listener, options);
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
		this.target.removeEventListener(type, listener, options);
		return this;
	}

	/**
	 * @param {Event | string} event
	 * @param {EventInit} [init]
	 */
	emit(event, init) {
		if (event instanceof Event)
			return this.target.dispatchEvent(event);
		return this.target.dispatchEvent(new Event(event, init));
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
		return this.target.addEventListener(type, listener, options);
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
		return this.target.removeEventListener(type, listener, options);
	}

	/**
	 * @param {Event} event
	 */
	dispatchEvent(event) {
		return this.target.dispatchEvent(event);
	}
}

/**
 * Wraps an `IDBDatabase` for the the "upgradeneeded" event handler.
 */
export class UpgradableDatabase extends BaseDatabase {
	/**
	 * Create and return a new object store.
	 * @param {string} name
	 * @param {IDBObjectStoreParameters | undefined} opts
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/createObjectStore}
	 */
	createStore(name, opts) {
		const store = super.target.createObjectStore(name, opts);
		return new UpgradableStore(store);
	}

	/**
	 * Destroy the with the given name in the connected database.
	 * @param {string} name
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/deleteObjectStore}
	 */
	deleteStore(name) {
		return super.target.deleteObjectStore(name);
	}
}

class Upgrader {
	/** @type {IDBOpenDBRequest} */ #request;
	/** @type {UpgradeCallback} */ #callback;

	/** @type {PromiseWithResolvers<void>} */
	#upgrade = Promise.withResolvers();

	get finish() {
		return this.#upgrade.promise
			.finally(() => this.#unlisten());
	}

	/**
	 * @param {IDBOpenDBRequest} req
	 * @param {UpgradeCallback} cb
	 */
	constructor(req, cb) {
		this.#request = req;
		this.#callback = cb;
		this.#listen();
	}

	/**
	 * @param {((value: void) => void | PromiseLike<void>) | null | undefined} onfulfilled
	 * @param {((reason: any) => PromiseLike<never>) | null | undefined} onrejected
	 */
	then(onfulfilled, onrejected) {
		return this.finish.then(onfulfilled, onrejected);
	}

	/** @type {(event: IDBVersionChangeEvent) => void} */
	#handleError() {
		this.#upgrade.reject(this.#request?.error);
	}

	/** @type {(event: IDBVersionChangeEvent) => void} */
	#handleAbort(event) {
		this.#upgrade.reject(
			new Error('UpgradeAborted', { cause: { event } }),
		);
	}

	/** @type {(event: IDBVersionChangeEvent) => void} */
	#handleBlocked(event) {
		this.#upgrade.reject(
			new Error('UpgradeBlocked', { cause: { event } }),
		);
	}

	/** @type {(event: IDBVersionChangeEvent) => void} */
	#handleUpgrade(event) {
		this.#request.result.addEventListener('abort', this);
		const promise = new Promise(resolve => resolve(this.#callback(event)))
			.finally(() => this.#request.result.removeEventListener('abort', this));
		this.#upgrade.resolve(promise);
	}

	/**
	 * @internal
	 * @type {(event: IDBVersionChangeEvent) => void}
	 */
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
		this.#request.removeEventListener('error', this);
	}

	/** @type {() => void} */
	#listen() {
		this.#request.addEventListener('upgradeneeded', this);
		this.#request.addEventListener('blocked', this);
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

/**
 * Manage connections to databases and any upgrades.
 */
export class Database extends BaseDatabase {
	/** @type {IDBOpenDBRequest | undefined} */ #request;
	/** @type {UpgradeState | undefined} */ #state;
	/** @type {number | undefined} */ #version;
	/** @type {string} @readonly */ #name;

	/**
	 * @override
	 */
	get name() { return this.#name; }

	get opened() { return !!this.#request; }

	/**
	 * @protected
	 * @param {string} name
	 */
	constructor(name) {
		super();
		if (typeof name !== 'string')
			throw new TypeError('Expected a string');
		this.#name = name;
	}

	/**
	 * Create a new instance to manage a connection to a database with the given name.
	 * @param {string} name
	 */
	static init(name) {
		return new this(name);
	}

	/**
	 * Define the structure of the database by registering upgrade callbacks.
	 *
	 * @example
	 * const db = NiceIDB.init('my-app-db').define((version, db, tx) => {
	 *   version(1, async () => {
	 *     const store = db.createStore('my-store');
	 *     // Structure the new database...
	 *   });
	 *   version(2, async () => {
	 *     // Do more stuff for version 2...
	 *   });
	 *   version(3, async () => {
	 *     // ...
	 *   });
	 *   // Define even more versions...
	 * });
	 *
	 * // Upgrade to the latest version
	 * await db.latest().upgrade()
	 *
	 * @param {(register: RegisterUpgrade, db: UpgradableDatabase, tx: UpgradeTransaction) => void} versions
	 */
	define(versions) {
		if (this.#request)
			throw new Error('DatabaseInitialized');
		else if (this.#state)
			throw new Error('CannotRedefineUpgrades');
		else if (typeof versions !== 'function')
			throw new TypeError('InvalidVersionsCallback');

		let latest = 0;
		const upgrades = new Map();

		/** @satisfies {RegisterUpgrade} */
		const register = (version, upgrade) => {
			if (!Number.isInteger(version) || version <= 0)
				throw new TypeError('Version must be positive integer');
			if (typeof upgrade !== 'function')
				throw new TypeError('Expected callback function for the upgrade');
			if (version !== ++latest)
				throw new Error('Versions must be defined in-order and in increments of one');
			upgrades.set(version, upgrade);
		};

		/** @type {RedirectableProxy<UpgradableDatabase>} */
		const db = new RedirectableProxy();
		/** @type {RedirectableProxy<UpgradeTransaction>} */
		const tx = new RedirectableProxy();

		// Collect all upgrades.
		versions(register, db.proxy, tx.proxy);

		this.#state = { db, tx, upgrades, latest };
		return this;
	}

	/**
	 * @param {'latest' | number} num
	 */
	#setVersion(num) {
		if (this.#request)
			throw new Error('DatabaseAlreadyConnected');

		if (num === 'latest') {
			if (!this.#state)
				throw new Error('UndefinedUpgrades');
			return this.#version = this.#state.latest;
		}

		if (!Number.isInteger(num) || num <= 0)
			throw new TypeError('InvalidVersion');
		else if (this.#state && num > this.#state.latest)
			throw new RangeError('VersionTooHigh');
		return this.#version = num;
	}

	/**
	 * Can be used to specify the last defined version to open.
	 *
	 * @example
	 * const db = NiceIDB.init('my-app-db').define((version, db, tx) => {
	 *   // Older versions...
	 *   version(7, async () => {
	 *     // ...
	 *   });
	 * });
	 *
	 * // Will open and upgrade to version 7 of the database.
	 * await db.latest().upgrade()
	 */
	latest() {
		this.#setVersion('latest');
		return this;
	}

	/**
	 * Specify a specific database version to open.
	 *
	 * @example
	 * // Will open version 7 of the database.
	 * await db.versions(7).open()
	 *
	 * @param {'latest' | number} num
	 */
	versions(num) {
		this.#setVersion(num);
		return this;
	}

	/**
	 * Request opening a connection to a database.
	 *
	 * @example
	 * const database = await db.init('my-app-db').open()
	 *   .once('blocked', (evt) => { ... })
	 *   .once('error', (evt) => { ... })
	 *
	 * @returns {DBRequest<IDBOpenDBRequest, this>} An enhanced request object.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/open}
	 */
	open({ version = this.#version } = { version: this.#version }) {
		if (this.#request)
			throw new Error('DatabaseAlreadyConnected');
		this.#request = indexedDB.open(this.#name, version);
		return new DBRequest(this.#request, (result) => {
			return (super.target = result, this);
		});
	}

	/**
	 * @internal
	 * @param {IDBVersionChangeEvent} event
	 */
	handleEvent({ type, target }) {
		if (type !== 'upgradeneeded' || target instanceof IDBOpenDBRequest === false)
			throw new Error('UnknownEvent');
		if (!this.#state || !target.transaction)
			throw new Error('InvalidState');
		const tx = new UpgradeTransaction(target.transaction);
		const db = new UpgradableDatabase(target.result);
		this.#state.db.target(db);
		this.#state.tx.target(tx);
	}

	/**
	 * Request a connection to the database and handle any "upgradeneeded"
	 * events using the previously defined upgrade callbacks.
	 *
	 * @example
	 * const db = NiceIDB.init('my-app-db').define((version, db, tx) => {
	 *   version(1, async () => {
	 *     const store = db.createStore('my-store');
	 *     // Structure the new database...
	 *   });
	 *   version(2, async () => {
	 *     // Do more stuff for version 2...
	 *   });
	 *   version(3, async () => {
	 *     // ...
	 *   });
	 *   // Define even more versions...
	 * });
	 *
	 * // Upgrade to the latest version
	 * await db.latest().upgrade()
	 *
	 * @param {object} [opts]
	 * @param {'latest' | number | undefined} opts.version
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/open}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/upgradeneeded_event}
	 */
	async upgrade({ version = this.#version } = { version: this.#version }) {
		const requested = version === 'latest' || version == null
			? this.#setVersion('latest')
			: version;

		const { upgrades, db, tx } = /** @type {UpgradeState} */(this.#state);

		let current = await indexedDB.databases()
			.then(dbs => dbs.find(db => db.name === this.#name))
			.then(db => db?.version ?? 0);

		if (requested < current)
			throw new RangeError('VersionTooLow', { cause: { requested, current } });

		while (current !== requested) {
			if (this.#request?.result)
				this.#request.result.close();

			const upgrade = upgrades.get(++current);
			if (!upgrade)
				throw new Error('MissingUpgrade');
			else if (typeof upgrade !== 'function')
				throw new TypeError('InvalidUpgrade');

			this.#request = indexedDB.open(this.#name, current);
			this.#request.addEventListener('upgradeneeded', this, { once: true });

			try {
				await Upgrader.handle(this.#request, upgrade);
			} catch (error) {
				this.#request.result?.close();
				this.#request = undefined;
				throw error;
			}
		}

		// Will be undefined if the above loop wasn't entered.
		this.#request ??= indexedDB.open(this.#name, current);

		db.revoke();
		tx.revoke();
		this.#state = undefined;

		return new DBRequest(this.#request, (result) => {
			return (super.target = result, this);
		});
	}
}

export default Database;
