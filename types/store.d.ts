/** @typedef {import('#types').ObjectStore} ObjectStore */
/**
 * @implements {ObjectStore}
 * @implements {AsyncIterable<IDBCursorWithValue>}
 */
export class NiceIDBStore implements ObjectStore, AsyncIterable<IDBCursorWithValue> {
    /** An upgradable object store to be used within "upgrade transactions". */
    static Upgradable: {
        new (store: IDBObjectStore, tx: IDBTransaction | null): {
            /** @type {IDBObjectStore} */ "__#private@#store": IDBObjectStore;
            /**
             * @param {string} name
             * @param {string | string[]} keyPath
             * @param {IDBIndexParameters | undefined} [options]
             */
            createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters | undefined): NiceIDBIndex;
            /**
             * @param {string} name
             */
            deleteIndex(name: string): void;
            /** @type {IDBObjectStore} */ "__#private@#store": IDBObjectStore;
            /**
             * List of index names for this store.
             * @deprecated
             * @see {@link IDBObjectStore.prototype.indexNames}
             */
            get indexes(): readonly string[];
            get autoIncrement(): boolean;
            get keyPath(): string | string[] | null;
            get name(): string;
            /**
             * List of index names for this store.
             * @see {@link IDBObjectStore.prototype.indexNames}
             */
            get indexNames(): readonly string[];
            /**
             * Open a named index in the current store.
             *
             * @param {string} name
             * @returns {NiceIDBIndex} An object for accessing the index.
             */
            index(name: string): NiceIDBIndex;
            /**
             * @param {any} value
             * @param {IDBValidKey} [key]
             */
            add(value: any, key?: IDBValidKey): Promise<IDBValidKey>;
            /**
             * Clear all records from the store.
             *
             * @returns {Promise<undefined>}
             */
            clear(): Promise<undefined>;
            /**
             * @param {IDBValidKey | IDBKeyRange} [query]
             */
            count(query?: IDBValidKey | IDBKeyRange): Promise<number>;
            /**
             * @param {IDBValidKey | IDBKeyRange} query
             */
            delete(query: IDBValidKey | IDBKeyRange): Promise<undefined>;
            /**
             * @param {IDBValidKey | IDBKeyRange} query
             */
            get(query: IDBValidKey | IDBKeyRange): Promise<any>;
            /**
             * @param {IDBValidKey | IDBKeyRange | null} [query]
             * @param {number} [count]
             */
            getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<any[]>;
            /**
             * @param {IDBValidKey | IDBKeyRange | null} [query]
             * @param {number} [count]
             */
            getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<IDBValidKey[]>;
            /**
             * @param {IDBValidKey | IDBKeyRange} query
             */
            getKey(query: IDBValidKey | IDBKeyRange): Promise<IDBValidKey | undefined>;
            /**
             * @param {any} value
             * @param {IDBValidKey} [key]
             */
            put(value: any, key?: IDBValidKey): Promise<IDBValidKey>;
            /**
             * Traverse the store with an {@link IDBCursorWithValue} in a `for await ... of` loop.
             *
             * @example
             *
             * ```ts
             * const store = db.tx('store-name', 'readonly').store('store-name');
             * for await (const cursor of store.iter({ dir: 'prev' })) {
             *   const { key, value } = cursor;
             *   console.log(key, value);
             *   // `cursor.continue()` is automatically called.
             * }
             * ```
             *
             * @param {import('./util').CursorOptions} [opts]
             * @returns {AsyncIterable<IDBCursorWithValue>} The cursor instance.
             */
            iter(opts?: import("./util").CursorOptions): AsyncIterable<IDBCursorWithValue>;
            /**
             * Traverse the store's keys with an {@link IDBCursor} in a `for await ... of` loop.
             *
             * @see {@link NiceIDBStore#iter}
             *
             * @param {import('./util').CursorOptions} [opts]
             * @returns {AsyncIterable<IDBCursor>} The cursor instance.
             */
            iterKeys(opts?: import("./util").CursorOptions): AsyncIterable<IDBCursor>;
            /**
             * Shortcut for {@link NiceIDBStore#iter}.
             *
             * @example
             *
             * ```ts
             * for await (const cursor of db.tx('store-name', 'readonly').store('store-name')) {
             *   const { key, value } = cursor;
             *   console.log(key, value);
             * }
             * ```
             */
            [Symbol.asyncIterator](): AsyncGenerator<IDBCursorWithValue, void, any>;
        };
        Upgradable: /*elided*/ any;
    };
    /**
     * @param {IDBObjectStore} store - The object store instance to wrap.
     */
    constructor(store: IDBObjectStore);
    /**
     * List of index names for this store.
     * @deprecated
     * @see {@link IDBObjectStore.prototype.indexNames}
     */
    get indexes(): readonly string[];
    get autoIncrement(): boolean;
    get keyPath(): string | string[] | null;
    get name(): string;
    /**
     * List of index names for this store.
     * @see {@link IDBObjectStore.prototype.indexNames}
     */
    get indexNames(): readonly string[];
    /**
     * Open a named index in the current store.
     *
     * @param {string} name
     * @returns {NiceIDBIndex} An object for accessing the index.
     */
    index(name: string): NiceIDBIndex;
    /**
     * @param {any} value
     * @param {IDBValidKey} [key]
     */
    add(value: any, key?: IDBValidKey): Promise<IDBValidKey>;
    /**
     * Clear all records from the store.
     *
     * @returns {Promise<undefined>}
     */
    clear(): Promise<undefined>;
    /**
     * @param {IDBValidKey | IDBKeyRange} [query]
     */
    count(query?: IDBValidKey | IDBKeyRange): Promise<number>;
    /**
     * @param {IDBValidKey | IDBKeyRange} query
     */
    delete(query: IDBValidKey | IDBKeyRange): Promise<undefined>;
    /**
     * @param {IDBValidKey | IDBKeyRange} query
     */
    get(query: IDBValidKey | IDBKeyRange): Promise<any>;
    /**
     * @param {IDBValidKey | IDBKeyRange | null} [query]
     * @param {number} [count]
     */
    getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<any[]>;
    /**
     * @param {IDBValidKey | IDBKeyRange | null} [query]
     * @param {number} [count]
     */
    getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<IDBValidKey[]>;
    /**
     * @param {IDBValidKey | IDBKeyRange} query
     */
    getKey(query: IDBValidKey | IDBKeyRange): Promise<IDBValidKey | undefined>;
    /**
     * @param {any} value
     * @param {IDBValidKey} [key]
     */
    put(value: any, key?: IDBValidKey): Promise<IDBValidKey>;
    /**
     * Traverse the store with an {@link IDBCursorWithValue} in a `for await ... of` loop.
     *
     * @example
     *
     * ```ts
     * const store = db.tx('store-name', 'readonly').store('store-name');
     * for await (const cursor of store.iter({ dir: 'prev' })) {
     *   const { key, value } = cursor;
     *   console.log(key, value);
     *   // `cursor.continue()` is automatically called.
     * }
     * ```
     *
     * @param {import('./util').CursorOptions} [opts]
     * @returns {AsyncIterable<IDBCursorWithValue>} The cursor instance.
     */
    iter(opts?: import("./util").CursorOptions): AsyncIterable<IDBCursorWithValue>;
    /**
     * Traverse the store's keys with an {@link IDBCursor} in a `for await ... of` loop.
     *
     * @see {@link NiceIDBStore#iter}
     *
     * @param {import('./util').CursorOptions} [opts]
     * @returns {AsyncIterable<IDBCursor>} The cursor instance.
     */
    iterKeys(opts?: import("./util").CursorOptions): AsyncIterable<IDBCursor>;
    /**
     * Shortcut for {@link NiceIDBStore#iter}.
     *
     * @example
     *
     * ```ts
     * for await (const cursor of db.tx('store-name', 'readonly').store('store-name')) {
     *   const { key, value } = cursor;
     *   console.log(key, value);
     * }
     * ```
     */
    [Symbol.asyncIterator](): AsyncGenerator<IDBCursorWithValue, void, any>;
    #private;
}
export type ObjectStore = import("#types").ObjectStore;
import { NiceIDBIndex } from './idx.js';
//# sourceMappingURL=store.d.ts.map