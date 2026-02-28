/**
 * @implements {AsyncIterableIterator<ReadOnlyKeyCursor>}
 * @extends {CursorWrapper<IDBCursor>}
 */
export class ReadOnlyKeyCursor extends CursorWrapper<IDBCursor> implements AsyncIterableIterator<ReadOnlyKeyCursor> {
    /**
     * Wrap an existing request for a cursor.
     * @override
     */
    static override wrap: (req: IDBRequest<IDBCursor | null>) => ReadOnlyKeyCursor;
    /**
     * @param {IDBRequest<C | null>} request
     */
    constructor(request: IDBRequest<IDBCursor | null>);
}
/**
 * @implements {AsyncIterableIterator<ReadOnlyCursor>}
 * @extends {CursorWrapper<IDBCursorWithValue>}
 */
export class ReadOnlyCursor extends CursorWrapper<IDBCursorWithValue> implements AsyncIterableIterator<ReadOnlyCursor> {
    /**
     * @override
     * @protected
     */
    protected static override Cursor: {
        new (): IDBCursorWithValue;
        prototype: IDBCursorWithValue;
    };
    /**
     * Wrap an existing request for a cursor.
     * @override
     */
    static override wrap: (req: IDBRequest<IDBCursorWithValue | null>) => ReadOnlyCursor;
    /**
     * @param {IDBRequest<C | null>} request
     */
    constructor(request: IDBRequest<IDBCursorWithValue | null>);
    /**
     * The value of record at the cursor's position.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBCursorWithValue/value}
     */
    get value(): any;
}
/**
 * @implements {AsyncIterableIterator<ReadWriteCursor>}
 */
export class ReadWriteCursor extends ReadOnlyCursor implements AsyncIterableIterator<ReadWriteCursor> {
    /**
     * Wrap an existing request for a cursor.
     * @override
     */
    static override wrap: (req: IDBRequest<IDBCursorWithValue | null>) => ReadWriteCursor;
    delete(): DBRequest<IDBRequest<undefined>, undefined, never>;
    /**
     * @param {any} value
     */
    update(value: any): DBRequest<IDBRequest<IDBValidKey>, IDBValidKey, never>;
}
/**
 * @implements {AsyncIterableIterator<ReadOnlyIndexKeyCursor>}
 */
export class ReadOnlyIndexKeyCursor extends ReadOnlyKeyCursor implements AsyncIterableIterator<ReadOnlyIndexKeyCursor> {
    /**
     * @override
     * @protected
     */
    protected static override Source: {
        new (): IDBIndex;
        prototype: IDBIndex;
    };
    /**
     * Wrap an existing request for a cursor.
     * @override
     */
    static override wrap: (req: IDBRequest<IDBCursor | null>) => ReadOnlyIndexKeyCursor;
    /**
     * Can only be called on a cursor coming from an index.
     * @param {IDBValidKey} key
     * @param {IDBValidKey} primaryKey
     * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
     */
    continuePrimaryKey(key: IDBValidKey, primaryKey: IDBValidKey): Promise<this>;
}
/**
 * @implements {AsyncIterableIterator<ReadOnlyIndexCursor>}
 */
export class ReadOnlyIndexCursor extends ReadOnlyCursor implements AsyncIterableIterator<ReadOnlyIndexCursor> {
    /**
     * @override
     * @protected
     */
    protected static override Source: {
        new (): IDBIndex;
        prototype: IDBIndex;
    };
    /**
     * Wrap an existing request for a cursor.
     * @override
     */
    static override wrap: (req: IDBRequest<IDBCursorWithValue | null>) => ReadOnlyIndexCursor;
    /**
     * Can only be called on a cursor coming from an index.
     * @param {IDBValidKey} key
     * @param {IDBValidKey} primaryKey
     * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
     */
    continuePrimaryKey(key: IDBValidKey, primaryKey: IDBValidKey): Promise<this>;
}
/**
 * @implements {AsyncIterableIterator<ReadWriteIndexCursor>}
 */
export class ReadWriteIndexCursor extends ReadWriteCursor implements AsyncIterableIterator<ReadWriteIndexCursor> {
    /**
     * @override
     * @protected
     */
    protected static override Source: {
        new (): IDBIndex;
        prototype: IDBIndex;
    };
    /**
     * Wrap an existing request for a cursor.
     * @override
     */
    static override wrap: (req: IDBRequest<IDBCursorWithValue | null>) => ReadWriteIndexCursor;
    /**
     * Can only be called on a cursor coming from an index.
     * @param {IDBValidKey} key
     * @param {IDBValidKey} primaryKey
     * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
     */
    continuePrimaryKey(key: IDBValidKey, primaryKey: IDBValidKey): Promise<this>;
}
export namespace Cursor {
    import readonlyKey = ReadOnlyKeyCursor.wrap;
    export { readonlyKey };
    import readonly = ReadOnlyCursor.wrap;
    export { readonly };
    import readwrite = ReadWriteCursor.wrap;
    export { readwrite };
}
export namespace IndexCursor {
    import readonlyKey_1 = ReadOnlyIndexKeyCursor.wrap;
    export { readonlyKey_1 as readonlyKey };
    import readonly_1 = ReadOnlyIndexCursor.wrap;
    export { readonly_1 as readonly };
    import readwrite_1 = ReadWriteIndexCursor.wrap;
    export { readwrite_1 as readwrite };
}
/**
 *
 * @template {IDBCursor} C
 * @extends {Wrapper<IDBRequest<C | null>>}
 */
declare class CursorWrapper<C extends IDBCursor> extends Wrapper<IDBRequest<C | null>> {
    /**
     * @type {'readonly' | 'readwrite'}
     */
    static mode: "readonly" | "readwrite";
    /**
     * @override
     * @protected
     */
    protected static override Target: {
        new (): IDBRequest;
        prototype: IDBRequest;
    };
    /**
     * @protected
     * @type {Constructor<IDBObjectStore> | Constructor<IDBIndex>}
     */
    protected static Source: Constructor<IDBObjectStore> | Constructor<IDBIndex>;
    /**
     * @protected
     * @type {Constructor<IDBCursor>}
     */
    protected static Cursor: Constructor<IDBCursor>;
    /**
     * @param {unknown} result
     * @returns {arg is InstanceType<typeof this.Cursor>}
     */
    static "__#private@#isCursorable"(result: unknown): arg is InstanceType<typeof this.Cursor>;
    /**
     * @param {IDBRequest<C | null>} request
     */
    constructor(request: IDBRequest<C | null>);
    /**
     * @protected
     */
    protected get cursor(): C;
    /**
     * Will be true when the underlying request's state is "pending".
     * @type {boolean}
     */
    get pending(): boolean;
    /**
     * Can be used as the condition for a while-loop.
     */
    get done(): boolean;
    /**
     * The direction of traversal of the cursor.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBCursor/direction}
     */
    get dir(): IDBCursorDirection;
    /**
     * The key for the record at the cursor's position.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBCursor/key}
     */
    get key(): IDBValidKey;
    /**
     * The current effective key.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBCursor/primaryKey}
     */
    get primaryKey(): IDBValidKey;
    /**
     * @internal
     * @param {Event & { target: IDBRequest<C | null> }} event
     */
    handleEvent({ target }: Event & {
        target: IDBRequest<C | null>;
    }): void;
    /**
     * @protected
     * @type {Promise<IDBCursor | null>}
     */
    protected get iteration(): Promise<IDBCursor | null>;
    /**
     * @param {number} count
     */
    advance(count: number): Promise<this>;
    /**
     * @example
     * for await (const c of source.cursor()) {
     *   // Do stuff...
     *   // ...
     *   // Override the async iterator's implicit continue request and specify a key.
     *   // The async iterator will await the pending request before the next iteration..
     *   cursor.continue(someKey)
     * }
     * @example
     * const cursor = await source.cursor().open()
     * while (cursor.done === false) {
     *   // Do stuff...
     *   // ...
     *   // Call with or without specifying a key.
     *   // Await the returned promise to complete the request.
     *   await cursor.continue()
     * }
     * @param {IDBValidKey} [key]
     */
    continue(key?: IDBValidKey): Promise<this>;
    /**
     * Call and await before using in a while-loop.
     * @example
     * const cursor = await source.cursor().open()
     * while (cursor.done === false) {
     *   // Do stuff...
     *   await cursor.continue()
     * }
     */
    open(): Promise<this>;
    /**
     * @returns {Promise<IteratorResult<this, null>>} Next value.
     */
    next(): Promise<IteratorResult<this, null>>;
    /**
     * @template T
     * @param {T | null} value
     * @returns {Promise<IteratorReturnResult<T | null>>}
     */
    return<T>(value?: T | null): Promise<IteratorReturnResult<T | null>>;
    [Symbol.asyncIterator](): this;
    [Symbol.asyncDispose](): void;
    #private;
}
import { DBRequest } from './req';
import { Wrapper } from './wrap';
import type { Constructor } from '#types';
export {};
//# sourceMappingURL=cursor.d.ts.map