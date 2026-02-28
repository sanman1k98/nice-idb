/**
 * Methods shared by both object stores and indexes.
 * @template {IDBIndex | IDBObjectStore} T
 * @extends {Wrapper<T>}
 */
export class ReadOnlySource<T extends IDBIndex | IDBObjectStore> extends Wrapper<T> {
    /**
     * @type {IDBTransactionMode}
     */
    static mode: IDBTransactionMode;
    constructor(target?: T | undefined);
    /**
     * The name of this source.
     */
    get name(): string;
    /**
     * The key path of this source.
     */
    get keyPath(): string | string[] | null;
    /**
     * Get the total number of records in this source, or the number of ones
     * that match the provided key or key range.
     * @param {IDBValidKey | IDBKeyRange} [key]
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/count}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBIndex/count}
     */
    count(key?: IDBValidKey | IDBKeyRange): DBRequest<IDBRequest<number>, number, never>;
    /**
     * Get the record selected by the given key.
     * @param {IDBValidKey | IDBKeyRange} query
     */
    get(query: IDBValidKey | IDBKeyRange): DBRequest<IDBRequest<any>, any, never>;
    /**
     * Get all records in this source matching the specified key range, or all
     * the records in this source if no argument is provided.
     * @param {IDBValidKey | IDBKeyRange | null | undefined} [query]
     * @param {number | undefined} [count]
     */
    getAll(query?: IDBValidKey | IDBKeyRange | null | undefined, count?: number | undefined): DBRequest<IDBRequest<any[]>, any[], never>;
    /**
     * Get all keys for all records in this source matching the specified key
     * range, or all keys in this source if no argument is provided.
     * @param {IDBValidKey | IDBKeyRange | null | undefined} [query]
     * @param {number | undefined} [count]
     */
    getAllKeys(query?: IDBValidKey | IDBKeyRange | null | undefined, count?: number | undefined): DBRequest<IDBRequest<IDBValidKey[]>, IDBValidKey[], never>;
    /**
     * Get the first key in this source that matches the given key range.
     * @param {IDBValidKey | IDBKeyRange} key
     */
    getKey(key: IDBValidKey | IDBKeyRange): DBRequest<IDBRequest<IDBValidKey | undefined>, IDBValidKey | undefined, never>;
    /**
     * Open a cursor.
     * @param {OpenCursorOptions | undefined} [opts]
     */
    cursor(opts?: OpenCursorOptions | undefined): ReadOnlyCursor;
    /**
     * Open a read-only key cursor.
     * @param {OpenCursorOptions | undefined} [opts]
     */
    keyCursor(opts?: OpenCursorOptions | undefined): ReadOnlyKeyCursor;
    [Symbol.asyncIterator](): ReadOnlyCursor;
}
import { Wrapper } from './wrap.js';
import { DBRequest } from './req.js';
import type { OpenCursorOptions } from '#types';
import { ReadOnlyCursor } from './cursor.js';
import { ReadOnlyKeyCursor } from './cursor.js';
//# sourceMappingURL=source.d.ts.map