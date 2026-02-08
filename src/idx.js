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

export class Index {
	static ReadOnly = ReadOnlyIndex;
	static ReadWrite = ReadWriteIndex;

	/** @param {IDBIndex} index */
	static readonly(index) { return new this.ReadOnly(index); }

	/** @param {IDBIndex} index */
	static readwrite(index) { return new this.ReadWrite(index); }

	static versionchange = this.readwrite;
}
