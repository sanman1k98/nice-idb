/**
 * Get a regular list of strings from a DOMStringList.
 * @param {DOMStringList} list - A DOMStringList instance.
 * @returns {readonly string[]} A regular list of strings.
 */
export function toStrings(list: DOMStringList): readonly string[];
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
export function keyRange(opts: KeyRangeOptions): IDBKeyRange;
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
export function cursorArgs(opts?: OpenCursorOptions): Parameters<IDBIndex["openCursor"]>;
/**
 * @typedef {OpenCursorOptions & { count?: number }} SourceGetAllOptions
 */
/**
 * Get arguments for `getAll()`, `getAllKeys()`, or `getAllRecords()` methods.
 * Specifying a direction is for these methods is in limited availability.
 * @param {SourceGetAllOptions} [opts] Options to customize the arguments.
 * @returns {Parameters<IDBIndex['getAll']>} Array of arguments.
 */
export function getAllArgs(opts?: SourceGetAllOptions): Parameters<IDBIndex["getAll"]>;
export type QueryOptions = {
    /**
     * - Range of records to query.
     */
    query?: IDBValidKey | IDBKeyRange | undefined | null;
    /**
     * - Direction to traverse.
     */
    dir?: "next" | "prev" | undefined;
    /**
     * - Set to true to skip duplicates.
     */
    uniq?: boolean | undefined;
};
export type OpenCursorOptions = QueryOptions & KeyRangeOptions;
export type SourceGetAllOptions = OpenCursorOptions & {
    count?: number;
};
/**
 * Argument passed to {@link keyRange ()} to create an {@link IDBKeyRange}.
 */
export type KeyRangeOptions = {
    /**
     * - A value to pass to {@link IDBKeyRange.only}.
     */
    only?: IDBValidKey;
    /**
     * - Closed lower bound.
     */
    gte?: IDBValidKey;
    /**
     * - Closed upper bound
     */
    lte?: IDBValidKey;
    /**
     * - Open lower bound.
     */
    gt?: IDBValidKey;
    /**
     * - Open upper bound.
     */
    lt?: IDBValidKey;
};
//# sourceMappingURL=util.d.ts.map