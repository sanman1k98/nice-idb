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
export class NiceIDB implements Database, Disposable {
    /**
     * Compare two keys.
     * @param {IDBValidKey} a
     * @param {IDBValidKey} b
     * @returns {-1 | 0 | 1} Comparison result.
     * @see {@link window.indexedDB.cmp}
     */
    static compare(a: IDBValidKey, b: IDBValidKey): -1 | 0 | 1;
    /**
     * Get the names and versions of all available databases.
     * @returns {Promise<IDBDatabaseInfo[]>} A promise that resolves to the list of databases.
     * @see {@link window.indexedDB.databases}
     */
    static databases(): Promise<IDBDatabaseInfo[]>;
    /**
     * Delete a database.
     * @param {string} name
     * @returns {Promise<null>} A Promise that resolves to `null` if successful.
     */
    static delete(name: string): Promise<null>;
    /**
     * @param {string} name - The name of the database to define the schema for.
     * @param {DefineDatabaseSchema} defineSchema - A callback defining the database schema for each version of it.
     * @returns {Promise<NiceIDB>} The upgraded database instance.
     */
    static define(name: string, defineSchema: DefineDatabaseSchema): Promise<NiceIDB>;
    /**
     * Open a database.
     * @param {string} name - Name of the database.
     * @param {number} [version] - A positive integer. If ommitted and the database already exists, this method will open a connection to it.
     * @param {NiceIDBUpgradeCallback} [upgradeHandler] - An optional callback to handle the "upgradeneeded" event.
     * @returns {Promise<NiceIDB>} A Promise that resolves to a database instance.
     */
    static open(name: string, version?: number, upgradeHandler?: NiceIDBUpgradeCallback): Promise<NiceIDB>;
    /**
     * @param {IDBDatabase} db - The database instance to wrap.
     */
    constructor(db: IDBDatabase);
    get name(): string;
    get version(): number;
    /**
     * List of object stores in the database.
     * @deprecated Use `NiceIDB.prototype.storeNames` instead.
     * @see {@link IDBDatabase.prototype.objectStoreNames}
     */
    get stores(): readonly string[];
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
     * Create a new object store.
     * @param {string} name
     * @param {IDBObjectStoreParameters} [options]
     * @returns {NiceIDBObjectStore} An object store instance.
     */
    createStore(name: string, options?: IDBObjectStoreParameters): NiceIDBObjectStore;
    /**
     * @param {string} name
     */
    deleteStore(name: string): void;
    /**
     * Create a new object store.
     * @deprecated
     * @param {string} name
     * @param {IDBObjectStoreParameters} [options]
     * @returns {NiceIDBObjectStore} An object store instance.
     */
    createObjectStore(name: string, options?: IDBObjectStoreParameters): NiceIDBObjectStore;
    /**
     * @deprecated
     * @param {string} name
     */
    deleteObjectStore(name: string): void;
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
     * @returns {NiceIDBObjectStore} The object store instance.
     */
    store(name: string, mode?: TransactionMode, opts?: IDBTransactionOptions): NiceIDBObjectStore;
    close(): void;
    [Symbol.dispose](): void;
    #private;
}
export type Database = import("#types").Database;
export type NiceIDBUpgradeCallback = (db: NiceIDB, tx: NiceIDBTransaction, event: IDBVersionChangeEvent) => void | Promise<void>;
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
export type DefineDatabaseSchema = (defineVersion: DefineVersionedUpgrade, db: NiceIDB, tx: NiceIDBTransaction) => void | Promise<void>;
export type TransactionMode = "ro" | "rw" | "readonly" | "readwrite";
import { NiceIDBObjectStore } from './store.js';
import { NiceIDBTransaction } from './tx.js';
//# sourceMappingURL=db.d.ts.map