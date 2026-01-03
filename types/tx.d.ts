/** @typedef {import('#types').Transaction} Transaction */
/**
 * @implements {Transaction}
 */
export class NiceIDBTransaction implements Transaction {
    /**
     * @param {IDBTransaction} tx - The transaction instance to wrap.
     */
    constructor(tx: IDBTransaction);
    /** @type {IDBDatabase} */
    db: IDBDatabase;
    /** @type {IDBTransactionDurability} */
    durability: IDBTransactionDurability;
    /** @type {IDBTransactionMode} */
    mode: IDBTransactionMode;
    /**
     * List of stores in the scope of this transaction.
     * @see {@link IDBTransaction.prototype.objectStoreNames}
     */
    get stores(): readonly string[];
    get error(): DOMException | null;
    abort(): void;
    /**
     * @param {keyof IDBTransactionEventMap} type
     * @param {(this: IDBTransaction, ev: Event) => any} listener
     * @param {boolean | AddEventListenerOptions} [options]
     */
    addEventListener(type: keyof IDBTransactionEventMap, listener: (this: IDBTransaction, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
    /**
     * @param {keyof IDBTransactionEventMap} type
     * @param {(this: IDBTransaction, ev: Event) => any} listener
     * @param {boolean | EventListenerOptions} [options]
     */
    removeEventListener(type: keyof IDBTransactionEventMap, listener: (this: IDBTransaction, ev: Event) => any, options?: boolean | EventListenerOptions): void;
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
    commit(): void;
    /**
     * Get an object store within the transaction's scope.
     * @param {string} name
     * @returns {NiceIDBObjectStore} An object store instance.
     */
    store(name: string): NiceIDBObjectStore;
    /**
     * @returns {Promise<void>} A Promise that resolves when the transaction's "complete" event fires.
     */
    promise(): Promise<void>;
    done(): Promise<void>;
    [Symbol.dispose](): void;
    #private;
}
export type Transaction = import("#types").Transaction;
import { NiceIDBObjectStore } from './store.js';
//# sourceMappingURL=tx.d.ts.map