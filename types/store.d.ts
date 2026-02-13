declare const ReadOnlyStore_base: {
    new (): {
        get name(): string;
        get keyPath(): string | string[] | null;
        count(key?: IDBValidKey | IDBKeyRange): DBRequest<IDBRequest<number>, number, never>;
        get(query: IDBValidKey | IDBKeyRange): DBRequest<IDBRequest<any>, any, never>;
        getAll(query?: IDBValidKey | IDBKeyRange | null | undefined, count?: number | undefined): DBRequest<IDBRequest<any[]>, any[], never>;
        getAllKeys(query?: IDBValidKey | IDBKeyRange | null | undefined, count?: number | undefined): DBRequest<IDBRequest<IDBValidKey[]>, IDBValidKey[], never>;
        getKey(key: IDBValidKey | IDBKeyRange): DBRequest<IDBRequest<IDBValidKey | undefined>, IDBValidKey | undefined, never>;
        cursor(opts?: OpenCursorOptions | undefined): import("./cursor.js").ReadOnlyCursor;
        keyCursor(opts?: OpenCursorOptions | undefined): import("./cursor.js").ReadOnlyKeyCursor<IDBCursor>;
        [Symbol.asyncIterator](): import("./cursor.js").ReadOnlyCursor;
        get target(): IDBObjectStore;
        wrap(target: IDBObjectStore): /*elided*/ any;
    };
    new (target: IDBObjectStore): {
        get name(): string;
        get keyPath(): string | string[] | null;
        count(key?: IDBValidKey | IDBKeyRange): DBRequest<IDBRequest<number>, number, never>;
        get(query: IDBValidKey | IDBKeyRange): DBRequest<IDBRequest<any>, any, never>;
        getAll(query?: IDBValidKey | IDBKeyRange | null | undefined, count?: number | undefined): DBRequest<IDBRequest<any[]>, any[], never>;
        getAllKeys(query?: IDBValidKey | IDBKeyRange | null | undefined, count?: number | undefined): DBRequest<IDBRequest<IDBValidKey[]>, IDBValidKey[], never>;
        getKey(key: IDBValidKey | IDBKeyRange): DBRequest<IDBRequest<IDBValidKey | undefined>, IDBValidKey | undefined, never>;
        cursor(opts?: OpenCursorOptions | undefined): import("./cursor.js").ReadOnlyCursor;
        keyCursor(opts?: OpenCursorOptions | undefined): import("./cursor.js").ReadOnlyKeyCursor<IDBCursor>;
        [Symbol.asyncIterator](): import("./cursor.js").ReadOnlyCursor;
        get target(): IDBObjectStore;
        wrap(target: IDBObjectStore): /*elided*/ any;
    };
    mode: IDBTransactionMode;
    wrap(target: objectT): import("#types").WrapperClass<object>;
};
export class ReadOnlyStore extends ReadOnlyStore_base {
    /**
     * Wrap an exising IDBObjectStore instance.
     * @override
     */
    static override wrap: (target: IDBObjectStore) => ReadOnlyStore;
    get autoIncrement(): boolean;
    get indexNames(): readonly string[];
    /**
     * @param {string} name
     */
    index(name: string): ReadOnlyIndex;
}
export class ReadWriteStore extends ReadOnlyStore {
    /**
     * @override
     */
    static override wrap: (target: IDBObjectStore) => ReadWriteStore;
    /**
     * @param {any} value
     * @param {IDBValidKey | undefined} [key]
     */
    add(value: any, key?: IDBValidKey | undefined): DBRequest<IDBRequest<IDBValidKey>, IDBValidKey, never>;
    clear(): DBRequest<IDBRequest<undefined>, undefined, never>;
    /**
     * @param {IDBValidKey | IDBKeyRange} key
     */
    delete(key: IDBValidKey | IDBKeyRange): DBRequest<IDBRequest<undefined>, undefined, never>;
    /**
     * @param {any} value
     * @param {IDBValidKey | undefined} [key]
     */
    put(value: any, key?: IDBValidKey | undefined): DBRequest<IDBRequest<IDBValidKey>, IDBValidKey, never>;
    /**
     * @param {OpenCursorOptions | undefined} [opts]
     * @override
     */
    override cursor(opts?: OpenCursorOptions | undefined): ReadWriteCursor;
    /**
     * @param {string} name
     * @override
     */
    override index(name: string): ReadWriteIndex;
}
export class UpgradableStore extends ReadWriteStore {
    /**
     * @override
     */
    static override wrap: (target: IDBObjectStore) => UpgradableStore;
    /**
     * @param {string} name
     * @param {string | string[]} keyPath
     * @param {IDBIndexParameters | undefined} [options]
     */
    createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters | undefined): ReadWriteIndex;
    /**
     * @param {string} name
     */
    deleteIndex(name: string): void;
}
export const readonly: (target: IDBObjectStore) => ReadOnlyStore;
export const readwrite: (target: IDBObjectStore) => ReadWriteStore;
export const versionchange: (target: IDBObjectStore) => UpgradableStore;
declare namespace _default {
    export { readonly };
    export { readwrite };
    export { versionchange };
}
export default _default;
import { DBRequest } from './req.js';
import type { OpenCursorOptions } from '#types';
import { ReadOnlyIndex } from './idx.js';
import { ReadWriteCursor } from './cursor.js';
import { ReadWriteIndex } from './idx.js';
//# sourceMappingURL=store.d.ts.map