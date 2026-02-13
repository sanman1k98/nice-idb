declare const DBRequest_base: {
    new (): import("./types").WrapperClass<IDBRequest<any>>;
    new (target: IDBRequest<any>): import("./types").WrapperClass<IDBRequest<any>>;
    wrap(target: objectT): import("./types").WrapperClass<object>;
};
/**
 * A "thenable" wrapper for `IDBRequest` objects. Use await to get the
 * underlying request's `result` property.
 *
 * @example
 * const req = new DBRequest(someIDBRequest);
 * const result = await req;
 * console.assert(result === someIDBRequest.result);
 *
 * @example
 * // Transform the fulfillment value with a callback as a second constructor argument.
 * const req = new DBRequest(indexedDB.open('my-db'), (result) => {
 *   console.assert(result instanceof IDBDatabase);
 *   console.info(`Sucessfully opened database ${result.name}`);
 *   // Return a NiceIDBDatabase instance as the fulfillment value.
 *   return new NiceIDBDatabase(result);
 * });
 *
 * // Register some event listeners...
 * req
 *   .once('blocked', (event) => { ... })
 *   .once('error', (event) => { ... });
 *
 * // Await the request to get the transformed result.
 * const db = await req;
 * console.assert(!(db instanceof IDBDatabase));
 * console.assert(db instanceof NiceIDB);
 *
 * @example
 * // Attach some event listeners.
 * const req = new DBRequest(someIDBRequest).once('error', (event) => {
 *   event.preventDefault()
 * });
 * const result = await req;
 *
 * @template {IDBRequest} R
 * @template [TResolved = R['result']]
 * @template [TRejected = never]
 * @implements {PromiseLike<TResolved | TRejected>}
 */
export class DBRequest<R extends IDBRequest, TResolved = R["result"], TRejected = never> extends DBRequest_base implements PromiseLike<TResolved | TRejected> {
    /**
     * Promisify an `IDBRequest` to await its result or reject if it errors.
     * @template {IDBRequest} R
     * @param {R} request
     * @returns {DBRequest<R>} Wrapped request.
     */
    static promisify<R_1 extends IDBRequest>(request: R_1): DBRequest<R_1>;
    /**
     * @param {R} request - the IDBRequest to wrap.
     * @param {((value: R['result']) => TResolved | PromiseLike<TResolved>) | undefined | null} [onfulfilled] - Optionally transform the `result` that the request will resolve to.
     * @param {((reason: any) => TRejected | PromiseLike<TRejected>) | undefined | null} [onrejected]
     */
    constructor(request: R, onfulfilled?: ((value: R["result"]) => TResolved | PromiseLike<TResolved>) | undefined | null, onrejected?: ((reason: any) => TRejected | PromiseLike<TRejected>) | undefined | null);
    get state(): IDBRequestReadyState;
    /**
     * Will be `true` when the underlying request is "pending".
     */
    get pending(): boolean;
    /**
     * Another way to resolve the `result` of the underlying request.
     *
     * @example
     * const result = await niceRequest;
     * const alsoResult = await niceRequest.result;
     */
    get result(): Promise<TResolved | TRejected>;
    /**
     * @template [TResult1 = TResolved | TRejected]
     * @template [TResult2 = never]
     * @param {((value: TResolved | TRejected) => TResult1 | PromiseLike<TResult1>) | null | undefined} [onfulfilled]
     * @param {((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined} [onrejected]
     */
    then<TResult1 = TResolved | TRejected, TResult2 = never>(onfulfilled?: ((value: TResolved | TRejected) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2>;
    /**
     * @template [TResult2 = never]
     * @param {((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined} [onrejected]
     */
    catch<TResult2 = never>(onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResolved | TRejected | TResult2>;
    done(): Promise<{
        result: TResolved | TRejected;
        error: null;
    } | {
        result: null;
        error: any;
    }>;
    /**
     * @template {R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap} M
     * @template {keyof M} K
     * @overload
     * @param {K} type
     * @param {(this: R, ev: M[K]) => any} listener
     * @param {boolean | AddEventListenerOptions} [options]
     * @returns {this}
     */
    on<M extends R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap, K extends keyof M>(type: K, listener: (this: R, ev: M[K]) => any, options?: boolean | AddEventListenerOptions | undefined): this;
    /**
     * @overload
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | AddEventListenerOptions} [options]
     * @returns {this}
     */
    on(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): this;
    /**
     * @template {R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap} M
     * @template {keyof M} K
     * @overload
     * @param {K} type
     * @param {(this: R, ev: M[K]) => any} listener
     * @param {boolean | EventListenerOptions} [options]
     * @returns {this}
     */
    off<M extends R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap, K extends keyof M>(type: K, listener: (this: R, ev: M[K]) => any, options?: boolean | EventListenerOptions | undefined): this;
    /**
     * @overload
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | EventListenerOptions} [options]
     * @returns {this}
     */
    off(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): this;
    /**
     * @template {R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap} M
     * @template {keyof M} K
     * @overload
     * @param {K} type
     * @param {(this: R, ev: M[K]) => any} listener
     * @param {boolean | AddEventListenerOptions} [options]
     * @returns {this}
     */
    once<M extends R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap, K extends keyof M>(type: K, listener: (this: R, ev: M[K]) => any, options?: boolean | AddEventListenerOptions | undefined): this;
    /**
     * @overload
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | AddEventListenerOptions} [options]
     * @returns {this}
     */
    once(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): this;
    /**
     * @param {Event | string} event
     * @param {EventInit} [init]
     */
    emit(event: Event | string, init?: EventInit): boolean;
    /**
     * @template {R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap} M
     * @template {keyof M} K
     * @overload
     * @param {K} type
     * @param {(this: R, ev: M[K]) => any} listener
     * @param {boolean | AddEventListenerOptions} [options]
     * @returns {void}
     */
    addEventListener<M extends R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap, K extends keyof M>(type: K, listener: (this: R, ev: M[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
    /**
     * @overload
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | AddEventListenerOptions} [options]
     * @returns {void}
     */
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
    /**
     * @template {R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap} M
     * @template {keyof M} K
     * @overload
     * @param {K} type
     * @param {(this: R, ev: M[K]) => any} listener
     * @param {boolean | EventListenerOptions} [options]
     * @returns {void}
     */
    removeEventListener<M extends R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap, K extends keyof M>(type: K, listener: (this: R, ev: M[K]) => any, options?: boolean | EventListenerOptions | undefined): void;
    /**
     * @overload
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | EventListenerOptions} [options]
     * @returns {void}
     */
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
    /**
     * @param {Event} event
     */
    dispatchEvent(event: Event): boolean;
    #private;
}
export default DBRequest;
//# sourceMappingURL=req.d.ts.map