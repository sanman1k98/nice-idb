declare const ReadOnlyKeyCursor_base: {
    new (): import("./types").WrapperClass<IDBRequest<any>>;
    new (target: IDBRequest<any>): import("./types").WrapperClass<IDBRequest<any>>;
    wrap(target: objectT): import("./types").WrapperClass<object>;
};
/**
 * @implements {AsyncIterableIterator<ReadOnlyKeyCursor, null>}
 */
export class ReadOnlyKeyCursor extends ReadOnlyKeyCursor_base implements AsyncIterableIterator<ReadOnlyKeyCursor, null> {
    /**
     * @overload
     * @param {IDBRequest<IDBCursor | null>} request
     */
    constructor(request: IDBRequest<IDBCursor | null>);
    /**
     * @overload
     * @param {IDBRequest<IDBCursorWithValue | null>} request
     */
    constructor(request: IDBRequest<IDBCursorWithValue | null>);
    /** @type {IDBCursor} */
    get _cursor(): IDBCursor;
    /**
     * Will be true when the underlying request's state is "pending".
     * @type {boolean}
     */
    get pending(): boolean;
    /**
     * Can be used as the condition for a while-loop.
     */
    get done(): boolean;
    get dir(): IDBCursorDirection;
    get key(): IDBValidKey;
    get primaryKey(): IDBValidKey;
    /**
     * @internal
     * @param {Event & { target: IDBRequest<IDBCursor | null> }} event
     */
    handleEvent({ target }: Event & {
        target: IDBRequest<IDBCursor | null>;
    }): void;
    /**
     * @internal
     * @type {Promise<IDBCursor | null>}
     */
    get _iteration(): Promise<IDBCursor | null>;
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
     * @returns {Promise<IteratorReturnResult<null>>} Done iteration.
     */
    return(value?: null): Promise<IteratorReturnResult<null>>;
    [Symbol.asyncIterator](): this;
    [Symbol.asyncDispose](): void;
    #private;
}
/**
 * @implements {AsyncIterableIterator<ReadOnlyCursor, null>}
 */
export class ReadOnlyCursor extends ReadOnlyKeyCursor implements AsyncIterableIterator<ReadOnlyCursor, null> {
    get value(): any;
}
/**
 * @implements {AsyncIterableIterator<ReadWriteCursor, null>}
 */
export class ReadWriteCursor extends ReadOnlyCursor implements AsyncIterableIterator<ReadWriteCursor, null> {
    delete(): DBRequest<IDBRequest<undefined>, undefined, never>;
    /**
     * @param {any} value
     */
    update(value: any): DBRequest<IDBRequest<IDBValidKey>, IDBValidKey, never>;
}
/**
 * @implements {AsyncIterableIterator<ReadOnlyIndexKeyCursor, null>}
 */
export class ReadOnlyIndexKeyCursor extends ReadOnlyKeyCursor implements AsyncIterableIterator<ReadOnlyIndexKeyCursor, null> {
    /**
     * Can only be called on a cursor coming from an index.
     * @param {IDBValidKey} key
     * @param {IDBValidKey} primaryKey
     * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
     */
    continuePrimaryKey(key: IDBValidKey, primaryKey: IDBValidKey): Promise<this>;
}
/**
 * @implements {AsyncIterableIterator<ReadOnlyIndexCursor, null>}
 */
export class ReadOnlyIndexCursor extends ReadOnlyCursor implements AsyncIterableIterator<ReadOnlyIndexCursor, null> {
    /**
     * Can only be called on a cursor coming from an index.
     * @param {IDBValidKey} key
     * @param {IDBValidKey} primaryKey
     * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
     */
    continuePrimaryKey(key: IDBValidKey, primaryKey: IDBValidKey): Promise<this>;
}
/**
 * @implements {AsyncIterableIterator<ReadWriteIndexCursor, null>}
 */
export class ReadWriteIndexCursor extends ReadWriteCursor implements AsyncIterableIterator<ReadWriteIndexCursor, null> {
    /**
     * Can only be called on a cursor coming from an index.
     * @param {IDBValidKey} key
     * @param {IDBValidKey} primaryKey
     * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
     */
    continuePrimaryKey(key: IDBValidKey, primaryKey: IDBValidKey): Promise<this>;
}
export namespace Cursor {
    function readonlyKey(request: IDBRequest<IDBCursor | null>): ReadOnlyKeyCursor;
    function readonly(request: IDBRequest<IDBCursorWithValue | null>): ReadOnlyCursor;
    function readwrite(request: IDBRequest<IDBCursorWithValue | null>): ReadWriteCursor;
}
export namespace IndexCursor {
    export function readonlyKey_1(request: IDBRequest<IDBCursor | null>): ReadOnlyIndexKeyCursor;
    export { readonlyKey_1 as readonlyKey };
    export function readonly_1(request: IDBRequest<IDBCursorWithValue | null>): ReadOnlyIndexCursor;
    export { readonly_1 as readonly };
    export function readwrite_1(request: IDBRequest<IDBCursorWithValue | null>): ReadWriteIndexCursor;
    export { readwrite_1 as readwrite };
}
import { DBRequest } from './req';
export {};
//# sourceMappingURL=cursor.d.ts.map