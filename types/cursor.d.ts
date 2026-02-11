/**
 * @template {IDBCursor} [C = IDBCursor]
 * @implements {AsyncIterableIterator<ReadOnlyKeyCursor<C>, null>}
 */
export class ReadOnlyKeyCursor<C extends IDBCursor = IDBCursor> implements AsyncIterableIterator<ReadOnlyKeyCursor<C>, null> {
    /**
     * @param {IDBRequest<C | null>} request
     */
    constructor(request: IDBRequest<C | null>);
    /** @type {C} */
    get target(): C;
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
     * @param {Event & { target: IDBRequest<C | null> }} event
     */
    handleEvent({ target }: Event & {
        target: IDBRequest<C | null>;
    }): void;
    /**
     * @internal
     * @type {Promise<C | null>}
     */
    get _iteration(): Promise<C | null>;
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
 * @extends {ReadOnlyKeyCursor<IDBCursorWithValue>}
 */
export class ReadOnlyCursor extends ReadOnlyKeyCursor<IDBCursorWithValue> {
    /**
     * @param {IDBRequest<C | null>} request
     */
    constructor(request: IDBRequest<IDBCursorWithValue | null>);
    get value(): any;
}
export class ReadWriteCursor extends ReadOnlyCursor {
    delete(): DBRequest<IDBRequest<undefined>, undefined, never>;
    /**
     * @param {any} value
     */
    update(value: any): DBRequest<IDBRequest<IDBValidKey>, IDBValidKey, never>;
}
declare const ReadOnlyIndexKeyCursor_base: {
    new (...args: any[]): {
        /**
         * Can only be called on a cursor coming from an index.
         * @param {IDBValidKey} key
         * @param {IDBValidKey} primaryKey
         * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
         */
        continuePrimaryKey(key: IDBValidKey, primaryKey: IDBValidKey): Promise</*elided*/ any>;
        "__#private@#done": boolean;
        /** @type {PromiseWithResolvers<C | null> | undefined} */ "__#private@#pending": PromiseWithResolvers<any> | undefined;
        /** @type {IDBRequest<C | null>} @readonly */ readonly "__#private@#request": IDBRequest<any>;
        /** @type {IDBValidKey | undefined} */ "__#private@#prevIterKey": IDBValidKey | undefined;
        /** @type {C} */
        get target(): any;
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
        /** @type {{ resolve: (value: C | null) => void; reject: (reason: any) => void }} */
        get "__#private@#resolvers"(): {
            resolve: (value: any) => void;
            reject: (reason: any) => void;
        };
        "__#private@#cleanup"(): void;
        /**
         * @internal
         * @param {Event & { target: IDBRequest<C | null> }} event
         */
        handleEvent({ target }: Event & {
            target: IDBRequest<any>;
        }): void;
        /**
         * @internal
         * @type {Promise<C | null>}
         */
        get _iteration(): Promise<any>;
        /**
         * @param {number} count
         */
        advance(count: number): Promise</*elided*/ any>;
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
        continue(key?: IDBValidKey): Promise</*elided*/ any>;
        /**
         * Call and await before using in a while-loop.
         * @example
         * const cursor = await source.cursor().open()
         * while (cursor.done === false) {
         *   // Do stuff...
         *   await cursor.continue()
         * }
         */
        open(): Promise</*elided*/ any>;
        /**
         * @returns {Promise<IteratorResult<this, null>>} Next value.
         */
        next(): Promise<IteratorResult</*elided*/ any, null>>;
        /**
         * @returns {Promise<IteratorReturnResult<null>>} Done iteration.
         */
        return(value?: null): Promise<IteratorReturnResult<null>>;
        [Symbol.asyncIterator](): /*elided*/ any;
        [Symbol.asyncDispose](): void;
    };
} & typeof ReadOnlyKeyCursor;
export class ReadOnlyIndexKeyCursor extends ReadOnlyIndexKeyCursor_base {
    /**
     * @param {IDBRequest<C | null>} request
     */
    constructor(request: IDBRequest<IDBCursor | null>);
}
declare const ReadOnlyIndexCursor_base: {
    new (...args: any[]): {
        /**
         * Can only be called on a cursor coming from an index.
         * @param {IDBValidKey} key
         * @param {IDBValidKey} primaryKey
         * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
         */
        continuePrimaryKey(key: IDBValidKey, primaryKey: IDBValidKey): Promise</*elided*/ any>;
        "__#private@#done": boolean;
        /** @type {PromiseWithResolvers<C | null> | undefined} */ "__#private@#pending": PromiseWithResolvers<any> | undefined;
        /** @type {IDBRequest<C | null>} @readonly */ readonly "__#private@#request": IDBRequest<any>;
        /** @type {IDBValidKey | undefined} */ "__#private@#prevIterKey": IDBValidKey | undefined;
        /** @type {C} */
        get target(): any;
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
        /** @type {{ resolve: (value: C | null) => void; reject: (reason: any) => void }} */
        get "__#private@#resolvers"(): {
            resolve: (value: any) => void;
            reject: (reason: any) => void;
        };
        "__#private@#cleanup"(): void;
        /**
         * @internal
         * @param {Event & { target: IDBRequest<C | null> }} event
         */
        handleEvent({ target }: Event & {
            target: IDBRequest<any>;
        }): void;
        /**
         * @internal
         * @type {Promise<C | null>}
         */
        get _iteration(): Promise<any>;
        /**
         * @param {number} count
         */
        advance(count: number): Promise</*elided*/ any>;
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
        continue(key?: IDBValidKey): Promise</*elided*/ any>;
        /**
         * Call and await before using in a while-loop.
         * @example
         * const cursor = await source.cursor().open()
         * while (cursor.done === false) {
         *   // Do stuff...
         *   await cursor.continue()
         * }
         */
        open(): Promise</*elided*/ any>;
        /**
         * @returns {Promise<IteratorResult<this, null>>} Next value.
         */
        next(): Promise<IteratorResult</*elided*/ any, null>>;
        /**
         * @returns {Promise<IteratorReturnResult<null>>} Done iteration.
         */
        return(value?: null): Promise<IteratorReturnResult<null>>;
        [Symbol.asyncIterator](): /*elided*/ any;
        [Symbol.asyncDispose](): void;
    };
} & typeof ReadOnlyCursor;
export class ReadOnlyIndexCursor extends ReadOnlyIndexCursor_base {
}
declare const ReadWriteIndexCursor_base: {
    new (...args: any[]): {
        /**
         * Can only be called on a cursor coming from an index.
         * @param {IDBValidKey} key
         * @param {IDBValidKey} primaryKey
         * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
         */
        continuePrimaryKey(key: IDBValidKey, primaryKey: IDBValidKey): Promise</*elided*/ any>;
        "__#private@#done": boolean;
        /** @type {PromiseWithResolvers<C | null> | undefined} */ "__#private@#pending": PromiseWithResolvers<any> | undefined;
        /** @type {IDBRequest<C | null>} @readonly */ readonly "__#private@#request": IDBRequest<any>;
        /** @type {IDBValidKey | undefined} */ "__#private@#prevIterKey": IDBValidKey | undefined;
        /** @type {C} */
        get target(): any;
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
        /** @type {{ resolve: (value: C | null) => void; reject: (reason: any) => void }} */
        get "__#private@#resolvers"(): {
            resolve: (value: any) => void;
            reject: (reason: any) => void;
        };
        "__#private@#cleanup"(): void;
        /**
         * @internal
         * @param {Event & { target: IDBRequest<C | null> }} event
         */
        handleEvent({ target }: Event & {
            target: IDBRequest<any>;
        }): void;
        /**
         * @internal
         * @type {Promise<C | null>}
         */
        get _iteration(): Promise<any>;
        /**
         * @param {number} count
         */
        advance(count: number): Promise</*elided*/ any>;
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
        continue(key?: IDBValidKey): Promise</*elided*/ any>;
        /**
         * Call and await before using in a while-loop.
         * @example
         * const cursor = await source.cursor().open()
         * while (cursor.done === false) {
         *   // Do stuff...
         *   await cursor.continue()
         * }
         */
        open(): Promise</*elided*/ any>;
        /**
         * @returns {Promise<IteratorResult<this, null>>} Next value.
         */
        next(): Promise<IteratorResult</*elided*/ any, null>>;
        /**
         * @returns {Promise<IteratorReturnResult<null>>} Done iteration.
         */
        return(value?: null): Promise<IteratorReturnResult<null>>;
        [Symbol.asyncIterator](): /*elided*/ any;
        [Symbol.asyncDispose](): void;
    };
} & typeof ReadWriteCursor;
export class ReadWriteIndexCursor extends ReadWriteIndexCursor_base {
}
export namespace Cursor {
    function readonlyKey(request: IDBRequest<IDBCursor | null>): ReadOnlyKeyCursor<IDBCursor>;
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