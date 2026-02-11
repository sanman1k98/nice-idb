export class BaseDatabase {
    /**
     * Compares two values as keys to determine equality and ordering for IndexedDB operations.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/cmp}
     */
    static cmp: (first: any, second: any) => number;
    /**
     * List available databases.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/databases}
     */
    static databases: () => Promise<IDBDatabaseInfo[]>;
    /**
     * Delete a database with the given name.
     * @param {string} name
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/deleteDatabase}
     */
    static delete(name: string): DBRequest<IDBOpenDBRequest, IDBDatabase, never>;
    /**
     * @overload
     * @param {IDBDatabase} db An IDBDatabase instance to wrap.
     */
    constructor(db: IDBDatabase);
    /**
     * @protected
     * @overload
     * @param {undefined} [db]
     */
    constructor(db?: undefined);
    /**
     * For subclasses to set the wrapped instance.
     * @protected
     */
    protected set target(arg: IDBDatabase);
    /**
     * For subclasses to access the wrapped instance.
     * @protected
     */
    protected get target(): IDBDatabase;
    /**
     * Name of the connected database.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/name}
     */
    get name(): string;
    /**
     * The version for this database connection.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/version}
     */
    get version(): number;
    /**
     * The names of object stores in the database.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/objectStoreNames}
     */
    get storeNames(): readonly string[];
    /**
     * Delete the current database connected to this instance.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/deleteDatabase}
     */
    delete(): DBRequest<IDBOpenDBRequest, IDBDatabase, never>;
    /**
     * Close the database.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/close}
     */
    close(): void;
    /**
     * Get a wrapped transaction object to access the object stores.
     * @overload
     * @param {string | string[]} stores
     * @param {'readonly' | undefined} [mode]
     * @param {IDBTransactionOptions | undefined} [opts]
     * @returns {ReadOnlyTransaction}
     */
    transaction(stores: string | string[], mode?: "readonly" | undefined, opts?: IDBTransactionOptions | undefined): ReadOnlyTransaction;
    /**
     * @overload
     * @param {string | string[]} stores
     * @param {'readwrite'} mode
     * @param {IDBTransactionOptions | undefined} [opts]
     * @returns {ReadWriteTransaction}
     */
    transaction(stores: string | string[], mode: "readwrite", opts?: IDBTransactionOptions | undefined): ReadWriteTransaction;
    /**
     * A convenience method to create a transaction and get an object store.
     * @overload
     * @param {string} name
     * @param {'readonly'} [mode]
     * @param {IDBTransactionOptions} [opts]
     * @returns {ReadOnlyStore}
     */
    store(name: string, mode?: "readonly" | undefined, opts?: IDBTransactionOptions | undefined): ReadOnlyStore;
    /**
     * @overload
     * @param {string} name
     * @param {'readwrite'} mode
     * @param {IDBTransactionOptions} [opts]
     * @returns {ReadWriteStore}
     */
    store(name: string, mode: "readwrite", opts?: IDBTransactionOptions | undefined): ReadWriteStore;
    /**
     * @template {keyof IDBDatabaseEventMap} K
     * @overload
     * @param {K} type
     * @param {(this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any} listener
     * @param {boolean | AddEventListenerOptions} options
     * @returns {this}
     */
    on<K extends keyof IDBDatabaseEventMap>(type: K, listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any, options: boolean | AddEventListenerOptions): this;
    /**
     * @template {keyof IDBDatabaseEventMap} K
     * @overload
     * @param {K} type
     * @param {(this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any} listener
     * @param {boolean | AddEventListenerOptions} options
     * @returns {this}
     */
    once<K extends keyof IDBDatabaseEventMap>(type: K, listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any, options: boolean | AddEventListenerOptions): this;
    /**
     * @template {keyof IDBDatabaseEventMap} K
     * @overload
     * @param {K} type
     * @param {(this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any} listener
     * @param {boolean | EventListenerOptions} options
     * @returns {this}
     */
    off<K extends keyof IDBDatabaseEventMap>(type: K, listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any, options: boolean | EventListenerOptions): this;
    /**
     * @param {Event | string} event
     * @param {EventInit} [init]
     */
    emit(event: Event | string, init?: EventInit): boolean;
    /**
     * @template {keyof IDBDatabaseEventMap} K
     * @overload
     * @param {K} type
     * @param {(this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any} listener
     * @param {boolean | AddEventListenerOptions} options
     * @returns {void}
     */
    addEventListener<K extends keyof IDBDatabaseEventMap>(type: K, listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any, options: boolean | AddEventListenerOptions): void;
    /**
     * @template {keyof IDBDatabaseEventMap} K
     * @overload
     * @param {K} type
     * @param {(this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any} listener
     * @param {boolean | EventListenerOptions} options
     * @returns {void}
     */
    removeEventListener<K extends keyof IDBDatabaseEventMap>(type: K, listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any, options: boolean | EventListenerOptions): void;
    /**
     * @param {Event} event
     */
    dispatchEvent(event: Event): boolean;
    [Symbol.dispose](): void;
    #private;
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
    createStore(name: string, opts: IDBObjectStoreParameters | undefined): UpgradableStore;
    /**
     * Destroy the with the given name in the connected database.
     * @param {string} name
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/deleteObjectStore}
     */
    deleteStore(name: string): void;
}
/**
 * Manage connections to databases and any upgrades.
 */
export class Database extends BaseDatabase {
    /**
     * Create a new instance to manage a connection to a database with the given name.
     * @param {string} name
     */
    static init(name: string): Database;
    /**
     * @protected
     * @param {string} name
     */
    protected constructor();
    get opened(): boolean;
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
    define(versions: (register: RegisterUpgrade, db: UpgradableDatabase, tx: UpgradeTransaction) => void): this;
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
    latest(): this;
    /**
     * Specify a specific database version to open.
     *
     * @example
     * // Will open version 7 of the database.
     * await db.versions(7).open()
     *
     * @param {'latest' | number} num
     */
    versions(num: "latest" | number): this;
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
    open({ version }?: {
        version?: number | undefined;
    }): DBRequest<IDBOpenDBRequest, this>;
    /**
     * @internal
     * @param {IDBVersionChangeEvent} event
     */
    handleEvent({ type, target }: IDBVersionChangeEvent): void;
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
    upgrade({ version }?: {
        version: "latest" | number | undefined;
    }): Promise<this>;
    #private;
}
export default Database;
import { DBRequest } from './req.js';
import { ReadOnlyTransaction } from './tx.js';
import { ReadWriteTransaction } from './tx.js';
import { ReadOnlyStore } from './store.js';
import { ReadWriteStore } from './store.js';
import { UpgradableStore } from './store.js';
import type { RegisterUpgrade } from '#types';
import { UpgradeTransaction } from './tx.js';
//# sourceMappingURL=db.d.ts.map