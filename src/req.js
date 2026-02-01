import { NiceIDBTransaction } from './tx';

/**
 * @template {EventTarget} T
 * @template [M = Record<string, Event>]
 * @template {string} [E = keyof M extends string ? keyof M : never]
 */
export class NiceIDBEventTarget {
	/** @type {T} */ #target;

	/**
	 * @param {T} target
	 */
	constructor(target) {
		if (target instanceof EventTarget)
			this.#target = target;
		else
			throw new TypeError('Expected instance of EventTarget');
	}

	/**
	 * @param {E} event
	 * @param {(event: M[keyof M]) => void} handler
	 * @param {AddEventListenerOptions | boolean} [opts]
	 */
	on(event, handler, opts) {
		this.#target.addEventListener(event, /** @type {EventListener} */(handler), opts);
		return this;
	}

	/**
	 * @param {E} event
	 * @param {(event: M[keyof M]) => void} handler
	 * @param {AddEventListenerOptions | boolean} [opts]
	 */
	off(event, handler, opts) {
		this.#target.removeEventListener(event, /** @type {EventListener} */(handler), opts);
		return this;
	}

	/**
	 * @param {E} event
	 * @param {(event: M[keyof M]) => void} handler
	 * @param {AddEventListenerOptions | boolean} [opts]
	 */
	once(event, handler, opts) {
		if (typeof opts === 'boolean')
			opts = { capture: opts };
		this.#target.addEventListener(event, /** @type {EventListener} */(handler), { ...opts, once: true });
		return this;
	}

	/**
	 * @param {string | Event} event
	 * @param {EventInit} [init]
	 */
	emit(event, init) {
		if (event instanceof Event)
			return this.#target.dispatchEvent(event);
		const ev = new Event(event, init);
		return this.#target.dispatchEvent(ev);
	}
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
 * @implements {PromiseLike<TResolved>}
 * @extends {NiceIDBEventTarget<R, R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap>}
 */
export class NiceIDBRequest extends NiceIDBEventTarget {
	/** @type {IDBRequest} */ #req;
	/** @type {Promise<Event>} */ #event;
	/** @type {Promise<TResolved>} */ #promise;

	/**
	 * @param {R} request - the IDBRequest to wrap.
	 * @param {(value: R['result']) => TResolved | PromiseLike<TResolved>} [onfulfilled] - Optionally transform the `result` that the request will resolve to.
	 * @param {(reason: any) => PromiseLike<TRejected>} [onrejected]
	 */
	constructor(request, onfulfilled, onrejected) {
		super(request);
		this.#req = request;

		this.#event = new Promise((resolve) => {
			/** @satisfies {(this: IDBRequest, event: Event) => void} */
			const handleEvent = function (event) {
				request.removeEventListener('success', handleEvent);
				request.removeEventListener('error', handleEvent);
				resolve(event);
			};
			const opts = { once: true };
			request.addEventListener('success', handleEvent, opts);
			request.addEventListener('error', handleEvent, opts);
		});

		this.#promise = this.#event.then((event) => {
			const { result, error } = this.#req;
			if (event.type === 'success')
				return onfulfilled ? onfulfilled(result) : result;
			else if (onrejected)
				return onrejected(error);
			throw error;
		});
	}

	get state() { return this.#req.readyState; }

	get tx() {
		const tx = this.#req.transaction;
		if (!tx)
			return null;
		if (tx?.mode === 'versionchange')
			return new NiceIDBTransaction.Upgrade(tx);
		return new NiceIDBTransaction(tx);
	}

	/**
	 * Will be `true` when the underlying request is "pending".
	 */
	get pending() {
		return this.#req.readyState === 'pending';
	}

	/**
	 * Another way to resolve the `result` of the underlying request.
	 *
	 * @example
	 * const result = await niceRequest;
	 * const alsoResult = await niceRequest.result;
	 */
	get result() {
		return this.#promise;
	}

	/**
	 * @template TResult1 = TResolved
	 * @template TResult2 = never
	 * @param {((value: TResolved) => TResult1 | PromiseLike<TResult1>) | null | undefined} [onfulfilled]
	 * @param {((reason: any) => PromiseLike<TResult2>) | null | undefined} [onrejected]
	 */
	then(onfulfilled, onrejected) {
		return this.#promise.then(onfulfilled, onrejected);
	}

	/**
	 * @template TResult = never
	 * @param {((reason: any) => PromiseLike<TResult>) | null | undefined} [onrejected]
	 */
	catch(onrejected) {
		return this.#promise.catch(onrejected);
	}
}
