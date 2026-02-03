import { NiceIDBTransaction } from './tx';

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
	/** @type {IDBRequest} */ #req;

	/** @type {TResolved | TRejected | PromiseLike<TResolved | TRejected> | undefined} */ #result;
	/** @type {(value: R['result']) => TResolved | PromiseLike<TResolved>} */ #onfulfilled;
	/** @type {(reason: any) => TRejected | PromiseLike<TRejected>} */ #onrejected;

	get state() { return this.#req.readyState; }

	/**
	 * Will be `true` when the underlying request is "pending".
	 */
	get pending() { return this.#req.readyState === 'pending'; }

	/**
	 * Another way to resolve the `result` of the underlying request.
	 *
	 * @example
	 * const result = await niceRequest;
	 * const alsoResult = await niceRequest.result;
	 */
	get result() { return this.then(); }

	get tx() {
		const tx = this.#req.transaction;
		if (!tx)
			return null;
		if (tx?.mode === 'versionchange')
			return new NiceIDBTransaction.Upgrade(tx);
		return new NiceIDBTransaction(tx);
	}

	/**
	 * @param {R} request - the IDBRequest to wrap.
	 * @param {(value: R['result']) => TResolved | PromiseLike<TResolved>} [onfulfilled] - Optionally transform the `result` that the request will resolve to.
	 * @param {(reason: any) => TRejected | PromiseLike<TRejected>} [onrejected]
	 */
	constructor(request, onfulfilled, onrejected) {
		this.#req = request;
		this.#onfulfilled = onfulfilled ?? Promise.resolve;
		this.#onrejected = onrejected ?? Promise.reject;
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

		if (this.pending || this.#req instanceof IDBOpenDBRequest) {
			this.#result = new Promise((resolve) => {
				/** @type {EventListener} */
				const listener = (event) => {
					this.#req.removeEventListener('success', listener);
					this.#req.removeEventListener('error', listener);
					const { result, error } = this.#req;
					if (event.type === 'success')
						return resolve(this.#onfulfilled(result));
					return resolve(this.#onrejected(error));
				};
				const opts = { once: true };
				this.#req.addEventListener('success', listener, opts);
				this.#req.addEventListener('error', listener, opts);
			});
		} else {
			this.#result = this.#req.error
				? this.#onrejected(this.#req.error)
				: this.#onfulfilled(this.#req.result);
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
		const fn = EventTarget.prototype.addEventListener;
		fn.apply(this.#req, args);
		return this;
	}

	/**
	 * @param {Parameters<R['removeEventListener']>} args
	 * @returns {this} Use to chain other listeners or methods.
	 */
	off(...args) {
		const fn = EventTarget.prototype.removeEventListener;
		fn.apply(this.#req, args);
		return this;
	}

	/**
	 * @param {Parameters<R['addEventListener']>} args
	 * @returns {this} Use to chain other listeners or methods.
	 */
	once(...args) {
		const fn = EventTarget.prototype.addEventListener;
		let opts = args[2];
		if (typeof opts === 'boolean')
			opts = { capture: opts, once: true };
		else if (typeof opts === 'object')
			Object.assign(opts, { once: true });
		args[2] = opts;
		fn.apply(this.#req, args);
		return this;
	}

	/**
	 * @param {Event | string} event
	 * @param {EventInit} [init]
	 */
	emit(event, init) {
		if (event instanceof Event)
			return this.#req.dispatchEvent(event);
		event = new Event(event, init);
		return this.#req.dispatchEvent(event);
	}
}
