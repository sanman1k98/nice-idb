/** @import { Constructor } from '#types' */
/**
 * Create a Proxy for an object that will be created or swapped out later.
 * @template {object} [T = any]
 * @implements {ProxyHandler<T>}
 */
export class VirtualInstance<T extends object = any> implements ProxyHandler<T> {
    /**
     * @param {Constructor<any>} Class
     */
    static defer(Class: Constructor<any>): VirtualInstance<any>;
    /**
     * @param {string} name
     */
    static "__#private@#createTrap"(name: string): (...args: any[]) => any;
    /**
     * @param {Constructor<T>} Class
     */
    constructor(Class: Constructor<T>);
    get proxy(): T;
    /**
     * Change the backing instance for the proxy.
     * @param {T} target
     */
    update(target: T): undefined;
    revoke(): void;
    /**
     * @param {any} _
     * @param {PropertyKey} p
     * @param {any} r
     */
    get(_: any, p: PropertyKey, r: any): any;
    #private;
}
/**
 * Extend this class to wrap and augment existing classes.
 * @template T
 */
export class Wrapper<T> {
    /**
     * The class of instances to wrap.
     * @readonly
     * @abstract
     * @protected
     * @type {Constructor}
     */
    protected static readonly Target: Constructor;
    /**
     * Determines whether the given value is an instance of `Target` and
     * therefore can be wrapped by this class.
     * @param {unknown} value
     */
    static isWrappable(value: unknown): boolean;
    /**
     * Will throw if the given value cannot be wrapped by this class.
     * @param {unknown} value
     */
    static assertWrappable(value: unknown): void;
    /**
     * Check the given value is wrappable and return a new wrapped instance.
     * @protected
     * @abstract
     * @param {unknown} target
     */
    protected static wrap(target: unknown): Wrapper<unknown>;
    /**
     * @param {T} [target]
     */
    constructor(target?: T);
    /**
     * Get access to the underlying wrapped instance.
     * @protected
     */
    protected get target(): T;
    /**
     * @protected
     * @param {T} target
     */
    protected wrap(target: T): this;
    #private;
}
import type { Constructor } from '#types';
//# sourceMappingURL=wrap.d.ts.map