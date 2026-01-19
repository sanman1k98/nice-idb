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
 * @example
 * // Wrap some existing IDBRequest and await it to get its result.
 * const req = new NiceIDBRequest(someIDBRequest);
 * const result = await req;
 *
 * @example
 * // Attach some event listeners.
 * const req = new NiceIDBRequest(someIDBRequest);
 * req.on('error', (event) => event.preventDefault());
 * const result = await req;
 *
 * @template {IDBRequest} R
 * @template [TResolved = R['result']]
 * @implements {PromiseLike<TResolved>}
 * @extends {NiceIDBEventTarget<R, R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap>}
 */
export class NiceIDBRequest<R extends IDBRequest, TResolved = R["result"]> extends NiceIDBEventTarget<R, R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap, keyof (R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap) extends string ? string & keyof (R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap) : never> implements PromiseLike<TResolved> {
    /**
     * @param {R} request
     * @param {(value: R['result']) => TResolved | PromiseLike<TResolved>} [onfulfilled]
     */
    constructor(request: R, onfulfilled?: (value: R["result"]) => TResolved | PromiseLike<TResolved>);
    /**
     * Will be `true` when the underlying request is "pending".
     */
    get pending(): boolean;
    result(): Promise<TResolved>;
    /**
     * @template TResult1 = TResolved
     * @template TResult2 = never
     * @param {((value: TResolved) => TResult1 | PromiseLike<TResult1>) | null | undefined} [onfulfilled]
     * @param {((reason: any) => PromiseLike<TResult2>) | null | undefined} [onrejected]
     */
    then<TResult1, TResult2>(onfulfilled?: ((value: TResolved) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2>;
    /**
     * @template TResult = never
     * @param {((reason: any) => PromiseLike<TResult>) | null | undefined} [onrejected]
     */
    catch<TResult>(onrejected?: ((reason: any) => PromiseLike<TResult>) | null | undefined): Promise<TResolved | TResult>;
    #private;
}
//# sourceMappingURL=req.d.ts.map