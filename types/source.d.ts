/**
 * @template {WrapperClass<IDBIndex | IDBObjectStore>} C
 * @template {C extends WrapperClass<infer U> ? U : never} T
 * @param {Constructor<C> & { mode: IDBTransactionMode }} Class
 */
export function createModeGuardedWrap<C extends WrapperClass<IDBIndex | IDBObjectStore>, T extends C extends WrapperClass<infer U> ? U : never>(Class: Constructor<C> & {
    mode: IDBTransactionMode;
}): (target: T) => C;
/**
 * Read-only methods for object store and index sources.
 * @template {IDBIndex | IDBObjectStore} T
 * @param {Constructor<T>} Source
 */
export function Readable<T extends IDBIndex | IDBObjectStore>(Source: Constructor<T>): {
    new (): {
        get name(): string;
        get keyPath(): string | string[] | null;
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
        [Symbol.asyncIterator](): ReadOnlyCursor;
        get target(): T;
        wrap(target: T): /*elided*/ any;
    };
    new (target: T): {
        get name(): string;
        get keyPath(): string | string[] | null;
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
        [Symbol.asyncIterator](): ReadOnlyCursor;
        get target(): T;
        wrap(target: T): /*elided*/ any;
    };
    /**
     * @type {IDBTransactionMode}
     */
    mode: IDBTransactionMode;
    wrap(target: objectT): WrapperClass<object>;
};
import type { WrapperClass } from '#types';
import type { Constructor } from '#types';
import { DBRequest } from './req.js';
import type { OpenCursorOptions } from '#types';
import { ReadOnlyCursor } from './cursor.js';
import { ReadOnlyKeyCursor } from './cursor.js';
//# sourceMappingURL=source.d.ts.map