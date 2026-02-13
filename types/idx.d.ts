declare const ReadOnlyIndex_base: {
    new (): {
        get name(): string;
        get keyPath(): string | string[] | null;
        count(key?: IDBValidKey | IDBKeyRange): import("./req.js").DBRequest<IDBRequest<number>, number, never>;
        get(query: IDBValidKey | IDBKeyRange): import("./req.js").DBRequest<IDBRequest<any>, any, never>;
        getAll(query?: IDBValidKey | IDBKeyRange | null | undefined, count?: number | undefined): import("./req.js").DBRequest<IDBRequest<any[]>, any[], never>;
        getAllKeys(query?: IDBValidKey | IDBKeyRange | null | undefined, count?: number | undefined): import("./req.js").DBRequest<IDBRequest<IDBValidKey[]>, IDBValidKey[], never>;
        getKey(key: IDBValidKey | IDBKeyRange): import("./req.js").DBRequest<IDBRequest<IDBValidKey | undefined>, IDBValidKey | undefined, never>;
        cursor(opts?: OpenCursorOptions | undefined): import("./cursor.js").ReadOnlyCursor;
        keyCursor(opts?: OpenCursorOptions | undefined): import("./cursor.js").ReadOnlyKeyCursor<IDBCursor>;
        [Symbol.asyncIterator](): import("./cursor.js").ReadOnlyCursor;
        get target(): IDBIndex;
        wrap(target: IDBIndex): /*elided*/ any;
    };
    new (target: IDBIndex): {
        get name(): string;
        get keyPath(): string | string[] | null;
        count(key?: IDBValidKey | IDBKeyRange): import("./req.js").DBRequest<IDBRequest<number>, number, never>;
        get(query: IDBValidKey | IDBKeyRange): import("./req.js").DBRequest<IDBRequest<any>, any, never>;
        getAll(query?: IDBValidKey | IDBKeyRange | null | undefined, count?: number | undefined): import("./req.js").DBRequest<IDBRequest<any[]>, any[], never>;
        getAllKeys(query?: IDBValidKey | IDBKeyRange | null | undefined, count?: number | undefined): import("./req.js").DBRequest<IDBRequest<IDBValidKey[]>, IDBValidKey[], never>;
        getKey(key: IDBValidKey | IDBKeyRange): import("./req.js").DBRequest<IDBRequest<IDBValidKey | undefined>, IDBValidKey | undefined, never>;
        cursor(opts?: OpenCursorOptions | undefined): import("./cursor.js").ReadOnlyCursor;
        keyCursor(opts?: OpenCursorOptions | undefined): import("./cursor.js").ReadOnlyKeyCursor<IDBCursor>;
        [Symbol.asyncIterator](): import("./cursor.js").ReadOnlyCursor;
        get target(): IDBIndex;
        wrap(target: IDBIndex): /*elided*/ any;
    };
    mode: IDBTransactionMode;
    wrap(target: objectT): import("#types").WrapperClass<object>;
};
export class ReadOnlyIndex extends ReadOnlyIndex_base {
    /**
     * Wrap an existing IDBIndex instance.
     * @override
     */
    static override wrap: (target: IDBIndex) => ReadOnlyIndex;
    get multiEntry(): boolean;
    get unique(): boolean;
    /**
     * @override
     * @param {OpenCursorOptions} [opts]
     */
    override cursor(opts?: OpenCursorOptions): import("./cursor.js").ReadOnlyIndexCursor;
    /**
     * @override
     * @param {OpenCursorOptions} [opts]
     */
    override keyCursor(opts?: OpenCursorOptions): import("./cursor.js").ReadOnlyIndexKeyCursor;
}
export class ReadWriteIndex extends ReadOnlyIndex {
    /**
     * @override
     */
    static override wrap: (target: IDBIndex) => ReadWriteIndex;
    /**
     * @override
     * @param {OpenCursorOptions} [opts]
     */
    override cursor(opts?: OpenCursorOptions): import("./cursor.js").ReadWriteIndexCursor;
}
export const readonly: (target: IDBIndex) => ReadOnlyIndex;
export const readwrite: (target: IDBIndex) => ReadWriteIndex;
export { readwrite as versionchange };
declare namespace _default {
    export { readonly };
    export { readwrite };
    export { readwrite as versionchange };
}
export default _default;
import type { OpenCursorOptions } from '#types';
//# sourceMappingURL=idx.d.ts.map