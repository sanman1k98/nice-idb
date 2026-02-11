/**
 * Read-only methods shared by both objects stores and their indexes.
 * @template {IDBObjectStore | IDBIndex} T
 */
export class ReadOnlySource<T extends IDBObjectStore | IDBIndex> {
    /**
     * @param {T} source
     */
    constructor(source: T);
    get name(): string;
    get keyPath(): string | string[] | null;
    /**
     * @protected
     */
    protected get target(): T;
    get mode(): IDBTransactionMode;
    /**
     * @param {IDBValidKey | IDBKeyRange} [key]
     */
    count(key?: IDBValidKey | IDBKeyRange): DBRequest<IDBRequest<number>, number, never>;
    /**
     * @param {IDBValidKey | IDBKeyRange} query
     */
    get(query: IDBValidKey | IDBKeyRange): DBRequest<IDBRequest<any>, any, never>;
    /**
     * @param {IDBValidKey | IDBKeyRange | null | undefined} [query]
     * @param {number | undefined} [count]
     */
    getAll(query?: IDBValidKey | IDBKeyRange | null | undefined, count?: number | undefined): DBRequest<IDBRequest<any[]>, any[], never>;
    /**
     * @param {IDBValidKey | IDBKeyRange | null | undefined} [query]
     * @param {number | undefined} [count]
     */
    getAllKeys(query?: IDBValidKey | IDBKeyRange | null | undefined, count?: number | undefined): DBRequest<IDBRequest<IDBValidKey[]>, IDBValidKey[], never>;
    /**
     * @param {IDBValidKey | IDBKeyRange} key
     */
    getKey(key: IDBValidKey | IDBKeyRange): DBRequest<IDBRequest<IDBValidKey | undefined>, IDBValidKey | undefined, never>;
    /**
     * @param {OpenCursorOptions | undefined} [opts]
     */
    cursor(opts?: OpenCursorOptions | undefined): ReadOnlyCursor;
    /**
     * @param {OpenCursorOptions | undefined} [opts]
     */
    keyCursor(opts?: OpenCursorOptions | undefined): ReadOnlyKeyCursor<IDBCursor>;
    /**
     * @param {OpenCursorOptions | undefined} [opts]
     */
    iter(opts?: OpenCursorOptions | undefined): AsyncGenerator<ReadOnlyCursor, void, unknown>;
    /**
     * @param {OpenCursorOptions | undefined} [opts]
     */
    iterKeys(opts?: OpenCursorOptions | undefined): AsyncGenerator<ReadOnlyKeyCursor<IDBCursor>, void, unknown>;
    [Symbol.asyncIterator](): ReadOnlyCursor;
    #private;
}
export default ReadOnlySource;
import { DBRequest } from './req';
import type { OpenCursorOptions } from '#types';
import { ReadOnlyCursor } from './cursor';
import { ReadOnlyKeyCursor } from './cursor';
//# sourceMappingURL=source.d.ts.map