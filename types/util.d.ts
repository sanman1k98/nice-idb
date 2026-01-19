/**
 * Get a regular list of strings from a DOMStringList.
 * @param {DOMStringList} list - A DOMStringList instance.
 * @returns {readonly string[]} A regular list of strings.
 */
export function getStrings(list: DOMStringList): readonly string[];
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
export function promisify<T>(request: IDBRequest<T>): Promise<T>;
/**
 * A type guard helper for parsing errors.
 * @param {unknown} error - The potential Error object to attempt to parse.
 * @returns {error is NiceIDBError} Returns true if error is a {@link NiceIDBError}.
 */
export function isNiceIDBError(error: unknown): error is NiceIDBError;
/**
 * Get relevant information from an Error object thrown by this library.
 * @param {unknown} error - The potential Error object to attempt to parse.
 * @returns {NiceIDBErrorInfo | null} Returns true if error is a {@link NiceIDBError}.
 */
export function parseError(error: unknown): NiceIDBErrorInfo | null;
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
export function keyRange(opts: KeyRangeOptions): IDBKeyRange;
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
export function getAsyncIterableRecords<const T = true, C extends IDBCursor = T extends true ? IDBCursorWithValue : IDBCursor>(source: IDBObjectStore | IDBIndex, opts?: CursorOptions | undefined, withValues?: T, ...args: any[]): AsyncGenerator<C>;
/**
 * @template {EventTarget} T
 * @template {string} const E = Parameters<T['addEventListener']>[0]
 * @param {T} target
 * @param {{ types: E[], signal?: AbortSignal }} opts
 * @returns {AsyncIterableIterator<Event>} Events fired on the `target`.
 */
export function getAsyncIterableEvents<T extends EventTarget, const E extends string>(target: T, opts: {
    types: E[];
    signal?: AbortSignal;
}): AsyncIterableIterator<Event>;
export type NiceIDBErrorInfo = {
    /**
     * - The event that caused the Promise to reject.
     */
    event: Event;
    /**
     * - The IDBRequest object that fired an "error" event.
     */
    request: IDBRequest | null;
    /**
     * - The "error" property from the IDBRequest or IDBTransaction.
     */
    error: DOMException | null;
    /**
     * - The IDBTransaction object that fired the "error".
     */
    transaction: IDBTransaction | null;
    /**
     * - The source of the request.
     */
    source: IDBRequest["source"] | null;
};
export type NiceIDBError = Error & {
    cause: NiceIDBErrorInfo;
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
export type CursorOptions = {
    /**
     * - Range of records to query.
     */
    query?: KeyRangeOptions | IDBValidKey | IDBKeyRange | undefined;
    /**
     * - Direction to traverse.
     */
    dir?: "next" | "prev" | undefined;
    /**
     * - Set to true to skip duplicates.
     */
    uniq?: boolean | undefined;
    /**
     * - Call `cursor.continue()` automatically.
     */
    cont?: boolean | undefined;
};
//# sourceMappingURL=util.d.ts.map