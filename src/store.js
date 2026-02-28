/** @import { Constructor, OpenCursorOptions } from '#types' */
import { ReadWriteCursor } from './cursor.js';
import { ReadOnlyIndex, ReadWriteIndex } from './idx.js';
import { DBRequest } from './req.js';
import { ReadOnlySource } from './source.js';
import { cursorArgs, toStrings } from './util.js';

/**
 * @template {ReadOnlySource<IDBObjectStore>} C
 * @template {C extends ReadOnlySource<infer U> ? U : never} T
 * @param {Constructor<C> & Pick<typeof ReadOnlySource, 'mode' | 'assertWrappable'>} Class
 */
function bindStaticWrap(Class) {
	/** @param {T} store */
	return function (store) {
		Class.assertWrappable(store);
		const { mode } = store.transaction;
		if (Class.mode === 'readonly' || mode === 'versionchange' || Class.mode === mode)
			return new Class(store);
		throw new Error('InvalidTargetMode');
	};
}

/**
 * @extends {ReadOnlySource<IDBObjectStore>}
 */
export class ReadOnlyStore extends ReadOnlySource {
	/**
	 * @override
	 * @protected
	 */
	static Target = IDBObjectStore;

	get autoIncrement() { return super.target.autoIncrement; }

	get indexNames() { return toStrings(super.target.indexNames); }

	/**
	 * Wrap an exising IDBObjectStore instance.
	 * @override
	 */
	static wrap = bindStaticWrap(this);

	/**
	 * @param {string} name
	 */
	index(name) {
		const idx = super.target.index(name);
		return new ReadOnlyIndex(idx);
	}
}

export class ReadWriteStore extends ReadOnlyStore {
	/**
	 * @override
	 * @type {IDBTransactionMode}
	 */
	static mode = 'readwrite';

	/**
	 * @override
	 */
	static wrap = bindStaticWrap(this);

	/**
	 * @param {any} value
	 * @param {IDBValidKey | undefined} [key]
	 */
	add(value, key) {
		const req = super.target.add(value, key);
		return DBRequest.promisify(req);
	}

	clear() {
		const req = super.target.clear();
		return DBRequest.promisify(req);
	}

	/**
	 * @param {IDBValidKey | IDBKeyRange} key
	 */
	delete(key) {
		const req = super.target.delete(key);
		return DBRequest.promisify(req);
	}

	/**
	 * @param {any} value
	 * @param {IDBValidKey | undefined} [key]
	 */
	put(value, key) {
		const req = super.target.put(value, key);
		return DBRequest.promisify(req);
	}

	/**
	 * @param {OpenCursorOptions | undefined} [opts]
	 * @override
	 */
	cursor(opts) {
		const args = cursorArgs(opts);
		const req = super.target.openCursor(...args);
		return new ReadWriteCursor(req);
	}

	/**
	 * @param {string} name
	 * @override
	 */
	index(name) {
		const idx = super.target.index(name);
		return new ReadWriteIndex(idx);
	}
}

export class UpgradableStore extends ReadWriteStore {
	/**
	 * @override
	 * @type {IDBTransactionMode}
	 */
	static mode = 'versionchange';

	/**
	 * @override
	 */
	static wrap = bindStaticWrap(this);

	/**
	 * @param {string} name
	 * @param {string | string[]} keyPath
	 * @param {IDBIndexParameters | undefined} [options]
	 */
	createIndex(name, keyPath, options) {
		const idx = super.target.createIndex(name, keyPath, options);
		return new ReadWriteIndex(idx);
	}

	/**
	 * @param {string} name
	 */
	deleteIndex(name) {
		return super.target.deleteIndex(name);
	}
}

export const readonly = ReadOnlyStore.wrap;
export const readwrite = ReadWriteStore.wrap;
export const versionchange = UpgradableStore.wrap;

export default { readonly, readwrite, versionchange };
