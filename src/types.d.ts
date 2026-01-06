/**
 * Construct a type from `T` by picking the set of entries with values that are
 * assignable to `V`.
 */
type PickValues<T, V, K extends keyof T = keyof T> = {
	[P in K as T[P] extends V ? P : never]: T[P];
};

/**
 * Construct a type from `T` by picking the set of entries with values that are
 * **not** assignable to `V`. Opposite of {@link PickValues}.
 */
type OmitValues<T, V, K extends keyof T = keyof T> = {
	[P in K as T[P] extends V ? never : P]: T[P];
};

type PickMethods<T, K = keyof T> = PickValues<T, (this: T, ...args: any) => any, K>;

type PickInstanceFields<T, K = keyof OmitValues<T, (this: T, ...args: any) => any>, U = T[K]> = PickValues<T, U, K>;

type IDBObjectStoreProps = PickInstanceFields<IDBObjectStore>;
type IDBIndexProps = PickInstanceFields<IDBIndex>;

/**
 * An object that can make {@link IDBRequest} instances.
 */
type IDBRequestMaker = IDBRequest['source'];

/**
 * A method that makes an {@link IDBRequest}.
 */
type MakeIDBRequestMethod = (this: IDBRequestMaker, ...args: any) => IDBRequest;

type PromisifyIDBRequest<T extends IDBRequest> = Promise<T['result']>;

type PromisifyRequestMethods<
	T extends IDBRequestMaker,
	O = PickValues<T, MakeIDBRequestMethod>,
> = {
	[P in keyof O]: (...args: Parameters<O[P]>) => PromisifyIDBRequest<O[P]>;
};

export type Database = Pick<IDBDatabase, 'name' | 'version' | 'close' | 'addEventListener' | 'removeEventListener'>;

export type Transaction = Omit<IDBTransaction, 'db', 'objectStoreNames' | 'onerror' | 'oncomplete' | 'onabort' | 'objectStore' | 'dispatchEvent'>;

export type ObjectStore
	= & Omit<PromisifyRequestMethods<IDBObjectStore>, 'openCursor' | 'openKeyCursor'>
		& Omit<IDBObjectStoreProps, 'indexNames' | 'transaction'>;

export type Index
	= & Omit<PromisifyRequestMethods<IDBIndex>, 'openCursor' | 'openKeyCursor'>
		& Omit<IDBIndexProps, 'objectStore'>;
