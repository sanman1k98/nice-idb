/**
 * Use to create a class to augment or "wrap" another.
 * @template {object} T
 * @param {Constructor<T>} Class
 */
export function Wrappable<T extends object>(Class: Constructor<T>): typeof WrapperClass;
/** @import { Constructor, WrapperClass } from '#types' */
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
import type { Constructor } from '#types';
import type { WrapperClass } from '#types';
//# sourceMappingURL=wrap.d.ts.map