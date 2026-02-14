/** @import { OpenCursorOptions } from '#types' */
import { ReadOnlyIndexCursor, ReadOnlyIndexKeyCursor, ReadWriteIndexCursor } from './cursor.js';
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
		return new ReadOnlyIndexCursor(req);
	}

	/**
	 * @override
	 * @param {OpenCursorOptions} [opts]
	 */
	keyCursor(opts) {
		const args = cursorArgs(opts);
		const req = super.target.openKeyCursor(...args);
		return new ReadOnlyIndexKeyCursor(req);
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
		return new ReadWriteIndexCursor(req);
	}
}

export const readonly = ReadOnlyIndex.wrap;
export const readwrite = ReadWriteIndex.wrap;
export { readwrite as versionchange };

export default { readonly, readwrite, versionchange: readwrite };
