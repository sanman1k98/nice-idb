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
    get done(): boolean;
    get dir(): IDBCursorDirection;
    get key(): IDBValidKey;
    get primaryKey(): IDBValidKey;
    /**
     * @internal
     * @param {Event & { target: IDBRequest }} event
     */
    handleEvent(event: Event & {
        target: IDBRequest;
    }): void;
    /**
     * @internal
     */
    iterate(): Promise<this>;
    /**
     * @param {number} count
     */
    advance(count: number): Promise<this>;
    /**
     * @param {IDBValidKey} [key]
     */
    continue(key?: IDBValidKey): Promise<this>;
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
        /** @type {PromiseWithResolvers<{ result: C | null, error: DOMException | null }> | undefined} */ "__#private@#pending": PromiseWithResolvers<{
            result: any;
            error: DOMException | null;
        }> | undefined;
        /** @type {IDBRequest<C | null>} */ "__#private@#request": IDBRequest<any>;
        /** @type {IDBValidKey | undefined} */ "__#private@#prevIterKey": IDBValidKey | undefined;
        /** @type {C} */
        get target(): any;
        get done(): boolean;
        get dir(): IDBCursorDirection;
        get key(): IDBValidKey;
        get primaryKey(): IDBValidKey;
        /** @type {((value: { result: C | null, error: DOMException | null }) => void)} */
        get "__#private@#resolve"(): (value: {
            result: any;
            error: DOMException | null;
        }) => void;
        /** @type {Promise<{ result: C | null, error: DOMException | null }>} */
        get "__#private@#iteration"(): Promise<{
            result: any;
            error: DOMException | null;
        }>;
        "__#private@#cleanup"(): void;
        /**
         * @internal
         * @param {Event & { target: IDBRequest }} event
         */
        handleEvent(event: Event & {
            target: IDBRequest;
        }): void;
        /**
         * @internal
         */
        iterate(): Promise</*elided*/ any>;
        /**
         * @param {number} count
         */
        advance(count: number): Promise</*elided*/ any>;
        /**
         * @param {IDBValidKey} [key]
         */
        continue(key?: IDBValidKey): Promise</*elided*/ any>;
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
        /** @type {PromiseWithResolvers<{ result: C | null, error: DOMException | null }> | undefined} */ "__#private@#pending": PromiseWithResolvers<{
            result: any;
            error: DOMException | null;
        }> | undefined;
        /** @type {IDBRequest<C | null>} */ "__#private@#request": IDBRequest<any>;
        /** @type {IDBValidKey | undefined} */ "__#private@#prevIterKey": IDBValidKey | undefined;
        /** @type {C} */
        get target(): any;
        get done(): boolean;
        get dir(): IDBCursorDirection;
        get key(): IDBValidKey;
        get primaryKey(): IDBValidKey;
        /** @type {((value: { result: C | null, error: DOMException | null }) => void)} */
        get "__#private@#resolve"(): (value: {
            result: any;
            error: DOMException | null;
        }) => void;
        /** @type {Promise<{ result: C | null, error: DOMException | null }>} */
        get "__#private@#iteration"(): Promise<{
            result: any;
            error: DOMException | null;
        }>;
        "__#private@#cleanup"(): void;
        /**
         * @internal
         * @param {Event & { target: IDBRequest }} event
         */
        handleEvent(event: Event & {
            target: IDBRequest;
        }): void;
        /**
         * @internal
         */
        iterate(): Promise</*elided*/ any>;
        /**
         * @param {number} count
         */
        advance(count: number): Promise</*elided*/ any>;
        /**
         * @param {IDBValidKey} [key]
         */
        continue(key?: IDBValidKey): Promise</*elided*/ any>;
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
        /** @type {PromiseWithResolvers<{ result: C | null, error: DOMException | null }> | undefined} */ "__#private@#pending": PromiseWithResolvers<{
            result: any;
            error: DOMException | null;
        }> | undefined;
        /** @type {IDBRequest<C | null>} */ "__#private@#request": IDBRequest<any>;
        /** @type {IDBValidKey | undefined} */ "__#private@#prevIterKey": IDBValidKey | undefined;
        /** @type {C} */
        get target(): any;
        get done(): boolean;
        get dir(): IDBCursorDirection;
        get key(): IDBValidKey;
        get primaryKey(): IDBValidKey;
        /** @type {((value: { result: C | null, error: DOMException | null }) => void)} */
        get "__#private@#resolve"(): (value: {
            result: any;
            error: DOMException | null;
        }) => void;
        /** @type {Promise<{ result: C | null, error: DOMException | null }>} */
        get "__#private@#iteration"(): Promise<{
            result: any;
            error: DOMException | null;
        }>;
        "__#private@#cleanup"(): void;
        /**
         * @internal
         * @param {Event & { target: IDBRequest }} event
         */
        handleEvent(event: Event & {
            target: IDBRequest;
        }): void;
        /**
         * @internal
         */
        iterate(): Promise</*elided*/ any>;
        /**
         * @param {number} count
         */
        advance(count: number): Promise</*elided*/ any>;
        /**
         * @param {IDBValidKey} [key]
         */
        continue(key?: IDBValidKey): Promise</*elided*/ any>;
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