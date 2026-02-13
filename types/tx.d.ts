/**
 * @template {WrapperClass<IDBTransaction>} C
 * @template {C extends WrapperClass<infer U> ? U : never} T
 * @param {Constructor<C> & { mode: IDBTransactionMode }} Class
 */
export function createModeGuardedWrap<C extends WrapperClass<IDBTransaction>, T extends C extends WrapperClass<infer U> ? U : never>(Class: Constructor<C> & {
    mode: IDBTransactionMode;
}): (/** @type {T} */ target: T) => C;
declare const ReadOnlyTransaction_base: {
    new (): WrapperClass<IDBTransaction>;
    new (target: IDBTransaction): WrapperClass<IDBTransaction>;
    wrap(target: objectT): WrapperClass<object>;
};
/**
 * @implements {Disposable}
 */
export class ReadOnlyTransaction extends ReadOnlyTransaction_base implements Disposable {
    /**
     * @type {IDBTransactionMode}
     */
    static mode: IDBTransactionMode;
    /**
     * Wrap an existing IDBTransaction instance.
     * @override
     */
    static override wrap: (target: IDBTransaction) => ReadOnlyTransaction;
    /**
     * @param {IDBTransaction} tx - The transaction instance to wrap.
     */
    constructor(tx: IDBTransaction);
    get error(): DOMException | null;
    get durability(): IDBTransactionDurability;
    get mode(): IDBTransactionMode;
    /**
     * @returns {boolean} Returns `true` when the transaction has either committed or aborted.
     */
    get finished(): boolean;
    get committed(): boolean;
    get aborted(): boolean;
    /**
     * @returns {Promise<void>} A promise for when the transaction commits or aborts.
     */
    get finish(): Promise<void>;
    /**
     * List of stores in the scope of this transaction.
     * @see {@link IDBTransaction.prototype.objectStoreNames}
     */
    get storeNames(): readonly string[];
    /**
     * Get an object store within the transaction's scope.
     * @param {string} name
     */
    store(name: string): ReadOnlyStore;
    /**
     * @template {keyof IDBTransactionEventMap} K
     * @overload
     * @param {K} type
     * @param {(this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any} listener
     * @param {boolean | AddEventListenerOptions} [options]
     * @returns {void}
     */
    addEventListener<K extends keyof IDBTransactionEventMap>(type: K, listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
    /**
     * @overload
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | AddEventListenerOptions} [options]
     * @returns {void}
     */
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
    /**
     * @template {keyof IDBTransactionEventMap} K
     * @overload
     * @param {K} type
     * @param {(this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any} listener
     * @param {boolean | EventListenerOptions} [options]
     * @returns {void}
     */
    removeEventListener<K extends keyof IDBTransactionEventMap>(type: K, listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): void;
    /**
     * @overload
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | EventListenerOptions} [options]
     * @returns {void}
     */
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
    /**
     * @param {Event} event
     */
    dispatchEvent(event: Event): boolean;
    /**
     * @template {keyof IDBTransactionEventMap} K
     * @overload
     * @param {K} type
     * @param {(this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any} listener
     * @param {boolean | AddEventListenerOptions} [options]
     * @returns {this}
     */
    on<K extends keyof IDBTransactionEventMap>(type: K, listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): this;
    /**
     * @overload
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | AddEventListenerOptions} [options]
     * @returns {this}
     */
    on(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): this;
    /**
     * @template {keyof IDBTransactionEventMap} K
     * @overload
     * @param {K} type
     * @param {(this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any} listener
     * @param {boolean | EventListenerOptions} [options]
     * @returns {this}
     */
    off<K extends keyof IDBTransactionEventMap>(type: K, listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): this;
    /**
     * @overload
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | EventListenerOptions} [options]
     * @returns {this}
     */
    off(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): this;
    /**
     * @template {keyof IDBTransactionEventMap} K
     * @overload
     * @param {K} type
     * @param {(this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any} listener
     * @param {boolean | AddEventListenerOptions} [options]
     * @returns {this}
     */
    once<K extends keyof IDBTransactionEventMap>(type: K, listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): this;
    /**
     * @overload
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | AddEventListenerOptions} [options]
     * @returns {this}
     */
    once(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): this;
    /**
     * @param {string | Event} event
     * @param {EventInit} [init]
     */
    emit(event: string | Event, init?: EventInit): boolean;
    abort(): void;
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
    [Symbol.dispose](): void;
    #private;
}
export class ReadWriteTransaction extends ReadOnlyTransaction {
    /**
     * @override
     */
    static override wrap: (target: IDBTransaction) => ReadWriteTransaction;
    /**
     * @override
     * @param {string} name
     */
    override store(name: string): ReadWriteStore;
}
export class UpgradeTransaction extends ReadWriteTransaction {
    /**
     * @override
     */
    static override wrap: (target: IDBTransaction) => UpgradeTransaction;
    /**
     * @override
     * @param {string} name
     */
    override store(name: string): UpgradableStore;
}
declare namespace _default {
    export { readonly };
    export { readwrite };
    export { versionchange };
}
export default _default;
import type { WrapperClass } from '#types';
import type { Constructor } from '#types';
import { ReadOnlyStore } from './store.js';
import { ReadWriteStore } from './store.js';
import { UpgradableStore } from './store.js';
declare function readonly(target: IDBTransaction): ReadOnlyTransaction;
declare function readwrite(target: IDBTransaction): ReadWriteTransaction;
declare function versionchange(target: IDBTransaction): UpgradeTransaction;
//# sourceMappingURL=tx.d.ts.map