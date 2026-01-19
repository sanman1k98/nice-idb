/** @typedef {import('#types').Index} Index */
/**
 * @implements {Index}
 * @implements {AsyncIterable<IDBCursorWithValue>}
 */
export class NiceIDBIndex implements Index, AsyncIterable<IDBCursorWithValue> {
    /** @param {IDBIndex} idx */
    constructor(idx: IDBIndex);
    get keyPath(): string | string[];
    get multiEntry(): boolean;
    get name(): string;
    get unique(): boolean;
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
     * Traverse the index with an {@link IDBCursorWithValue} in a `for await ... of` loop.
     *
     * @example
     *
     * ```ts
     * const store = db.tx('store-name', 'readonly').store('store-name');
     * const index = store.index('index-name');
     * for await (const cursor of index.iter({ dir: 'prev' })) {
     *   const { key, value } = cursor;
     *   console.log(key, value);
     *   // `cursor.continue()` is automatically called.
     * }
     * ```
     *
     * @param {import('./util').CursorOptions} opts
     * @returns {AsyncIterable<IDBCursorWithValue>} The cursor instance.
     */
    iter(opts: import("./util").CursorOptions): AsyncIterable<IDBCursorWithValue>;
    /**
     * Traverse the index's keys with an {@link IDBCursor} in a `for await ... of` loop.
     *
     * @see {@link NiceIDBIndex#iter}
     *
     * @param {import('./util').CursorOptions} opts
     * @returns {AsyncIterable<IDBCursor>} The cursor instance.
     */
    iterKeys(opts: import("./util").CursorOptions): AsyncIterable<IDBCursor>;
    [Symbol.asyncIterator](): AsyncGenerator<IDBCursorWithValue, void, any>;
    #private;
}
export type Index = import("#types").Index;
//# sourceMappingURL=idx.d.ts.map