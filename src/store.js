/** @import { OpenCursorOptions } from './util.js' */
import { ReadWriteCursor } from './cursor.js';
import { Index } from './idx.js';
import { DBRequest } from './req.js';
import { ReadOnlySource } from './source.js';
import { cursorArgs, toStrings } from './util.js';

/**
 * @extends {ReadOnlySource<IDBObjectStore>}
 */
export class ReadOnlyStore extends ReadOnlySource {
	get autoIncrement() { return super.target.autoIncrement; }

	get indexNames() { return toStrings(super.target.indexNames); }

	/**
	 * @param {string} name
	 */
	index(name) {
		const idx = super.target.index(name);
		return Index.readonly(idx);
	}
}

export class ReadWriteStore extends ReadOnlyStore {
	/**
	 * @param {IDBObjectStore} store
	 */
	static wrap(store) {
		return new this(store);
	}

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
		return Index.readwrite(idx);
	}
}

export class UpgradableStore extends ReadWriteStore {
	/**
	 * @param {string} name
	 * @param {string | string[]} keyPath
	 * @param {IDBIndexParameters | undefined} [options]
	 */
	createIndex(name, keyPath, options) {
		const idx = super.target.createIndex(name, keyPath, options);
		return Index.readwrite(idx);
	}

	/**
	 * @param {string} name
	 */
	deleteIndex(name) {
		return super.target.deleteIndex(name);
	}
}

export class Store {
	static ReadOnly = ReadOnlyStore;
	static ReadWrite = ReadWriteStore;
	static Upgradable = UpgradableStore;

	/** @param {IDBObjectStore} store */
	static readonly(store) { return new this.ReadOnly(store); }

	/** @param {IDBObjectStore} store */
	static readwrite(store) { return new this.ReadWrite(store); }

	/** @param {IDBObjectStore} store */
	static versionchange(store) { return new this.Upgradable(store); }
}
