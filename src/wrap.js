/** @import { Constructor } from '#types' */

/**
 * Create a Proxy for an object that will be created or swapped out later.
 * @template {object} [T = any]
 * @implements {ProxyHandler<T>}
 */
export class VirtualInstance {
	/** @type {Constructor<T>} @readonly */ #Class;
	/** @type {() => void} @readonly */ #revoke;
	/** @type {T | undefined} */ #target;
	/** @type {T} @readonly */ #proxy;

	#message = 'Cannot access instance';

	get proxy() { return this.#proxy; }

	/**
	 * @param {Constructor<T>} Class
	 */
	constructor(Class) {
		const { proxy, revoke } = Proxy.revocable(
			Object.create(Reflect.getPrototypeOf(Class)),
			/** @type {ProxyHandler<any>} */ (this),
		);
		this.#revoke = revoke;
		this.#proxy = proxy;
		this.#Class = Class;
	}

	/**
	 * Change the backing instance for the proxy.
	 * @param {T} target
	 */
	update(target) {
		if (target instanceof this.#Class)
			return void (this.#target = target);
		throw new TypeError('InvalidInstance');
	}

	revoke() { return this.#revoke(); }

	/**
	 * @param {Constructor<any>} Class
	 */
	static defer(Class) {
		return new this(Class);
	}

	/**
	 * @param {any} _
	 * @param {PropertyKey} p
	 * @param {any} r
	 */
	get(_, p, r) {
		if (!this.#target)
			throw new Error(this.#message);
		const t = this.#target;
		const v = /** @type {any} */(t)[p];
		if (typeof v !== 'function')
			return v;
		/** @this {any} @param {any[]} args */
		return function (...args) {
			return v.apply(this === r ? t : r, args);
		};
	}

	/**
	 * @param {string} name
	 */
	static #createTrap(name) {
		/** @this {VirtualInstance} @param {any[]} args */
		return function noop(...args) {
			if (!this.#target)
				throw new Error(this.#message);
			/** @type {(target: any, ...args: any[]) => any} */
			const fwd = Reflect[/** @type {keyof Reflect} */(name)];
			return fwd(this.#target, ...args);
		};
	}

	static {
		for (const trap of Object.keys(Reflect)) {
			if (trap !== 'get')
				Reflect.set(this.prototype, trap, this.#createTrap(trap));
		}
	}
}

/**
 * Extend this class to wrap and augment existing classes.
 * @template T
 */
export class Wrapper {
	/**
	 * The class of instances to wrap.
	 * @readonly
	 * @abstract
	 * @protected
	 * @type {Constructor}
	 */
	static Target = Object;

	/**
	 * Determines whether the given value is an instance of `Target` and
	 * therefore can be wrapped by this class.
	 * @param {unknown} value
	 */
	static isWrappable(value) {
		if (this.Target === Wrapper.Target)
			throw new Error('InvalidWrapperOverride');
		return Object.getPrototypeOf(value) === this.Target.prototype;
	}

	/**
	 * Will throw if the given value cannot be wrapped by this class.
	 * @param {unknown} value
	 */
	static assertWrappable(value) {
		if (!this.isWrappable(value))
			throw new TypeError(`Expected an instance of ${this.Target.name}`);
	}

	/** @type {T | undefined} */
	#target = undefined;

	/**
	 * Get access to the underlying wrapped instance.
	 * @protected
	 */
	get target() { return /** @type {T} */(this.#target); }

	/**
	 * @param {T} [target]
	 */
	constructor(target) {
		if (new.target === Wrapper)
			throw new Error('MustBeSubclassed');
		this.#target = target;
	}

	/**
	 * @protected
	 * @param {T} target
	 */
	wrap(target) {
		this.#target = target;
		return this;
	}

	/**
	 * Check the given value is wrappable and return a new wrapped instance.
	 * @protected
	 * @abstract
	 * @param {unknown} target
	 */
	static wrap(target) {
		this.assertWrappable(target);
		return new this(target);
	}
}
