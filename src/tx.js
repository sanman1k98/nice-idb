/** @import { NiceIDBErrorInfo } from './util.js' */
import { NiceIDBObjectStore } from './store.js';
import { getStrings } from './util.js';

/** @typedef {import('#types').Transaction} Transaction */

/**
 * @implements {Transaction}
 * @implements {Disposable}
 */
export class NiceIDBTransaction {
	/** @type {IDBTransaction} */
	#tx;
	/** @type {Promise<void> | null} */
	#promise = null;

	/** @type {IDBTransactionDurability} */
	durability;
	/** @type {IDBTransactionMode} */
	mode;

	/**
	 * @param {IDBTransaction} tx - The transaction instance to wrap.
	 */
	constructor(tx) {
		this.#tx = tx;

		this.durability = tx.durability;
		this.mode = tx.mode;
	}

	/**
	 * List of stores in the scope of this transaction.
	 * @deprecated
	 * @see {@link IDBTransaction.prototype.objectStoreNames}
	 */
	get stores() {
		return getStrings(this.#tx.objectStoreNames);
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
	 * @returns {NiceIDBObjectStore} An object store instance.
	 */
	store(name) {
		const store = this.#tx.objectStore(name);
		return new NiceIDBObjectStore(store);
	}

	/**
	 * @returns {Promise<void>} A Promise that resolves when the transaction's "complete" event fires.
	 */
	promise() {
		this.#promise ??= new Promise((resolve, reject) => {
			/** @satisfies {AddEventListenerOptions} */
			const opts = { once: true };
			/** @type {() => void} */
			let unlisten;

			const handleSuccess = () => {
				unlisten();
				resolve();
			};

			/** @type {EventListener} */
			const handleFailure = (event) => {
				unlisten();
				const { error } = this.#tx;
				const [transaction, request, source] = [this.#tx, null, null];
				/** @satisfies {NiceIDBErrorInfo} */
				const cause = { event, error, transaction, request, source };
				reject(new Error('Transaction failed', { cause }));
			};

			unlisten = () => {
				this.#tx.removeEventListener('complete', handleSuccess);
				this.#tx.removeEventListener('abort', handleFailure);
			};

			this.#tx.addEventListener('success', handleSuccess, opts);
			this.#tx.addEventListener('abort', handleFailure, opts);
		});

		return this.#promise;
	}

	done() {
		return this.promise();
	}
}
