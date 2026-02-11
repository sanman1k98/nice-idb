/**
 * @template {object} [T = any]
 * @implements {ProxyHandler<T>}
 */
export class RedirectableProxy<T extends object = any> implements ProxyHandler<T> {
    /** @param {string} trap */
    static "__#private@#addTrap"(trap: string): void;
    get proxy(): T;
    get revoke(): () => void;
    /**
     * Set the target for this proxy.
     * @param {T | undefined} object
     */
    target(object: T | undefined): void;
    /**
     * @internal
     * @param {any} _
     * @param {PropertyKey} p
     * @param {any} r
     */
    get(_: any, p: PropertyKey, r: any): any;
    #private;
}
//# sourceMappingURL=proxy.d.ts.map