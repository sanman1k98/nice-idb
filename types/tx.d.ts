/** @typedef {import('#types').Transaction} Transaction */
/**
 * @implements {Transaction}
 * @implements {Disposable}
 */
export class NiceIDBTransaction implements Transaction, Disposable {
    static Upgrade: {
        new (tx: IDBTransaction): {
            /**
             * @param {string} name
             * @override
             */
            store(name: string): {
                "__#private@#store": IDBObjectStore;
                createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters | undefined): import("./idx.js").NiceIDBIndex;
                deleteIndex(name: string): void;
                "__#private@#store": IDBObjectStore;
                get indexes(): readonly string[];
                get autoIncrement(): boolean;
                get keyPath(): string | string[] | null;
                get name(): string;
                get indexNames(): readonly string[];
                index(name: string): import("./idx.js").NiceIDBIndex;
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
            /** @type {IDBTransaction} */ "__#private@#tx": IDBTransaction;
            /** @type {Promise<Event>} */ "__#private@#finish": Promise<Event>;
            /** @type {Event | undefined} */ "__#private@#event": Event | undefined;
            get error(): DOMException | null;
            get durability(): IDBTransactionDurability;
            get mode(): IDBTransactionMode;
            /**
             * @returns {boolean} Returns `true` when the transaction has either committed or aborted.
             */
            get finished(): boolean;
            get committed(): boolean;
            get aborted(): boolean;
            /**
             * @returns {Promise<void>} A promise for when the transaction commits or aborts.
             */
            get finish(): Promise<void>;
            /**
             * List of stores in the scope of this transaction.
             * @see {@link IDBTransaction.prototype.objectStoreNames}
             */
            get storeNames(): readonly string[];
            /** @type {Record<string, NiceIDBStore> | undefined} */
            "__#private@#storesProxy": Record<string, NiceIDBStore> | undefined;
            /**
             * @see {@link IDBTransaction.prototype.objectStoreNames}
             * Access stores in the scope of this transaction.
             * @returns {{ [name: string]: NiceIDBStore }} Can be indexed by store names.
             */
            get stores(): {
                [name: string]: NiceIDBStore;
            };
            /**
             * @param {keyof IDBTransactionEventMap} type
             * @param {(this: IDBTransaction, ev: Event) => any} listener
             * @param {boolean | AddEventListenerOptions} [options]
             */
            addEventListener(type: keyof IDBTransactionEventMap, listener: (this: IDBTransaction, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
            /**
             * @param {keyof IDBTransactionEventMap} type
             * @param {(this: IDBTransaction, ev: Event) => any} listener
             * @param {boolean | EventListenerOptions} [options]
             */
            removeEventListener(type: keyof IDBTransactionEventMap, listener: (this: IDBTransaction, ev: Event) => any, options?: boolean | EventListenerOptions): void;
            abort(): void;
            /**
             * A method to explicitly commit the transaction. This is the same method
             * that will be called when a transaction is assigned to a variable declared
             * with `using`.
             *
             * @example
             *
             * ```ts
             * async function countAllRecords(db: NiceIDB): Promise<number> {
             *   const storeNames = db.storeNames;
             *   using tx = db.transaction(storeNames);
             *   const requests = storeNames.map((name) => tx.store(name).count());
             *   return Promise.all(requests).reduce((x, y) => x + y);
             * }
             * ```
             */
            commit(): void;
            [Symbol.dispose](): void;
        };
        Upgrade: /*elided*/ any;
    };
    /**
     * @param {IDBTransaction} tx - The transaction instance to wrap.
     */
    constructor(tx: IDBTransaction);
    get error(): DOMException | null;
    get durability(): IDBTransactionDurability;
    get mode(): IDBTransactionMode;
    /**
     * @returns {boolean} Returns `true` when the transaction has either committed or aborted.
     */
    get finished(): boolean;
    get committed(): boolean;
    get aborted(): boolean;
    /**
     * @returns {Promise<void>} A promise for when the transaction commits or aborts.
     */
    get finish(): Promise<void>;
    /**
     * List of stores in the scope of this transaction.
     * @see {@link IDBTransaction.prototype.objectStoreNames}
     */
    get storeNames(): readonly string[];
    /**
     * Get an object store within the transaction's scope.
     * @param {string} name
     * @returns {NiceIDBStore} An object store instance.
     */
    store(name: string): NiceIDBStore;
    /**
     * @see {@link IDBTransaction.prototype.objectStoreNames}
     * Access stores in the scope of this transaction.
     * @returns {{ [name: string]: NiceIDBStore }} Can be indexed by store names.
     */
    get stores(): {
        [name: string]: NiceIDBStore;
    };
    /**
     * @param {keyof IDBTransactionEventMap} type
     * @param {(this: IDBTransaction, ev: Event) => any} listener
     * @param {boolean | AddEventListenerOptions} [options]
     */
    addEventListener(type: keyof IDBTransactionEventMap, listener: (this: IDBTransaction, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
    /**
     * @param {keyof IDBTransactionEventMap} type
     * @param {(this: IDBTransaction, ev: Event) => any} listener
     * @param {boolean | EventListenerOptions} [options]
     */
    removeEventListener(type: keyof IDBTransactionEventMap, listener: (this: IDBTransaction, ev: Event) => any, options?: boolean | EventListenerOptions): void;
    abort(): void;
    /**
     * A method to explicitly commit the transaction. This is the same method
     * that will be called when a transaction is assigned to a variable declared
     * with `using`.
     *
     * @example
     *
     * ```ts
     * async function countAllRecords(db: NiceIDB): Promise<number> {
     *   const storeNames = db.storeNames;
     *   using tx = db.transaction(storeNames);
     *   const requests = storeNames.map((name) => tx.store(name).count());
     *   return Promise.all(requests).reduce((x, y) => x + y);
     * }
     * ```
     */
    commit(): void;
    [Symbol.dispose](): void;
    #private;
}
export type Transaction = import("#types").Transaction;
import { NiceIDBStore } from './store.js';
//# sourceMappingURL=tx.d.ts.map