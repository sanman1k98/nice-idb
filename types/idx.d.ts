/**
 * @extends {ReadOnlySource<IDBIndex>}
 */
export class ReadOnlyIndex extends ReadOnlySource<IDBIndex> {
    constructor(source: IDBIndex);
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
     * @param {OpenCursorOptions} [opts]
     */
    override cursor(opts?: OpenCursorOptions): import("./cursor.js").ReadWriteIndexCursor;
}
export function readonly(idx: IDBIndex): ReadOnlyIndex;
export function readwrite(idx: IDBIndex): ReadWriteIndex;
export { readwrite as versionchange };
declare namespace _default {
    export { readonly };
    export { readwrite };
    export { readwrite as versionchange };
}
export default _default;
import { ReadOnlySource } from './source.js';
import type { OpenCursorOptions } from './util.js';
//# sourceMappingURL=idx.d.ts.map