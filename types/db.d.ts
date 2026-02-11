export class BaseDatabase {
    static cmp: (first: any, second: any) => number;
    static databases: () => Promise<IDBDatabaseInfo[]>;
    /**
     * @param {string} name
     */
    static delete(name: string): DBRequest<IDBOpenDBRequest, IDBDatabase, never>;
    /**
     * @overload
     * @param {IDBDatabase} db
     */
    constructor(db: IDBDatabase);
    /**
     * @protected
     * @overload
     * @param {undefined} [db]
     */
    constructor(db?: undefined);
    /** @protected */
    protected set target(arg: IDBDatabase);
    /** @protected */
    protected get target(): IDBDatabase;
    get name(): string;
    get version(): number;
    get storeNames(): readonly string[];
    delete(): DBRequest<IDBOpenDBRequest, IDBDatabase, never>;
    close(): void;
    /**
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
export class UpgradableDatabase extends BaseDatabase {
    /**
     * @param {string} name
     * @param {IDBObjectStoreParameters | undefined} opts
     */
    createStore(name: string, opts: IDBObjectStoreParameters | undefined): UpgradableStore;
    /**
     * @param {string} name
     */
    deleteStore(name: string): void;
}
export class Database extends BaseDatabase {
    /**
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
     * @param {(register: RegisterUpgrade, db: UpgradableDatabase, tx: UpgradeTransaction) => void} versions
     */
    define(versions: (register: RegisterUpgrade, db: UpgradableDatabase, tx: UpgradeTransaction) => void): this;
    latest(): this;
    /**
     * @param {'latest' | number} num
     */
    versions(num: "latest" | number): this;
    open({ version }?: {
        version?: number | undefined;
    }): DBRequest<IDBOpenDBRequest, this, never>;
    /**
     * @internal
     * @param {IDBVersionChangeEvent} event
     */
    handleEvent({ type, target }: IDBVersionChangeEvent): void;
    /**
     * @param {object} [opts]
     * @param {'latest' | number | undefined} opts.version
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