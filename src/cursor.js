import { DBRequest } from './req';
import { Wrappable } from './wrap';

/**
 * @implements {AsyncIterableIterator<ReadOnlyKeyCursor, null>}
 */
export class ReadOnlyKeyCursor extends Wrappable(IDBRequest) {
	#done = false;

	/** @type {PromiseWithResolvers<IDBCursor | null> | undefined} */ #pending;
	/** @type {IDBValidKey | undefined} */ #prevIterKey;

	/** @type {IDBCursor} */
	get _cursor() {
		if (!super.target.result)
			throw new TypeError('NullCursor');
		return super.target.result;
	}

	/**
	 * Will be true when the underlying request's state is "pending".
	 * @type {boolean}
	 */
	get pending() { return super.target.readyState === 'pending'; }

	/**
	 * Can be used as the condition for a while-loop.
	 */
	get done() {
		return this.#done
			||= !this.pending && !super.target.result;
	}

	get dir() { return this._cursor.direction; }

	get key() { return this._cursor.key; }

	get primaryKey() { return this._cursor.primaryKey; }

	/**
	 * @overload
	 * @param {IDBRequest<IDBCursor | null>} request
	 */
	/**
	 * @overload
	 * @param {IDBRequest<IDBCursorWithValue | null>} request
	 */
	/**
	 * @param {IDBRequest<IDBCursor | null> | IDBRequest<IDBCursorWithValue | null>} request
	 */
	constructor(request) {
		super(request);
		request.addEventListener('success', this);
		request.addEventListener('error', this);
	}

	/** @type {{ resolve: (value: IDBCursor | null) => void; reject: (reason: any) => void }} */
	get #resolvers() {
		const { promise: _, ...resolvers }
			= this.#pending ??= Promise.withResolvers();
		return resolvers;
	}

	#cleanup() {
		if (this.#done)
			return;
		super.target.removeEventListener('success', this);
		super.target.removeEventListener('error', this);
		this.#pending = undefined;
		this.#done = true;
	}

	/**
	 * @internal
	 * @param {Event & { target: IDBRequest<IDBCursor | null> }} event
	 */
	handleEvent({ target }) {
		const { result, error } = target;
		const { resolve, reject } = this.#resolvers;
		!error ? resolve(result) : reject(error);
	}

	/**
	 * @internal
	 * @type {Promise<IDBCursor | null>}
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
		this._cursor.advance(count);
		return this._iteration.then(() => this);
	}

	/**
	 * @example
	 * for await (const c of source.cursor()) {
	 *   // Do stuff...
	 *   // ...
	 *   // Override the async iterator's implicit continue request and specify a key.
	 *   // The async iterator will await the pending request before the next iteration..
	 *   cursor.continue(someKey)
	 * }
	 * @example
	 * const cursor = await source.cursor().open()
	 * while (cursor.done === false) {
	 *   // Do stuff...
	 *   // ...
	 *   // Call with or without specifying a key.
	 *   // Await the returned promise to complete the request.
	 *   await cursor.continue()
	 * }
	 * @param {IDBValidKey} [key]
	 */
	continue(key) {
		this._cursor.continue(key);
		return this._iteration.then(() => this);
	}

	/**
	 * Call and await before using in a while-loop.
	 * @example
	 * const cursor = await source.cursor().open()
	 * while (cursor.done === false) {
	 *   // Do stuff...
	 *   await cursor.continue()
	 * }
	 */
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
			this._cursor.continue();

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
 * @implements {AsyncIterableIterator<ReadOnlyCursor, null>}
 */
export class ReadOnlyCursor extends ReadOnlyKeyCursor {
	get value() {
		const cursor = /** @type {IDBCursorWithValue} */ (super._cursor);
		return cursor.value;
	}
}

/**
 * @implements {AsyncIterableIterator<ReadWriteCursor, null>}
 */
export class ReadWriteCursor extends ReadOnlyCursor {
	delete() {
		const req = super._cursor.delete();
		return DBRequest.promisify(req);
	}

	/**
	 * @param {any} value
	 */
	update(value) {
		const req = super._cursor.update(value);
		return DBRequest.promisify(req);
	}
}

/**
 * @implements {AsyncIterableIterator<ReadOnlyIndexKeyCursor, null>}
 */
export class ReadOnlyIndexKeyCursor extends ReadOnlyKeyCursor {
	/**
	 * Can only be called on a cursor coming from an index.
	 * @param {IDBValidKey} key
	 * @param {IDBValidKey} primaryKey
	 * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
	 */
	continuePrimaryKey(key, primaryKey) {
		super._cursor.continuePrimaryKey(key, primaryKey);
		return super._iteration.then(() => this);
	}
}

/**
 * @implements {AsyncIterableIterator<ReadOnlyIndexCursor, null>}
 */
export class ReadOnlyIndexCursor extends ReadOnlyCursor {
	/**
	 * Can only be called on a cursor coming from an index.
	 * @param {IDBValidKey} key
	 * @param {IDBValidKey} primaryKey
	 * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
	 */
	continuePrimaryKey(key, primaryKey) {
		super._cursor.continuePrimaryKey(key, primaryKey);
		return super._iteration.then(() => this);
	}
}

/**
 * @implements {AsyncIterableIterator<ReadWriteIndexCursor, null>}
 */
export class ReadWriteIndexCursor extends ReadWriteCursor {
	/**
	 * Can only be called on a cursor coming from an index.
	 * @param {IDBValidKey} key
	 * @param {IDBValidKey} primaryKey
	 * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
	 */
	continuePrimaryKey(key, primaryKey) {
		super._cursor.continuePrimaryKey(key, primaryKey);
		return super._iteration.then(() => this);
	}
}

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
