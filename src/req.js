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
export class DBRequest {
	/** @type {IDBRequest} */ #target;

	/** @type {TResolved | TRejected | PromiseLike<TResolved | TRejected> | undefined} */ #result;
	/** @type {((value: R['result']) => TResolved | PromiseLike<TResolved>) | undefined | null} */ #onfulfilled;
	/** @type {((reason: any) => TRejected | PromiseLike<TRejected>) | undefined | null} */ #onrejected;

	get state() { return this.#target.readyState; }

	/**
	 * Will be `true` when the underlying request is "pending".
	 */
	get pending() { return this.#target.readyState === 'pending'; }

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
		this.#target = request;
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

		if (this.pending || this.#target instanceof IDBOpenDBRequest) {
			this.#result = new Promise((resolve, reject) => {
				/** @type {EventListener} */
				const listener = (event) => {
					this.#target.removeEventListener('success', listener);
					this.#target.removeEventListener('error', listener);
					const { result, error } = this.#target;
					return event.type === 'success' ? resolve(result) : reject(error);
				};
				const opts = { once: true };
				this.#target.addEventListener('success', listener, opts);
				this.#target.addEventListener('error', listener, opts);
			}).then(this.#onfulfilled, this.#onrejected);
		} else {
			this.#result = new Promise((resolve, reject) =>
				this.#target.error
					? reject(this.#target.error)
					: resolve(this.#target.result),
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
		this.#target.addEventListener(type, listener, options);
		return this;
	}

	/**
	 * @param {Parameters<R['removeEventListener']>} args
	 * @returns {this} Use to chain other listeners or methods.
	 */
	off(...args) {
		// @ts-ignore
		this.#target.removeEventListener(...args);
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
		this.#target.addEventListener(type, listener, options);
		return this;
	}

	/**
	 * @param {Event | string} event
	 * @param {EventInit} [init]
	 */
	emit(event, init) {
		if (event instanceof Event)
			return this.#target.dispatchEvent(event);
		return this.#target.dispatchEvent(new Event(event, init));
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
		return this.#target.addEventListener(type, listener, options);
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
		return this.#target.removeEventListener(type, listener, options);
	};

	/**
	 * @param {Event} event
	 */
	dispatchEvent(event) {
		return this.#target.dispatchEvent(event);
	}

	/**
	 * @template {IDBRequest} R
	 * @template [TResolved = R['result']]
	 * @template [TRejected = never]
	 * @param {R} request
	 * @param {((value: R['result']) => TResolved | PromiseLike<TResolved>) | null | undefined} [onfulfilled]
	 * @param {((reason: any) => TRejected | PromiseLike<TRejected>) | null | undefined} [onrejected]
	 * @returns {DBRequest<R, TResolved, TRejected>} Wrapped request.
	 */
	static wrap(request, onfulfilled, onrejected) {
		return new this(request, onfulfilled, onrejected);
	}
}
