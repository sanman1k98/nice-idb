/** @import { Constructor, OpenCursorOptions, WrapperClass } from '#types' */
import { ReadOnlyCursor, ReadOnlyKeyCursor } from './cursor.js';
import { DBRequest } from './req.js';
import { cursorArgs } from './util.js';
import { Wrappable } from './wrap.js';

/**
 * @template {WrapperClass<IDBIndex | IDBObjectStore>} C
 * @template {C extends WrapperClass<infer U> ? U : never} T
 * @param {Constructor<C> & { mode: IDBTransactionMode }} Class
 */
export function createModeGuardedWrap(Class) {
	/** @param {T} target */
	return function (target) {
		const wrapped = new Class(target);
		const tx = target instanceof IDBIndex
			? target.objectStore.transaction
			: target.transaction;
		if (tx.mode !== Class.mode)
			throw new Error('TargetModeInvalid');
		return wrapped;
	};
}

/**
 * Read-only methods for object store and index sources.
 * @template {IDBIndex | IDBObjectStore} T
 * @param {Constructor<T>} Source
 */
export function Readable(Source) {
	return class ReadOnlySource extends Wrappable(Source) {
		/**
		 * @type {IDBTransactionMode}
		 */
		static mode = 'readonly';

		get name() { return super.target.name; }

		get keyPath() { return super.target.keyPath; }

		/**
		 * @param {IDBValidKey | IDBKeyRange} [key]
		 */
		count(key) {
			const req = super.target.count(key);
			return DBRequest.promisify(req);
		}

		/**
		 * @param {IDBValidKey | IDBKeyRange} query
		 */
		get(query) {
			const req = super.target.get(query);
			return DBRequest.promisify(req);
		}

		/**
		 * @param {IDBValidKey | IDBKeyRange | null | undefined} [query]
		 * @param {number | undefined} [count]
		 */
		getAll(query, count) {
			const req = super.target.getAll(query, count);
			return DBRequest.promisify(req);
		}

		/**
		 * @param {IDBValidKey | IDBKeyRange | null | undefined} [query]
		 * @param {number | undefined} [count]
		 */
		getAllKeys(query, count) {
			const req = super.target.getAllKeys(query, count);
			return DBRequest.promisify(req);
		}

		/**
		 * @param {IDBValidKey | IDBKeyRange} key
		 */
		getKey(key) {
			const req = super.target.getKey(key);
			return DBRequest.promisify(req);
		}

		/**
		 * @param {OpenCursorOptions | undefined} [opts]
		 */
		cursor(opts) {
			const args = cursorArgs(opts);
			const req = super.target.openCursor(...args);
			return new ReadOnlyCursor(req);
		}

		/**
		 * @param {OpenCursorOptions | undefined} [opts]
		 */
		keyCursor(opts) {
			const args = cursorArgs(opts);
			const req = super.target.openKeyCursor(...args);
			return new ReadOnlyKeyCursor(req);
		}

		[Symbol.asyncIterator]() { return this.cursor(); }
	};
}
