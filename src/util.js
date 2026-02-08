/**
 * Get a regular list of strings from a DOMStringList.
 * @param {DOMStringList} list - A DOMStringList instance.
 * @returns {readonly string[]} A regular list of strings.
 */
export function toStrings(list) {
	/** @type {string[]} */
	const strings = [];
	for (let i = 0; i < list.length; i++) {
		strings.push(/** @type {string} */(list.item(i)));
	}
	return strings;
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

const keyRangeOptNames = /** @type {const} */(['only', 'gte', 'lte', 'gt', 'lt']);

/**
 * @param {unknown} arg
 * @returns {obj is KeyRangeOptions} Type predicate.
 */
function isKeyRangeOptions(arg) {
	if (!arg || typeof arg !== 'object')
		return false;
	return keyRangeOptNames.some(opt => Object.hasOwn(arg, opt));
}

/**
 * Create an IDBKeyRange by specifying at least one of the following options:
 * `only`, `gt`, `gte`, `lt`, `lte`.
 *
 * @example
 * const range = keyRange({ gte: 'A', lte: 'F' });
 *
 * @param {KeyRangeOptions} opts - Specify a single value or upper/lower bounds.
 * @returns {IDBKeyRange} An IDBKeyRange with the specified bounds.
 */
export function keyRange(opts) {
	if (!isKeyRangeOptions(opts))
		throw new TypeError('InvalidKeyRangeOptions');

	let only;
	let lower;
	let upper;
	let lowerOpen;
	let upperOpen;

	for (const k of keyRangeOptNames) {
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
		}
	}

	if (only !== undefined) {
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
 * @typedef {object} QueryOptions
 * @property {IDBValidKey | IDBKeyRange | undefined | null} [query] - Range of records to query.
 * @property {'next' | 'prev' | undefined} [dir] - Direction to traverse.
 * @property {boolean | undefined} [uniq] - Set to true to skip duplicates.
 */

/**
 * @typedef {QueryOptions & KeyRangeOptions} OpenCursorOptions
 */

/**
 * Get arguments to open a cursor.
 * @param {OpenCursorOptions} [opts] Options to customize the request.
 * @returns {Parameters<IDBIndex['openCursor']>} Array of arguments.
 */
export function cursorArgs(opts = { }) {
	const { dir, uniq, query, ...keyRangeOpts } = opts;

	if (dir && dir !== 'next' && dir !== 'prev')
		throw new RangeError('Invalid dir value');

	/** @type {Parameters<IDBIndex['openCursor']>} */
	const args = [undefined, undefined];

	args[0] = query
		?? (Object.keys(keyRangeOpts).length
			? keyRange(keyRangeOpts)
			: query);

	if (uniq)
		args[1] = dir === 'prev' ? 'prevunique' : 'nextunique';
	else
		args[1] = dir;

	return args;
}

/**
 * @typedef {OpenCursorOptions & { count?: number }} SourceGetAllOptions
 */

/**
 * Get arguments for `getAll()`, `getAllKeys()`, or `getAllRecords()` methods.
 * Specifying a direction is for these methods is in limited availability.
 * @param {SourceGetAllOptions} [opts] Options to customize the arguments.
 * @returns {Parameters<IDBIndex['getAll']>} Array of arguments.
 */
export function getAllArgs(opts = { }) {
	const { count, dir, uniq, query, ...keyRangeOpts } = opts;

	if (dir && dir !== 'next' && dir !== 'prev')
		throw new RangeError('Invalid dir value');

	/** @type {IDBCursorDirection | undefined} */
	let direction;

	if (uniq)
		direction = dir === 'prev' ? 'prevunique' : 'nextunique';
	else
		direction = dir;

	const kr = query
		?? (Object.keys(keyRangeOpts).length
			? keyRange(keyRangeOpts)
			: query);

	if (direction)
		// @ts-expect-error Limited availability.
		return [{ count, direction, query: kr }];

	return [kr, count];
}
