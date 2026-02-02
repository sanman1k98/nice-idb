/**
 * @template {EventTarget} T
 * @template [M = Record<string, Event>]
 * @template {string} [E = keyof M extends string ? keyof M : never]
 */
export class NiceIDBEventTarget<T extends EventTarget, M = Record<string, Event>, E extends string = keyof M extends string ? keyof M : never> {
    /**
     * @param {T} target
     */
    constructor(target: T);
    /**
     * @param {E} event
     * @param {(event: M[keyof M]) => void} handler
     * @param {AddEventListenerOptions | boolean} [opts]
     */
    on(event: E, handler: (event: M[keyof M]) => void, opts?: AddEventListenerOptions | boolean): this;
    /**
     * @param {E} event
     * @param {(event: M[keyof M]) => void} handler
     * @param {AddEventListenerOptions | boolean} [opts]
     */
    off(event: E, handler: (event: M[keyof M]) => void, opts?: AddEventListenerOptions | boolean): this;
    /**
     * @param {E} event
     * @param {(event: M[keyof M]) => void} handler
     * @param {AddEventListenerOptions | boolean} [opts]
     */
    once(event: E, handler: (event: M[keyof M]) => void, opts?: AddEventListenerOptions | boolean): this;
    /**
     * @param {string | Event} event
     * @param {EventInit} [init]
     */
    emit(event: string | Event, init?: EventInit): boolean;
    #private;
}
/**
 * A "thenable" wrapper for `IDBRequest` objects. Use await to get the
 * underlying request's `result` property.
 *
 * @example
 * const req = new NiceIDBRequest(someIDBRequest);
 * const result = await req;
 * console.assert(result === someIDBRequest.result);
 *
 * @example
 * // Transform the fulfillment value with a callback as a second constructor argument.
 * const req = new NiceIDBRequest(indexedDB.open('my-db'), (result) => {
 *   console.assert(result instanceof IDBDatabase);
 *   console.info(`Sucessfully opened database ${result.name}`);
 *   // Return a NiceIDB instance as the fulfillment value.
 *   return new NiceIDB(result);
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
 * const req = new NiceIDBRequest(someIDBRequest).once('error', (event) => {
 *   event.preventDefault()
 * });
 * const result = await req;
 *
 * @template {IDBRequest} R
 * @template [TResolved = R['result']]
 * @template [TRejected = never]
 * @implements {PromiseLike<TResolved | TRejected>}
 * @extends {NiceIDBEventTarget<R, R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap>}
 */
export class NiceIDBRequest<R extends IDBRequest, TResolved = R["result"], TRejected = never> extends NiceIDBEventTarget<R, R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap, keyof (R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap) extends string ? string & keyof (R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap) : never> implements PromiseLike<TResolved | TRejected> {
    /**
     * @param {R} request - the IDBRequest to wrap.
     * @param {(value: R['result']) => TResolved | PromiseLike<TResolved>} [onfulfilled] - Optionally transform the `result` that the request will resolve to.
     * @param {(reason: any) => TRejected | PromiseLike<TRejected>} [onrejected]
     */
    constructor(request: R, onfulfilled?: (value: R["result"]) => TResolved | PromiseLike<TResolved>, onrejected?: (reason: any) => TRejected | PromiseLike<TRejected>);
    get state(): IDBRequestReadyState;
    get tx(): NiceIDBTransaction | null;
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
    #private;
}
import { NiceIDBTransaction } from './tx';
//# sourceMappingURL=req.d.ts.map