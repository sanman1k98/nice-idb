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
 */
export class NiceIDBRequest {
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
					// if (event.type === 'success')
					// 	return resolve(this.#onfulfilled(result));
					// return resolve(this.#onrejected(error));
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
	 * @param {Parameters<R['addEventListener']>} args
	 * @returns {this} Use to chain other listeners or methods.
	 */
	on(...args) {
		// @ts-ignore
		this.#target.addEventListener(...args);
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
	 * @param {Parameters<R['addEventListener']>} args
	 * @returns {this} Use to chain other listeners or methods.
	 */
	once(...args) {
		let opts = args[2];
		if (typeof opts === 'boolean')
			opts = { capture: opts, once: true };
		else if (typeof opts === 'object')
			Object.assign(opts, { once: true });
		args[2] = opts;
		// @ts-ignore
		this.#target.addEventListener(...args);
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
	 * @param {Parameters<R['addEventListener']>} args
	 */
	addEventListener(...args) {
		// @ts-ignore
		return this.#target.addEventListener(...args);
	}

	/**
	 * @param {Parameters<R['removeEventListener']>} args
	 */
	removeEventListener(...args) {
		// @ts-ignore
		return this.#target.removeEventListener(...args);
	};

	/**
	 * @param {Event} event
	 */
	dispatchEvent(event) {
		return this.#target.dispatchEvent(event);
	}
}
