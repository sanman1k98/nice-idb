/** @import { OpenCursorOptions } from '#types' */
import { IndexCursor } from './cursor.js';
import { createModeGuardedWrap, Readable } from './source.js';
import { cursorArgs } from './util.js';

export class ReadOnlyIndex extends Readable(IDBIndex) {
	get multiEntry() { return super.target.multiEntry; }

	get unique() { return super.target.unique; }

	/**
	 * Wrap an existing IDBIndex instance.
	 * @override
	 */
	static wrap = createModeGuardedWrap(this);

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
}

export class ReadWriteIndex extends ReadOnlyIndex {
	/**
	 * @override
	 * @type {IDBTransactionMode}
	 */
	static mode = 'readwrite';

	/**
	 * @override
	 */
	static wrap = createModeGuardedWrap(this);

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

export const readonly = ReadOnlyIndex.wrap;
export const readwrite = ReadWriteIndex.wrap;
export { readwrite as versionchange };

export default { readonly, readwrite, versionchange: readwrite };
