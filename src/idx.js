/** @import { Constructor, OpenCursorOptions } from '#types' */
import { ReadOnlyIndexCursor, ReadOnlyIndexKeyCursor, ReadWriteIndexCursor } from './cursor.js';
import { ReadOnlySource } from './source.js';
import { cursorArgs } from './util.js';

/**
 * @template {ReadOnlySource<IDBIndex>} C
 * @template {C extends ReadOnlySource<infer U> ? U : never} T
 * @param {Constructor<C> & Pick<typeof ReadOnlySource, 'mode' | 'assertWrappable'>} Class
 */
function bindStaticWrap(Class) {
	/** @param {T} index */
	return function (index) {
		Class.assertWrappable(index);
		const { mode } = index.objectStore.transaction;
		if (mode === 'readonly' && Class.mode !== mode)
			throw new Error('InvalidTargetMode');
		return new Class(index);
	};
}

/**
 * @extends {ReadOnlySource<IDBIndex>}
 */
export class ReadOnlyIndex extends ReadOnlySource {
	/**
	 * @override
	 * @protected
	 */
	static Target = IDBIndex;

	get multiEntry() { return super.target.multiEntry; }

	get unique() { return super.target.unique; }

	/**
	 * Wrap an existing IDBIndex instance.
	 * @override
	 */
	static wrap = bindStaticWrap(this);

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
	static wrap = bindStaticWrap(this);

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
