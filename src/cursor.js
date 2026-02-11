/** @import { Constructor } from '#types' */
import { DBRequest } from './req';

/**
 * @template {IDBCursor} [C = IDBCursor]
 * @implements {AsyncIterableIterator<ReadOnlyKeyCursor<C>, null>}
 */
export class ReadOnlyKeyCursor {
	#done = false;

	/** @type {PromiseWithResolvers<{ result: C | null, error: DOMException | null }> | undefined} */ #pending;
	/** @type {IDBRequest<C | null>} */ #request;
	/** @type {IDBValidKey | undefined} */ #prevIterKey;

	/** @type {C} */
	get target() {
		if (!this.#request.result)
			throw new TypeError('NullCursor');
		return this.#request.result;
	}

	get done() { return this.#done ||= !this.#request.result; }

	get dir() { return this.target.direction; }

	get key() { return this.target.key; }

	get primaryKey() { return this.target.primaryKey; }

	/**
	 * @param {IDBRequest<C | null>} request
	 */
	constructor(request) {
		request.addEventListener('success', this);
		request.addEventListener('error', this);
		this.#request = request;
	}

	/** @type {((value: { result: C | null, error: DOMException | null }) => void)} */
	get #resolve() {
		this.#pending ??= Promise.withResolvers();
		return this.#pending.resolve;
	}

	/** @type {Promise<{ result: C | null, error: DOMException | null }>} */
	get #iteration() {
		this.#pending ??= Promise.withResolvers();
		return this.#pending.promise.finally(
			() => this.#pending = undefined,
		);
	}

	#cleanup() {
		if (this.#done)
			return;
		this.#request.removeEventListener('success', this);
		this.#request.removeEventListener('error', this);
		this.#pending = undefined;
		this.#done = true;
	}

	/**
	 * @internal
	 * @param {Event & { target: IDBRequest }} event
	 */
	handleEvent(event) {
		const { result, error } = event.target;
		return this.#resolve({ result, error });
	}

	/**
	 * @protected
	 */
	async iterate() {
		if (this.#pending)
			throw new Error('PendingCursorIteration');
		return this.#iteration.then(({ result, error }) => {
			if (error)
				throw error;
			this.#prevIterKey = result?.key;
			return this;
		});
	}

	/**
	 * @param {number} count
	 */
	async advance(count) {
		if (this.#prevIterKey !== undefined)
			this.target.advance(count);
		return this.iterate();
	}

	/**
	 * @param {IDBValidKey} [key]
	 */
	async continue(key) {
		if (this.#prevIterKey !== undefined)
			this.target.continue(key);
		return this.iterate();
	}

	/**
	 * @returns {Promise<IteratorResult<this, null>>} Next value.
	 */
	async next() {
		if (this.#done)
			return { value: null, done: true };
		else if (this.#request.readyState === 'done')
			this.target.continue();

		return this.#iteration.then(({ result, error }) => {
			if (error)
				throw error;
			if (!result) {
				this.#cleanup();
				return { value: null, done: true };
			}
			this.#prevIterKey = result.key;
			return { value: this };
		});
	}

	/**
	 * @returns {Promise<IteratorReturnResult<null>>} Done iteration.
	 */
	async return(value = null) {
		this.#cleanup();
		return { value, done: true };
	}

	[Symbol.asyncIterator]() { return this; }

	[Symbol.asyncDispose]() { return this.#cleanup(); };
}

/**
 * @extends {ReadOnlyKeyCursor<IDBCursorWithValue>}
 */
export class ReadOnlyCursor extends ReadOnlyKeyCursor {
	get value() { return super.target.value; }
}

export class ReadWriteCursor extends ReadOnlyCursor {
	delete() {
		const req = super.target.delete();
		return DBRequest.promisify(req);
	}

	/**
	 * @param {any} value
	 */
	update(value) {
		const req = super.target.update(value);
		return DBRequest.promisify(req);
	}
}

/**
 * Methods that can only be called if the cursor is coming from an index.
 * @template {Constructor<ReadOnlyKeyCursor<any>>} T
 * @param {T} Base
 */
function IndexOnly(Base) {
	return class extends Base {
		/**
		 * @param {IDBValidKey} key
		 * @param {IDBValidKey} primaryKey
		 */
		continuePrimaryKey(key, primaryKey) {
			super.target.continuePrimaryKey(key, primaryKey);
			return super.iterate();
		}
	};
}

export class ReadOnlyIndexKeyCursor extends IndexOnly(ReadOnlyKeyCursor) { }

export class ReadOnlyIndexCursor extends IndexOnly(ReadOnlyCursor) { }

export class ReadWriteIndexCursor extends IndexOnly(ReadWriteCursor) { }

export const Cursor = {
	readonlyKey: (/** @type {IDBRequest<IDBCursor | null>} */ request) => new ReadOnlyKeyCursor(request),
	readonly: (/** @type {IDBRequest<IDBCursorWithValue | null>} */ request) => new ReadOnlyCursor(request),
	readwrite: (/** @type {IDBRequest<IDBCursorWithValue | null>} */ request) => new ReadWriteCursor(request),
};

export const IndexCursor = {
	readonlyKey: (/** @type {IDBRequest<IDBCursor | null>} */ request) => new ReadOnlyIndexKeyCursor(request),
	readonly: (/** @type {IDBRequest<IDBCursorWithValue | null>} */ request) => new ReadOnlyIndexCursor(request),
	readwrite: (/** @type {IDBRequest<IDBCursorWithValue | null>} */ request) => new ReadWriteIndexCursor(request),
};
