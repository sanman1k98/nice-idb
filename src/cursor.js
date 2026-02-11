/** @import { Constructor } from '#types' */
import { DBRequest } from './req';

/**
 * @template {IDBCursor} [C = IDBCursor]
 * @implements {AsyncIterableIterator<ReadOnlyKeyCursor<C>, null>}
 */
export class ReadOnlyKeyCursor {
	#done = false;

	/** @type {PromiseWithResolvers<C | null> | undefined} */ #pending;
	/** @type {IDBRequest<C | null>} @readonly */ #request;
	/** @type {IDBValidKey | undefined} */ #prevIterKey;

	/** @type {C} */
	get target() {
		if (!this.#request.result)
			throw new TypeError('NullCursor');
		return this.#request.result;
	}

	/**
	 * Will be true when the underlying request's state is "pending".
	 * @type {boolean}
	 */
	get pending() { return this.#request.readyState === 'pending'; }

	/**
	 * Can be used as the condition for a while-loop.
	 */
	get done() {
		return this.#done
			||= !this.pending && !this.#request.result;
	}

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

	/** @type {{ resolve: (value: C | null) => void; reject: (reason: any) => void }} */
	get #resolvers() {
		const { promise: _, ...resolvers }
			= this.#pending ??= Promise.withResolvers();
		return resolvers;
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
	 * @param {Event & { target: IDBRequest<C | null> }} event
	 */
	handleEvent({ target }) {
		const { result, error } = target;
		const { resolve, reject } = this.#resolvers;
		!error ? resolve(result) : reject(error);
	}

	/**
	 * @internal
	 * @type {Promise<C | null>}
	 */
	get _iteration() {
		this.#pending ??= Promise.withResolvers();
		return this.#pending.promise.then((cursor) => {
			return (this.#prevIterKey = cursor?.key, cursor);
		}).finally(() => this.#pending = undefined);
	}

	/**
	 * @param {number} count
	 */
	advance(count) {
		this.target.advance(count);
		return this._iteration.then(() => this);
	}

	/**
	 * @param {IDBValidKey} [key]
	 */
	continue(key) {
		this.target.continue(key);
		return this._iteration.then(() => this);
	}

	async open() {
		if (this.#prevIterKey === undefined)
			return this._iteration.then(() => this);
		throw new Error('CursorAlreadyOpened');
	}

	/**
	 * @returns {Promise<IteratorResult<this, null>>} Next value.
	 */
	async next() {
		if (this.#done)
			return { value: null, done: true };
		else if (!this.pending)
			this.target.continue();

		return this._iteration.then((cursor) => {
			return !cursor
				? (this.#cleanup(), { value: null, done: true })
				: { value: this };
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
 * @template {Constructor<ReadOnlyKeyCursor<any>>} T
 * @param {T} Base
 */
function IndexOnly(Base) {
	return class extends Base {
		/**
		 * Can only be called on a cursor coming from an index.
		 * @param {IDBValidKey} key
		 * @param {IDBValidKey} primaryKey
		 * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
		 */
		continuePrimaryKey(key, primaryKey) {
			super.target.continuePrimaryKey(key, primaryKey);
			return super._iteration.then(() => this);
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
