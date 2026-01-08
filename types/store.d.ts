/** @typedef {import('#types').ObjectStore} ObjectStore */
/**
 * @implements {ObjectStore}
 * @implements {AsyncIterable<IDBCursorWithValue>}
 */
export class NiceIDBObjectStore implements ObjectStore, AsyncIterable<IDBCursorWithValue> {
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
     * @param {string} name - Name of the index.
     * @param {string | string[]} keyPath - The key path.
     * @param {IDBIndexParameters} [options] - Additional options to configure the index.
     * @returns {NiceIDBIndex} The newly created index.
     */
    createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters): NiceIDBIndex;
    /**
     * @param {string} name - Name of the index.
     */
    deleteIndex(name: string): void;
    /**
     * @param {any} value
     * @param {IDBValidKey} [key]
     */
    add(value: any, key?: IDBValidKey): Promise<IDBValidKey>;
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
     * @param {import('./util').CursorOptions} [opts]
     * @returns {AsyncIterable<IDBCursorWithValue>} An AsyncIterable that returns an IDBCursorWithValue.
     */
    iter(opts?: import("./util").CursorOptions): AsyncIterable<IDBCursorWithValue>;
    /**
     * @param {import('./util').CursorOptions} [opts]
     */
    iterKeys(opts?: import("./util").CursorOptions): AsyncGenerator<IDBCursor, void, any>;
    [Symbol.asyncIterator](): AsyncGenerator<IDBCursorWithValue, void, any>;
    #private;
}
export type ObjectStore = import("#types").ObjectStore;
import { NiceIDBIndex } from './idx.js';
//# sourceMappingURL=store.d.ts.map