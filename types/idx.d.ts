/**
 * @implements {NiceIDB.Index}
 */
export class NiceIDBIndex implements NiceIDB.Index {
    /** @param {IDBIndex} idx */
    constructor(idx: IDBIndex);
    /** @type {string | string[]} */
    keyPath: string | string[];
    /** @type {boolean} */
    multiEntry: boolean;
    /** @type {string} */
    name: string;
    /** @type {IDBObjectStore} */
    objectStore: IDBObjectStore;
    /** @type {boolean} */
    unique: boolean;
    /** @param {IDBValidKey | IDBKeyRange} [query] */
    count(query?: IDBValidKey | IDBKeyRange): Promise<number>;
    /** @param {IDBValidKey | IDBKeyRange} query */
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
    /** @param {IDBValidKey | IDBKeyRange} query */
    getKey(query: IDBValidKey | IDBKeyRange): Promise<IDBValidKey | undefined>;
    /**
     * @param {import('./util').CursorOptions} opts
     */
    iter(opts: import("./util").CursorOptions): AsyncGenerator<IDBCursorWithValue, void, any>;
    /**
     * @param {import('./util').CursorOptions} opts
     */
    iterKeys(opts: import("./util").CursorOptions): AsyncGenerator<IDBCursor, void, any>;
    [Symbol.asyncIterator](): AsyncGenerator<IDBCursorWithValue, void, any>;
    #private;
}
//# sourceMappingURL=idx.d.ts.map