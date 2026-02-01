/** @import { NiceIDBErrorInfo } from './util.js' */
import { NiceIDBStore } from './store.js';
import { getStrings } from './util.js';

/** @typedef {import('#types').Transaction} Transaction */

/**
 * @implements {Transaction}
 * @implements {Disposable}
 */
export class NiceIDBTransaction {
	/** @type {IDBTransaction} */
	#tx;
	/** @type {Promise<Event>} */
	#event;
	/** @type {Event | undefined} */ #finish;

	/**
	 * @param {IDBTransaction} tx - The transaction instance to wrap.
	 */
	constructor(tx) {
		this.#tx = tx;

		this.#event = new Promise((resolve) => {
			/** @satisfies {EventListener} */
			const handleEvent = (event) => {
				tx.removeEventListener('complete', handleEvent);
				tx.removeEventListener('abort', handleEvent);
				resolve(this.#finish = event);
			};

			const opts = { once: true, passive: true };
			tx.addEventListener('complete', handleEvent, opts);
			tx.addEventListener('abort', handleEvent, opts);
		});
	}

	get durability() {
		return this.#tx.durability;
	}

	get mode() {
		return this.#tx.mode;
	}

	/**
	 * @returns {boolean} Returns `true` when the transaction has either committed or aborted.
	 */
	get finished() {
		return !!this.#finish;
	}

	/**
	 * @returns {boolean} Returns `true` if this transaction has been committed.
	 */
	get committed() {
		return this.#finish?.type === 'complete';
	}

	/**
	 * @returns {boolean} Returns `true` if this transaction has been aborted.
	 */
	get aborted() {
		return this.#finish?.type === 'abort';
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
	 * List of stores in the scope of this transaction.
	 * @see {@link IDBTransaction.prototype.objectStoreNames}
	 */
	get storeNames() {
		return getStrings(this.#tx.objectStoreNames);
	}

	get error() {
		return this.#tx.error;
	}

	abort() {
		this.#tx.abort();
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

	/**
	 * @returns {Promise<void>} A Promise that resolves when the transaction's "complete" event fires.
	 */
	async promise() {
		return this.#event.then((event) => {
			if (event.type === 'complete')
				return Promise.resolve();

			const { error } = this.#tx;
			const [transaction, request, source] = [this.#tx, null, null];
			/** @satisfies {NiceIDBErrorInfo} */
			const cause = { event, error, transaction, request, source };
			return Promise.reject(new Error('Transaction aborted', { cause }));
		});
	}

	done() {
		return this.promise();
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

		/**
		 * @param {string} name
		 * @override
		 */
		store(name) {
			const store = this.#tx.objectStore(name);
			return new NiceIDBStore.Upgradable(store, this.#tx);
		}
	};
}
