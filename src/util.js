const logMethods = /** @type {const} */(['log', 'info', 'warn', 'debug', 'error']);

export const logger = new Proxy(console, {
	get(o, k) {
		const v = Reflect.get(o, k);
		if (logMethods.includes(/** @type {(typeof logMethods)[number]} */(k))) {
			return (/** @type {any} */ ...args) => {
				const [maybeMessage, ...rest] = args;
				if (typeof maybeMessage === 'string')
					return v(`[nice-idb] ${maybeMessage}`, ...rest);
				return v('[nice-idb]', ...args);
			};
		}
		return v;
	},
});

/**
 * Get a regular list of strings from a DOMStringList.
 * @param {DOMStringList} list - A DOMStringList instance.
 * @returns {readonly string[]} A regular list of strings.
 */
export function getStrings(list) {
	/** @type {string[]} */
	const strings = [];
	for (let i = 0; i < list.length; i++) {
		strings.push(/** @type {string} */(list.item(i)));
	}
	return strings;
}

/**
 * @typedef {object} NiceIDBErrorInfo
 * @property {Event} event - The event that caused the Promise to reject.
 * @property {IDBRequest | null} request - The IDBRequest object that fired an "error" event.
 * @property {DOMException | null} error - The "error" property from the IDBRequest or IDBTransaction.
 * @property {IDBTransaction | null} transaction - The IDBTransaction object that fired the "error".
 * @property {IDBRequest['source'] | null} source - The source of the request.
 */

/** @typedef {Error & { cause: NiceIDBErrorInfo }} NiceIDBError */

/**
 * Promisifies an IDBRequest that resolves to its result.
 * @template T - The result if the request succeeds.
 * @param {IDBRequest<T>} request - The request to create a Promise for.
 * @returns {Promise<T>} A Promise that resolves to the result of the request.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBRequest};
 */
export async function promisify(request) {
	return new Promise((resolve, reject) => {
		/** @satisfies {AddEventListenerOptions} */
		const opts = { once: true };
		/** @type {() => void} */
		let unlisten;

		const handleSuccess = () => {
			unlisten();
			resolve(request.result);
		};

		/** @type {EventListener} */
		const handleError = (event) => {
			unlisten();
			const { error, source, transaction } = request;
			/** @satisfies {NiceIDBErrorInfo} */
			const cause = { event, request, transaction, error, source };
			reject(new Error('IDBRequest failed', { cause }));
		};

		unlisten = () => {
			request.removeEventListener('success', handleSuccess);
			request.removeEventListener('error', handleError);
		};

		request.addEventListener('success', handleSuccess, opts);
		request.addEventListener('error', handleError, opts);
	});
}

/** @satisfies {(keyof NiceIDBErrorInfo)[]} */
const errorCauseKeys = /** @type {const} */(['event', 'request', 'error', 'transaction', 'source']);

/**
 * A type guard helper for parsing errors.
 * @param {unknown} error - The potential Error object to attempt to parse.
 * @returns {error is NiceIDBError} Returns true if error is a {@link NiceIDBError}.
 */
export function isNiceIDBError(error) {
	if (!Error.isError(error))
		return false;
	const { cause } = error;
	if (!cause || typeof cause !== 'object')
		return false;
	for (const key in errorCauseKeys) {
		if (!(key in cause))
			return false;
	}
	return true;
}

/**
 * Get relevant information from an Error object thrown by this library.
 * @param {unknown} error - The potential Error object to attempt to parse.
 * @returns {NiceIDBErrorInfo | null} Returns true if error is a {@link NiceIDBError}.
 */
export function parseError(error) {
	if (isNiceIDBError(error))
		return error.cause;
	return null;
}

/**
 * Argument passed to {@link keyRange()} to create an {@link IDBKeyRange}.
 *
 * @typedef {object} KeyRangeOptions
 * @property {IDBValidKey} [only] - A value to pass to {@link IDBKeyRange.only}.
 * @property {IDBValidKey} [gte] - Closed lower bound.
 * @property {IDBValidKey} [lte] - Closed upper bound
 * @property {IDBValidKey} [gt] - Open lower bound.
 * @property {IDBValidKey} [lt] - Open upper bound.
 */

/**
 * Create an IDBKeyRange by specifying at least one of the following options:
 * `only`, `gt`, `gte`, `lt`, `lte`.
 *
 * @example
 *
 * ```ts
 * const keyRange = NiceIDB.keyRange({ gte: 'A', lte: 'F' });
 * ```
 *
 * @param {KeyRangeOptions} opts - Specify a single value or upper/lower bounds.
 * @returns {IDBKeyRange} An IDBKeyRange with the specified bounds.
 */
export function keyRange(opts) {
	if (!opts || typeof opts !== 'object')
		throw new TypeError('Invalid key range options');

	const keys = /** @type {(keyof KeyRangeOptions)[]} */(Object.keys(opts));
	if (keys.length === 0)
		throw new RangeError('No options specified');

	let only;
	let lower;
	let upper;
	let lowerOpen;
	let upperOpen;

	for (const k of keys) {
		switch (k) {
			case 'only':
				only = opts[k];
				break;
			case 'gte':
			case 'gt':
				if (lower !== undefined)
					throw new RangeError('Cannot specify both "lte" and "lt" options');
				lowerOpen = k === 'gt';
				lower = opts[k];
				break;
			case 'lte':
			case 'lt':
				if (upper !== undefined)
					throw new RangeError('Cannot specify both "gte" and "gt" options');
				upperOpen = k === 'lt';
				upper = opts[k];
				break;
			default:
				throw new RangeError('Unknown option key', { cause: { key: k } });
		}
	}

	if (open !== undefined) {
		if (lower !== undefined || upper !== undefined)
			throw new RangeError('Cannot use any other options with "only"');
		return IDBKeyRange.only(only);
	}

	if (lower !== undefined && upper === undefined)
		return IDBKeyRange.lowerBound(lower, lowerOpen);
	else if (upper !== undefined && lower === undefined)
		return IDBKeyRange.upperBound(upper, upperOpen);

	return IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen);
}

/**
 * @param {object} obj
 * @returns {obj is KeyRangeOptions} Type predicate.
 */
function maybeKeyRangeOptions(obj) {
	/** @satisfies {(keyof KeyRangeOptions)[]} */
	const optNames = /** @type {const} */(['only', 'gte', 'lte', 'gt', 'lt']);
	return optNames.some(opt => opt in obj);
}

/**
 * @typedef {object} CursorOptions
 * @property {KeyRangeOptions | IDBValidKey | IDBKeyRange | undefined} [query] - Range of records to query.
 * @property {'next' | 'prev' | undefined} [dir] - Direction to traverse.
 * @property {boolean | undefined} [uniq] - Set to true to skip duplicates.
 * @property {boolean | undefined} [cont] - Call `cursor.continue()` automatically.
 */

/**
 * Create an async iterable from the given source.
 * @template [const T = true]
 * @template {IDBCursor} [C = T extends true ? IDBCursorWithValue : IDBCursor];
 * @param {IDBObjectStore | IDBIndex} source - An object that can open an {@link IDBCursor}.
 * @param {CursorOptions | undefined} [opts] - Customize the cursor.
 * @param {T} [withValues] - Set to false to open an IDBCursor.
 * @returns {AsyncGenerator<C>} An object to be used in a `await for...of` loop.
 */
export async function* getAsyncIterableRecords(
	source,
	opts = { dir: 'next', uniq: false, cont: true },
	withValues,
) {
	const reqCursor = withValues === false
		? source.openKeyCursor.bind(source)
		: source.openCursor.bind(source);

	/** @type {IDBRequest<C | null>} */
	let req;

	if (arguments.length === 1) {
		req = /** @type {IDBRequest<C | null>} */(reqCursor());
	} else {
		let { dir } = opts;
		let query;

		if (opts.query !== undefined && typeof opts.query === 'object' && maybeKeyRangeOptions(opts.query))
			query = keyRange(opts.query);

		if (opts.uniq)
			dir += 'unique';

		req = /** @type {IDBRequest<C | null>} */(reqCursor(query, dir));
	}

	const generator = async function* () {
		let cursor = await promisify(req);
		while (cursor) {
			yield cursor;
			if (opts.cont)
				cursor.continue();
			cursor = await promisify(req);
		}
	};

	yield* generator();
}
