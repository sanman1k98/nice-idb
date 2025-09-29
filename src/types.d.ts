/**
 * Construct a type from `T` by picking the set of entries with values that are
 * assignable to `V`.
 */
export type PickValues<T, V, K extends keyof T = keyof T> = {
	[P in K as T[P] extends V ? P : never]: T[P];
};

/**
 * Construct a type from `T` by picking the set of entries with values that are
 * **not** assignable to `V`. Opposite of {@link PickValues}.
 */
export type OmitValues<T, V, K extends keyof T = keyof T> = {
	[P in K as T[P] extends V ? never : P]: T[P];
};

type RequestSource = IDBRequest['source'];

type RequestMethod = (this: RequestSource, ...args: any) => IDBRequest;

type PickRequestMethods<T extends RequestSource> = PickValues<T, RequestMethod>;

export type PromisifyRequestMethods<T extends RequestSource, TMethods = PickRequestMethods<T>> = {
	[P in keyof TMethods]: (...args: Parameters<TMethods[P]>) => Promise<ReturnType<TMethods[P]>['result']>;
};

export type PickMethods<T, K = keyof T> = PickValues<T, (this: T, ...args: any) => any, K>;

export type PickInstanceFields<T, K = keyof OmitValues<T, (this: T, ...args: any) => any>, U = T[K]> = PickValues<T, U, K>;
