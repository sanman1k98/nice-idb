/** @import { OpenCursorOptions } from './util.js' */
import { IndexCursor } from './cursor.js';
import { ReadOnlySource } from './source.js';
import { cursorArgs } from './util.js';

/**
 * @extends {ReadOnlySource<IDBIndex>}
 */
export class ReadOnlyIndex extends ReadOnlySource {
	get multiEntry() { return super.target.multiEntry; }

	get unique() { return super.target.unique; }

	/**
	 * @override
	 * @param {OpenCursorOptions} [opts]
	 */
	cursor(opts) {
		const args = cursorArgs(opts);
		const req = super.target.openCursor(...args);
		return IndexCursor.readonly(req);
	}

	/**
	 * @override
	 * @param {OpenCursorOptions} [opts]
	 */
	keyCursor(opts) {
		const args = cursorArgs(opts);
		const req = super.target.openKeyCursor(...args);
		return IndexCursor.readonlyKey(req);
	}

	/**
	 * @param {IDBIndex} index
	 */
	static wrap(index) {
		return new this(index);
	}
}

export class ReadWriteIndex extends ReadOnlyIndex {
	/**
	 * @override
	 * @param {OpenCursorOptions} [opts]
	 */
	cursor(opts) {
		const args = cursorArgs(opts);
		const req = super.target.openCursor(...args);
		return IndexCursor.readwrite(req);
	}
}

export const readonly = (/** @type {IDBIndex} */ idx) => new ReadOnlyIndex(idx);
export const readwrite = (/** @type {IDBIndex} */ idx) => new ReadWriteIndex(idx);
export { readwrite as versionchange };

export default { readonly, readwrite, versionchange: readwrite };
