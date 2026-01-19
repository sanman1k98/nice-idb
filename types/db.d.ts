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
export class NiceIDB implements Database, Disposable {
    static Request: typeof NiceIDBRequest;
    static Transaction: typeof NiceIDBTransaction;
    static Store: typeof NiceIDBStore;
    static Index: typeof NiceIDBIndex;
    static UpgradeTransaction: {
        new (tx: IDBTransaction): {
            store(name: string): {
                "__#private@#store": IDBObjectStore;
                createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters | undefined): NiceIDBIndex;
                deleteIndex(name: string): void;
                "__#private@#store": IDBObjectStore;
                get indexes(): readonly string[];
                get autoIncrement(): boolean;
                get keyPath(): string | string[] | null;
                get name(): string;
                get indexNames(): readonly string[];
                index(name: string): NiceIDBIndex;
                add(value: any, key?: IDBValidKey): Promise<IDBValidKey>;
                clear(): Promise<undefined>;
                count(query?: IDBValidKey | IDBKeyRange): Promise<number>;
                delete(query: IDBValidKey | IDBKeyRange): Promise<undefined>;
                get(query: IDBValidKey | IDBKeyRange): Promise<any>;
                getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<any[]>;
                getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<IDBValidKey[]>;
                getKey(query: IDBValidKey | IDBKeyRange): Promise<IDBValidKey | undefined>;
                put(value: any, key?: IDBValidKey): Promise<IDBValidKey>;
                iter(opts?: import("./util.js").CursorOptions): AsyncIterable<IDBCursorWithValue>;
                iterKeys(opts?: import("./util.js").CursorOptions): AsyncIterable<IDBCursor>;
                [Symbol.asyncIterator](): AsyncGenerator<IDBCursorWithValue, void, any>;
            };
            "__#private@#tx": IDBTransaction;
            "__#private@#event": Promise<Event>;
            "__#private@#finished": boolean;
            "__#private@#aborted": boolean;
            get durability(): IDBTransactionDurability;
            get mode(): IDBTransactionMode;
            get finished(): boolean;
            get aborted(): boolean;
            "__#private@#storesProxy": Record<string, NiceIDBStore> | undefined;
            get stores(): {
                [name: string]: NiceIDBStore;
            };
            get storeNames(): readonly string[];
            get error(): DOMException | null;
            abort(): void;
            addEventListener(type: keyof IDBTransactionEventMap, listener: (this: IDBTransaction, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
            removeEventListener(type: keyof IDBTransactionEventMap, listener: (this: IDBTransaction, ev: Event) => any, options?: boolean | EventListenerOptions): void;
            commit(): void;
            promise(): Promise<void>;
            done(): Promise<void>;
            [Symbol.dispose](): void;
        };
        Upgrade: /*elided*/ any;
    };
    static UpgradableStore: {
        new (store: IDBObjectStore, tx: IDBTransaction | null): {
            "__#private@#store": IDBObjectStore;
            createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters | undefined): NiceIDBIndex;
            deleteIndex(name: string): void;
            "__#private@#store": IDBObjectStore;
            get indexes(): readonly string[];
            get autoIncrement(): boolean;
            get keyPath(): string | string[] | null;
            get name(): string;
            get indexNames(): readonly string[];
            index(name: string): NiceIDBIndex;
            add(value: any, key?: IDBValidKey): Promise<IDBValidKey>;
            clear(): Promise<undefined>;
            count(query?: IDBValidKey | IDBKeyRange): Promise<number>;
            delete(query: IDBValidKey | IDBKeyRange): Promise<undefined>;
            get(query: IDBValidKey | IDBKeyRange): Promise<any>;
            getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<any[]>;
            getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<IDBValidKey[]>;
            getKey(query: IDBValidKey | IDBKeyRange): Promise<IDBValidKey | undefined>;
            put(value: any, key?: IDBValidKey): Promise<IDBValidKey>;
            iter(opts?: import("./util.js").CursorOptions): AsyncIterable<IDBCursorWithValue>;
            iterKeys(opts?: import("./util.js").CursorOptions): AsyncIterable<IDBCursor>;
            [Symbol.asyncIterator](): AsyncGenerator<IDBCursorWithValue, void, any>;
        };
        Upgradable: /*elided*/ any;
    };
    /**
     * Compare two keys.
     * @param {IDBValidKey} a
     * @param {IDBValidKey} b
     * @returns {-1 | 0 | 1} Comparison result.
     * @see {@link window.indexedDB.cmp}
     */
    static cmp(a: IDBValidKey, b: IDBValidKey): -1 | 0 | 1;
    /**
     * Get the names and versions of all available databases.
     * @returns {Promise<IDBDatabaseInfo[]>} A promise that resolves to the list of databases.
     * @see {@link window.indexedDB.databases}
     */
    static databases(): Promise<IDBDatabaseInfo[]>;
    /**
     * Delete a database.
     * @param {string} name
     */
    static delete(name: string): NiceIDBRequest<IDBOpenDBRequest, null>;
    /**
     * @param {string} name - Name of the database to open.
     * @param {number} [version] - Optional version number.
     */
    static open(name: string, version?: number): NiceIDBRequest<IDBOpenDBRequest, NiceIDB>;
    /**
     * @param {IDBDatabase | string} db - A database name or instance.
     */
    constructor(db: IDBDatabase | string);
    /**
     * Returns `true` when there is an active connection to the underlying database.
     */
    get opened(): boolean;
    get name(): string;
    get version(): number;
    /**
     * @param {DefineDatabaseVersions} defineVersions
     */
    define(defineVersions: DefineDatabaseVersions): this;
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
    open(version?: number): NiceIDBRequest<IDBOpenDBRequest, this>;
    /**
     * List of object stores in the database.
     * @see {@link IDBDatabase.prototype.objectStoreNames}
     */
    get storeNames(): readonly string[];
    /**
     * @param {keyof IDBDatabaseEventMap} type
     * @param {(this: IDBDatabase, ev: Event | IDBVersionChangeEvent) => any} listener
     * @param {boolean | AddEventListenerOptions} options
     */
    addEventListener(type: keyof IDBDatabaseEventMap, listener: (this: IDBDatabase, ev: Event | IDBVersionChangeEvent) => any, options: boolean | AddEventListenerOptions): void;
    /**
     * @param {keyof IDBDatabaseEventMap} type
     * @param {(this: IDBDatabase, ev: Event | IDBVersionChangeEvent) => any} listener
     * @param {boolean | EventListenerOptions} options
     */
    removeEventListener(type: keyof IDBDatabaseEventMap, listener: (this: IDBDatabase, ev: Event | IDBVersionChangeEvent) => any, options: boolean | EventListenerOptions): void;
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
    transaction(stores: string | string[], mode?: TransactionMode, options?: IDBTransactionOptions): NiceIDBTransaction;
    /**
     * Convenience method to access a single object store.
     *
     * @param {string} name - Name of the object store.
     * @param {TransactionMode} [mode] - The transaction mode to access the object store; defaults to "readonly".
     * @param {IDBTransactionOptions} [opts] - Defaults to `{ durability: "default" }`
     * @returns {NiceIDBStore} The object store instance.
     */
    store(name: string, mode?: TransactionMode, opts?: IDBTransactionOptions): NiceIDBStore;
    close(): void;
    SELF_DESTRUCT(): NiceIDBRequest<IDBOpenDBRequest, null>;
    [Symbol.dispose](): void;
    #private;
}
export type Database = import("#types").Database;
/**
 * A callback that makes changes to the database like creating or deleting
 * object stores and indexes.
 */
export type UpgradeCallback = () => void | Promise<void>;
/**
 * Defines the changes to the database for a specific version.
 */
export type DefineVersionedUpgrade = (versionNumber: number, upgrade: UpgradeCallback) => void;
/**
 * Defines all versions of the database, starting from version 1.
 */
export type DefineDatabaseVersions = (defineVersion: DefineVersionedUpgrade, db: NiceIDBUpgradableDatabase, tx: NiceIDBUpgradeTransaction) => void | Promise<void>;
export type DatabaseUpgradeMethods = {
    /**
     * - Create an object store.
     */
    createStore: (name: string, options?: IDBObjectStoreParameters) => NiceIDBUpgradableStore;
    /**
     * - Delete an object store.
     */
    deleteStore: (name: string) => void;
};
export type NiceIDBUpgradableDatabase = NiceIDB & DatabaseUpgradeMethods;
export type NiceIDBUpgradeTransaction = InstanceType<typeof NiceIDBTransaction.Upgrade>;
export type NiceIDBUpgradableStore = InstanceType<typeof NiceIDBStore.Upgradable>;
export type UpgradeState = {
    /**
     * - To keep track of whether the transaction was aborted between executing upgrade callbacks.
     */
    aborted?: boolean;
    /**
     * - A reference to the "upgrade transaction".
     */
    tx?: IDBTransaction | null;
    /**
     * - A map of version numbers to upgrade callbacks.
     */
    versions: Map<number, UpgradeCallback>;
    /**
     * - A function to call after handling the "upgradeneeded" event.
     */
    revokeProxies: () => void;
};
export type TransactionMode = "ro" | "rw" | "readonly" | "readwrite";
import { NiceIDBRequest } from './req.js';
import { NiceIDBTransaction } from './tx.js';
import { NiceIDBStore } from './store.js';
import { NiceIDBIndex } from './idx.js';
//# sourceMappingURL=db.d.ts.map