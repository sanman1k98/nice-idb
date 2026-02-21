/** @import { Constructor } from '#types'; */
import { DBRequest } from './req';
import { Wrapper } from './wrap';

/**
 * @template {CursorWrapper<any>} C
 * @template {C extends Wrapper<infer U> ? U : never} T
 * @param {Constructor<C> & Pick<typeof CursorWrapper, 'assertWrappable' | 'mode'>} Class
 */
function createWrap(Class) {
	/** @param {T} req */
	return function (req) {
		Class.assertWrappable(req);
		// @ts-expect-error
		const { mode } = req.transaction;
		if (mode === 'readonly' && Class.mode !== mode)
			throw new Error('InvalidMode');
		return new Class(req);
	};
}

/**
 *
 * @template {IDBCursor} C
 * @extends {Wrapper<IDBRequest<C | null>>}
 */
class CursorWrapper extends Wrapper {
	/**
	 * @type {'readonly' | 'readwrite'}
	 */
	static mode = 'readonly';

	/**
	 * @override
	 * @protected
	 */
	static Target = IDBRequest;

	/**
	 * @protected
	 * @type {Constructor<IDBObjectStore> | Constructor<IDBIndex>}
	 */
	static Source = IDBObjectStore;

	/**
	 * Used by `Wrapper.assertWrappable()`.
	 * @override
	 * @param {unknown} value
	 */
	static isWrappable(value) {
		return value instanceof IDBRequest
			&& value.source instanceof this.Source;
	}

	/**
	 * @protected
	 * @type {Constructor<IDBCursor>}
	 */
	static Cursor = IDBCursor;

	/**
	 * @param {unknown} result
	 * @returns {arg is InstanceType<typeof this.Cursor>}
	 */
	static #isCursorable(result) {
		return Object.getPrototypeOf(result) === this.Cursor.prototype;
	}

	/** @type {PromiseWithResolvers<C | null> | undefined} */ #pending;
	/** @type {IDBValidKey | undefined} */ #prevIterKey;
	/** @type {boolean | undefined} */ #isCursor;

	/** @type {boolean} */
	#done = false;

	/**
	 * @protected
	 */
	get cursor() {
		const { result } = super.target;
		if (!result)
			throw new TypeError('NullCursor');
		this.#isCursor ??= CursorWrapper.#isCursorable
			.call(this.constructor, result);
		if (!this.#isCursor)
			throw new TypeError('InvalidCursor');
		return result;
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
		if (!this.pending && !super.target.result)
			this.#cleanup();
		return this.#done;
	}

	/**
	 * The direction of traversal of the cursor.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBCursor/direction}
	 */
	get dir() { return this.cursor.direction; }

	/**
	 * The key for the record at the cursor's position.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBCursor/key}
	 */
	get key() { return this.cursor.key; }

	/**
	 * The current effective key.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBCursor/primaryKey}
	 */
	get primaryKey() { return this.cursor.primaryKey; }

	/**
	 * @param {IDBRequest<C | null>} request
	 */
	constructor(request) {
		super(request);
		request.addEventListener('success', this);
		request.addEventListener('error', this);
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
		super.target.removeEventListener('success', this);
		super.target.removeEventListener('error', this);
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
	 * @protected
	 * @type {Promise<IDBCursor | null>}
	 */
	get iteration() {
		this.#pending ??= Promise.withResolvers();
		return this.#pending.promise.then((cursor) => {
			return (this.#prevIterKey = cursor?.key, cursor);
		}).finally(() => this.#pending = undefined);
	}

	/**
	 * @param {number} count
	 */
	advance(count) {
		this.cursor.advance(count);
		return this.iteration.then(() => this);
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
		this.cursor.continue(key);
		return this.iteration.then(() => this);
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
			return this.iteration.then(() => this);
		throw new Error('CursorAlreadyOpened');
	}

	/**
	 * @returns {Promise<IteratorResult<this, null>>} Next value.
	 */
	async next() {
		if (this.#done)
			return { value: null, done: true };
		else if (!this.pending)
			this.cursor.continue();

		return this.iteration.then(async (cursor) => {
			/** @satisfies {IteratorResult<this>} */
			return cursor
				? { value: this }
				: this.return(null);
		});
	}

	/**
	 * @template T
	 * @param {T | null} value
	 * @returns {Promise<IteratorReturnResult<T | null>>}
	 */
	async return(value = null) {
		this.#cleanup();
		return { value, done: true };
	}

	[Symbol.asyncIterator]() { return this; }

	[Symbol.asyncDispose]() { return this.#cleanup(); };
}

/**
 * @implements {AsyncIterableIterator<ReadOnlyKeyCursor>}
 * @extends {CursorWrapper<IDBCursor>}
 */
export class ReadOnlyKeyCursor extends CursorWrapper {
	/**
	 * Wrap an existing request for a cursor.
	 * @override
	 */
	static wrap = createWrap(this);
}

/**
 * @implements {AsyncIterableIterator<ReadOnlyCursor>}
 * @extends {CursorWrapper<IDBCursorWithValue>}
 */
export class ReadOnlyCursor extends CursorWrapper {
	/**
	 * @override
	 * @protected
	 */
	static Cursor = IDBCursorWithValue;

	/**
	 * Wrap an existing request for a cursor.
	 * @override
	 */
	static wrap = createWrap(this);

	/**
	 * The value of record at the cursor's position.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBCursorWithValue/value}
	 */
	get value() { return super.cursor.value; }
}

/**
 * @implements {AsyncIterableIterator<ReadWriteCursor>}
 */
export class ReadWriteCursor extends ReadOnlyCursor {
	/**
	 * @override
	 * @type {'readonly' | 'readwrite'}
	 */
	static mode = 'readwrite';

	/**
	 * Wrap an existing request for a cursor.
	 * @override
	 */
	static wrap = createWrap(this);

	delete() {
		const req = super.cursor.delete();
		return DBRequest.promisify(req);
	}

	/**
	 * @param {any} value
	 */
	update(value) {
		const req = super.cursor.update(value);
		return DBRequest.promisify(req);
	}
}

/**
 * @implements {AsyncIterableIterator<ReadOnlyIndexKeyCursor>}
 */
export class ReadOnlyIndexKeyCursor extends ReadOnlyKeyCursor {
	/**
	 * @override
	 * @protected
	 */
	static Source = IDBIndex;

	/**
	 * Wrap an existing request for a cursor.
	 * @override
	 */
	static wrap = createWrap(this);

	/**
	 * Can only be called on a cursor coming from an index.
	 * @param {IDBValidKey} key
	 * @param {IDBValidKey} primaryKey
	 * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
	 */
	continuePrimaryKey(key, primaryKey) {
		super.cursor.continuePrimaryKey(key, primaryKey);
		return super.iteration.then(() => this);
	}
}

/**
 * @implements {AsyncIterableIterator<ReadOnlyIndexCursor>}
 */
export class ReadOnlyIndexCursor extends ReadOnlyCursor {
	/**
	 * @override
	 * @protected
	 */
	static Source = IDBIndex;

	/**
	 * Wrap an existing request for a cursor.
	 * @override
	 */
	static wrap = createWrap(this);

	/**
	 * Can only be called on a cursor coming from an index.
	 * @param {IDBValidKey} key
	 * @param {IDBValidKey} primaryKey
	 * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
	 */
	continuePrimaryKey(key, primaryKey) {
		super.cursor.continuePrimaryKey(key, primaryKey);
		return super.iteration.then(() => this);
	}
}

/**
 * @implements {AsyncIterableIterator<ReadWriteIndexCursor>}
 */
export class ReadWriteIndexCursor extends ReadWriteCursor {
	/**
	 * @override
	 * @protected
	 */
	static Source = IDBIndex;

	/**
	 * Wrap an existing request for a cursor.
	 * @override
	 */
	static wrap = createWrap(this);

	/**
	 * Can only be called on a cursor coming from an index.
	 * @param {IDBValidKey} key
	 * @param {IDBValidKey} primaryKey
	 * @see {@link https://w3c.github.io/IndexedDB/#dom-idbcursor-continueprimarykey}
	 */
	continuePrimaryKey(key, primaryKey) {
		super.cursor.continuePrimaryKey(key, primaryKey);
		return super.iteration.then(() => this);
	}
}

export const Cursor = {
	readonlyKey: ReadOnlyKeyCursor.wrap,
	readonly: ReadOnlyCursor.wrap,
	readwrite: ReadWriteCursor.wrap,
};

export const IndexCursor = {
	readonlyKey: ReadOnlyIndexKeyCursor.wrap,
	readonly: ReadOnlyIndexCursor.wrap,
	readwrite: ReadWriteIndexCursor.wrap,
};
