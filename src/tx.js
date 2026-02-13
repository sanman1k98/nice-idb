/** @import { Constructor, WrapperClass } from '#types' */
import { ReadOnlyStore, ReadWriteStore, UpgradableStore } from './store.js';
import { toStrings } from './util.js';
import { Wrappable } from './wrap.js';

/**
 * @template {WrapperClass<IDBTransaction>} C
 * @template {C extends WrapperClass<infer U> ? U : never} T
 * @param {Constructor<C> & { mode: IDBTransactionMode }} Class
 */
export function createModeGuardedWrap(Class) {
	return function (/** @type {T} */ target) {
		if (target.mode !== Class.mode)
			throw new Error('InvalidMode');
		return new Class(target);
	};
}

/**
 * @implements {Disposable}
 */
export class ReadOnlyTransaction extends Wrappable(IDBTransaction) {
	/**
	 * @type {IDBTransactionMode}
	 */
	static mode = 'readonly';

	/** @type {Promise<Event>} @readonly */ #finish;
	/** @type {Event | undefined} */ #event;

	get error() { return super.target.error; }
	get durability() { return super.target.durability; }
	get mode() { return super.target.mode; }

	/**
	 * @returns {boolean} Returns `true` when the transaction has either committed or aborted.
	 */
	get finished() { return !!this.#event; }
	get committed() { return this.#event?.type === 'complete'; }
	get aborted() { return this.#event?.type === 'abort'; }

	/**
	 * @returns {Promise<void>} A promise for when the transaction commits or aborts.
	 */
	get finish() { return this.#finish.then(() => {}); }

	/**
	 * List of stores in the scope of this transaction.
	 * @see {@link IDBTransaction.prototype.objectStoreNames}
	 */
	get storeNames() { return toStrings(super.target.objectStoreNames); }

	/**
	 * @param {IDBTransaction} tx - The transaction instance to wrap.
	 */
	constructor(tx) {
		super(tx);

		this.#finish = new Promise((resolve) => {
			/** @satisfies {EventListener} */
			const handleEvent = (event) => {
				tx.removeEventListener('complete', handleEvent);
				tx.removeEventListener('abort', handleEvent);
				resolve(this.#event = event);
			};
			const opts = { once: true, passive: true };
			tx.addEventListener('complete', handleEvent, opts);
			tx.addEventListener('abort', handleEvent, opts);
		});
	}

	/**
	 * Wrap an existing IDBTransaction instance.
	 * @override
	 */
	static wrap = createModeGuardedWrap(this);

	/**
	 * Get an object store within the transaction's scope.
	 * @param {string} name
	 */
	store(name) {
		const store = super.target.objectStore(name);
		return new ReadOnlyStore(store);
	}

	/**
	 * @template {keyof IDBTransactionEventMap} K
	 * @overload
	 * @param {K} type
	 * @param {(this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {void}
	 */
	/**
	 * @overload
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {void}
	 */
	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {void}
	 */
	addEventListener(type, listener, options) {
		return super.target.addEventListener(type, listener, options);
	}

	/**
	 * @template {keyof IDBTransactionEventMap} K
	 * @overload
	 * @param {K} type
	 * @param {(this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any} listener
	 * @param {boolean | EventListenerOptions} [options]
	 * @returns {void}
	 */
	/**
	 * @overload
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | EventListenerOptions} [options]
	 * @returns {void}
	 */
	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | EventListenerOptions} [options]
	 */
	removeEventListener(type, listener, options) {
		return super.target.removeEventListener(type, listener, options);
	}

	/**
	 * @param {Event} event
	 */
	dispatchEvent(event) {
		return super.target.dispatchEvent(event);
	}

	/**
	 * @template {keyof IDBTransactionEventMap} K
	 * @overload
	 * @param {K} type
	 * @param {(this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {this}
	 */
	/**
	 * @overload
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {this}
	 */
	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 */
	on(type, listener, options) {
		super.target.addEventListener(type, listener, options);
		return this;
	}

	/**
	 * @template {keyof IDBTransactionEventMap} K
	 * @overload
	 * @param {K} type
	 * @param {(this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any} listener
	 * @param {boolean | EventListenerOptions} [options]
	 * @returns {this}
	 */
	/**
	 * @overload
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | EventListenerOptions} [options]
	 * @returns {this}
	 */
	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | EventListenerOptions} [options]
	 */
	off(type, listener, options) {
		super.target.removeEventListener(type, listener, options);
		return this;
	}

	/**
	 * @template {keyof IDBTransactionEventMap} K
	 * @overload
	 * @param {K} type
	 * @param {(this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {this}
	 */
	/**
	 * @overload
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 * @returns {this}
	 */
	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 */
	once(type, listener, options) {
		if (typeof options === 'boolean')
			options = { capture: true, once: true };
		else if (typeof options === 'object')
			Object.assign(options, { once: true });
		else if ((options ?? null) === null)
			options = { once: true };
		super.target.addEventListener(type, listener, options);
		return this;
	}

	/**
	 * @param {string | Event} event
	 * @param {EventInit} [init]
	 */
	emit(event, init) {
		if (typeof event === 'string')
			return super.target.dispatchEvent(new Event(event, init));
		return super.target.dispatchEvent(event);
	}

	abort() {
		super.target.abort();
	}

	/**
	 * A method to explicitly commit the transaction. This is the same method
	 * that will be called when a transaction is assigned to a variable declared
	 * with `using`.
	 *
	 * @example
	 *
	 * ```ts
	 * async function countAllRecords(db: NiceIDB): Promise<number> {
	 *   const storeNames = db.storeNames;
	 *   using tx = db.transaction(storeNames);
	 *   const requests = storeNames.map((name) => tx.store(name).count());
	 *   return Promise.all(requests).reduce((x, y) => x + y);
	 * }
	 * ```
	 */
	commit() {
		super.target.commit();
	}

	[Symbol.dispose]() {
		super.target.commit();
	}
}

export class ReadWriteTransaction extends ReadOnlyTransaction {
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
	 * @param {string} name
	 */
	store(name) {
		const store = super.target.objectStore(name);
		return new ReadWriteStore(store);
	}
}

export class UpgradeTransaction extends ReadWriteTransaction {
	/**
	 * @override
	 * @type {IDBTransactionMode}
	 */
	static mode = 'versionchange';

	/**
	 * @override
	 */
	static wrap = createModeGuardedWrap(this);

	/**
	 * @override
	 * @param {string} name
	 */
	store(name) {
		const store = super.target.objectStore(name);
		return new UpgradableStore(store);
	}
}

const readonly = ReadOnlyTransaction.wrap;
const readwrite = ReadWriteTransaction.wrap;
const versionchange = UpgradeTransaction.wrap;

export default { readonly, readwrite, versionchange };
