/**
 * @extends {ReadOnlySource<IDBIndex>}
 */
export class ReadOnlyIndex extends ReadOnlySource<IDBIndex> {
    /**
     * @override
     * @protected
     */
    protected static override Target: {
        new (): IDBIndex;
        prototype: IDBIndex;
    };
    /**
     * Wrap an existing IDBIndex instance.
     * @override
     */
    static override wrap: (index: IDBIndex) => ReadOnlyIndex;
    constructor(target?: IDBIndex | undefined);
    get multiEntry(): boolean;
    get unique(): boolean;
    /**
     * @override
     * @param {OpenCursorOptions} [opts]
     */
    override cursor(opts?: OpenCursorOptions): ReadOnlyIndexCursor;
    /**
     * @override
     * @param {OpenCursorOptions} [opts]
     */
    override keyCursor(opts?: OpenCursorOptions): ReadOnlyIndexKeyCursor;
}
export class ReadWriteIndex extends ReadOnlyIndex {
    /**
     * @override
     */
    static override wrap: (index: IDBIndex) => ReadWriteIndex;
    /**
     * @override
     * @param {OpenCursorOptions} [opts]
     */
    override cursor(opts?: OpenCursorOptions): ReadWriteIndexCursor;
}
export function readonly(index: IDBIndex): ReadOnlyIndex;
export function readwrite(index: IDBIndex): ReadWriteIndex;
export { readwrite as versionchange };
declare namespace _default {
    export { readonly };
    export { readwrite };
    export { readwrite as versionchange };
}
export default _default;
import { ReadOnlySource } from './source.js';
import type { OpenCursorOptions } from '#types';
import { ReadOnlyIndexCursor } from './cursor.js';
import { ReadOnlyIndexKeyCursor } from './cursor.js';
import { ReadWriteIndexCursor } from './cursor.js';
//# sourceMappingURL=idx.d.ts.map