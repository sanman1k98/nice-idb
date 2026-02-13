import { Wrappable } from './wrap';

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
export class DBRequest extends Wrappable(IDBRequest) {
	/** @type {TResolved | TRejected | PromiseLike<TResolved | TRejected> | undefined} */ #result;
	/** @type {((value: R['result']) => TResolved | PromiseLike<TResolved>) | undefined | null} @readonly */ #onfulfilled;
	/** @type {((reason: any) => TRejected | PromiseLike<TRejected>) | undefined | null} @readonly */ #onrejected;

	get state() { return super.target.readyState; }

	/**
	 * Will be `true` when the underlying request is "pending".
	 */
	get pending() { return super.target.readyState === 'pending'; }

	/**
	 * Another way to resolve the `result` of the underlying request.
	 *
	 * @example
	 * const result = await niceRequest;
	 * const alsoResult = await niceRequest.result;
	 */
	get result() { return this.then(); }

	/**
	 * @param {R} request - the IDBRequest to wrap.
	 * @param {((value: R['result']) => TResolved | PromiseLike<TResolved>) | undefined | null} [onfulfilled] - Optionally transform the `result` that the request will resolve to.
	 * @param {((reason: any) => TRejected | PromiseLike<TRejected>) | undefined | null} [onrejected]
	 */
	constructor(request, onfulfilled, onrejected) {
		super(request);
		this.#onfulfilled = onfulfilled;
		this.#onrejected = onrejected;
	}

	/**
	 * @template [TResult1 = TResolved | TRejected]
	 * @template [TResult2 = never]
	 * @param {((value: TResolved | TRejected) => TResult1 | PromiseLike<TResult1>) | null | undefined} [onfulfilled]
	 * @param {((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined} [onrejected]
	 */
	then(onfulfilled, onrejected) {
		if (this.#result) {
			return Promise.resolve(this.#result)
				.then(onfulfilled, onrejected);
		}

		if (this.pending || super.target instanceof IDBOpenDBRequest) {
			this.#result = new Promise((resolve, reject) => {
				/** @type {EventListener} */
				const listener = (event) => {
					super.target.removeEventListener('success', listener);
					super.target.removeEventListener('error', listener);
					const { result, error } = super.target;
					return event.type === 'success' ? resolve(result) : reject(error);
				};
				const opts = { once: true };
				super.target.addEventListener('success', listener, opts);
				super.target.addEventListener('error', listener, opts);
			}).then(this.#onfulfilled, this.#onrejected);
		} else {
			this.#result = new Promise((resolve, reject) =>
				super.target.error
					? reject(super.target.error)
					: resolve(super.target.result),
			).then(this.#onfulfilled, this.#onrejected);
		}

		return Promise.resolve(this.#result)
			.then(onfulfilled, onrejected);
	}

	/**
	 * @template [TResult2 = never]
	 * @param {((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined} [onrejected]
	 */
	catch(onrejected) {
		return this.then(undefined, onrejected);
	}

	done() {
		return this.then(
			result => ({ result, error: null }),
			error => ({ result: null, error }),
		);
	}

	/**
	 * @template {R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap} M
	 * @template {keyof M} K
	 * @overload
	 * @param {K} type
	 * @param {M[K]} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {this}
	 */
	/**
	 * @overload
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {this}
	 */
	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 */
	on(type, listener, options) {
		super.target.addEventListener(type, listener, options);
		return this;
	}

	/**
	 * @template {R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap} M
	 * @template {keyof M} K
	 * @overload
	 * @param {K} type
	 * @param {M[K]} listener
	 * @param {boolean | EventListenerOptions} [options]
	 * @returns {this}
	 */
	/**
	 * @overload
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | EventListenerOptions} [options]
	 * @returns {this}
	 */
	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | EventListenerOptions} [options]
	 */
	off(type, listener, options) {
		super.target.removeEventListener(type, listener, options);
		return this;
	}

	/**
	 * @template {R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap} M
	 * @template {keyof M} K
	 * @overload
	 * @param {K} type
	 * @param {M[K]} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {this}
	 */
	/**
	 * @overload
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {this}
	 */
	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 */
	once(type, listener, options) {
		if (typeof options === 'boolean')
			options = { capture: true, once: true };
		else if (options && typeof options === 'object')
			Object.assign(options, { once: true });
		else if ((options ?? null) === null)
			options = { once: true };
		super.target.addEventListener(type, listener, options);
		return this;
	}

	/**
	 * @param {Event | string} event
	 * @param {EventInit} [init]
	 */
	emit(event, init) {
		if (event instanceof Event)
			return super.target.dispatchEvent(event);
		return super.target.dispatchEvent(new Event(event, init));
	}

	/**
	 * @template {R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap} M
	 * @template {keyof M} K
	 * @overload
	 * @param {K} type
	 * @param {M[K]} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {void}
	 */
	/**
	 * @overload
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {void}
	 */
	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {void}
	 */
	addEventListener(type, listener, options) {
		return super.target.addEventListener(type, listener, options);
	}

	/**
	 * @template {R extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap : IDBRequestEventMap} M
	 * @template {keyof M} K
	 * @overload
	 * @param {K} type
	 * @param {M[K]} listener
	 * @param {boolean | EventListenerOptions} [options]
	 * @returns {void}
	 */
	/**
	 * @overload
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | EventListenerOptions} [options]
	 * @returns {void}
	 */
	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | EventListenerOptions} [options]
	 * @returns {void}
	 */
	removeEventListener(type, listener, options) {
		return super.target.removeEventListener(type, listener, options);
	};

	/**
	 * @param {Event} event
	 */
	dispatchEvent(event) {
		return super.target.dispatchEvent(event);
	}

	/**
	 * Promisify an `IDBRequest` to await its result or reject if it errors.
	 * @template {IDBRequest} R
	 * @param {R} request
	 * @returns {DBRequest<R>} Wrapped request.
	 */
	static promisify(request) {
		return new this(request);
	}
}

export default DBRequest;
