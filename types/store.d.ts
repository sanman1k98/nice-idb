/**
 * @extends {ReadOnlySource<IDBObjectStore>}
 */
export class ReadOnlyStore extends ReadOnlySource<IDBObjectStore> {
    constructor(source: IDBObjectStore);
    get autoIncrement(): boolean;
    get indexNames(): readonly string[];
    /**
     * @param {string} name
     */
    index(name: string): ReadOnlyIndex;
}
export class ReadWriteStore extends ReadOnlyStore {
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
export function readonly(store: IDBObjectStore): ReadOnlyStore;
export function readwrite(store: IDBObjectStore): ReadWriteStore;
export function versionchange(store: IDBObjectStore): UpgradableStore;
declare namespace _default {
    export { readonly };
    export { readwrite };
    export { versionchange };
}
export default _default;
import { ReadOnlySource } from './source.js';
import { ReadOnlyIndex } from './idx.js';
import { DBRequest } from './req.js';
import type { OpenCursorOptions } from './util.js';
import { ReadWriteCursor } from './cursor.js';
import { ReadWriteIndex } from './idx.js';
//# sourceMappingURL=store.d.ts.map