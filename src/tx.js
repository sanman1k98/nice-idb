import { NiceIDBStore } from './store.js';
import { getStrings } from './util.js';

/** @typedef {import('#types').Transaction} Transaction */

/**
 * @implements {Transaction}
 * @implements {Disposable}
 */
export class NiceIDBTransaction {
	/** @type {IDBTransaction} */ #tx;
	/** @type {Promise<Event>} */ #finish;
	/** @type {Event | undefined} */ #event;

	get error() { return this.#tx.error; }
	get durability() { return this.#tx.durability; }
	get mode() { return this.#tx.mode; }

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
	get storeNames() { return getStrings(this.#tx.objectStoreNames); }

	/**
	 * @param {IDBTransaction} tx - The transaction instance to wrap.
	 */
	constructor(tx) {
		this.#tx = tx;

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
	 * Get an object store within the transaction's scope.
	 * @param {string} name
	 * @returns {NiceIDBStore} An object store instance.
	 */
	store(name) {
		const store = this.#tx.objectStore(name);
		return this.#tx.mode === 'versionchange'
			? new NiceIDBStore.Upgradable(store, this.#tx)
			: new NiceIDBStore(store);
	}

	/** @type {Record<string, NiceIDBStore> | undefined} */
	#storesProxy;

	/**
	 * @see {@link IDBTransaction.prototype.objectStoreNames}
	 * Access stores in the scope of this transaction.
	 * @returns {{ [name: string]: NiceIDBStore }} Can be indexed by store names.
	 */
	get stores() {
		return this.#storesProxy ??= new Proxy(Object.create(null), {
			get: (_, k) => {
				if (typeof k === 'string' && this.storeNames.includes(k)) {
					const store = this.#tx.objectStore(k);
					return this.#tx.mode === 'versionchange'
						? new NiceIDBStore.Upgradable(store, this.#tx)
						: new NiceIDBStore(store);
				}
				throw new Error('Invalid store name', {
					cause: { name: k },
				});
			},
		});
	}

	/**
	 * @param {keyof IDBTransactionEventMap} type
	 * @param {(this: IDBTransaction, ev: Event) => any} listener
	 * @param {boolean | AddEventListenerOptions} [options]
	 */
	addEventListener(type, listener, options) {
		return this.#tx.addEventListener(type, listener, options);
	}

	/**
	 * @param {keyof IDBTransactionEventMap} type
	 * @param {(this: IDBTransaction, ev: Event) => any} listener
	 * @param {boolean | EventListenerOptions} [options]
	 */
	removeEventListener(type, listener, options) {
		return this.#tx.removeEventListener(type, listener, options);
	}

	abort() {
		this.#tx.abort();
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
		this.#tx.commit();
	}

	[Symbol.dispose]() {
		this.#tx.commit();
	}

	/**
	 * @param {IDBTransaction} tx
	 * @returns {NiceIDBTransaction} - A wrapped transaction.
	 */
	static wrap(tx) {
		return new this(tx);
	}

	static Upgrade = class NiceIDBUpgradeTransaction extends NiceIDBTransaction {
		/**
		 * @param {IDBTransaction} tx
		 */
		constructor(tx) {
			if (!(tx instanceof IDBTransaction) || tx.mode !== 'versionchange')
				throw new TypeError('Expected an upgrade transaction');
			super(tx);
		}
	};
}
