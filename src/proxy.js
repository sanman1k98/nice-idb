/**
 * @template {object} [T = any]
 * @implements {ProxyHandler<T>}
 */
export class RedirectableProxy {
	/** @type {T} @readonly */ #proxy;
	/** @type {() => void} @readonly */ #revoke;
	/** @type {T | undefined} */ #target;

	#message = 'Cannot access proxy';

	get proxy() { return this.#proxy; }
	get revoke() { return this.#revoke; }

	constructor() {
		const { proxy, revoke } = Proxy.revocable(this, this);
		this.#revoke = revoke;
		this.#proxy = proxy;
	}

	/**
	 * Set the target for this proxy.
	 * @param {T | undefined} object
	 */
	target(object) {
		this.#target = object;
	}

	/**
	 * @internal
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

	/** @param {string} trap */
	static #addTrap(trap) {
		const method = /** @this {RedirectableProxy} */function (/** @type {any} */ ...args) {
			if (!this.#target)
				throw new Error(this.#message);
			/** @type {(target: any, ...args: any[]) => any} */
			const forward = Reflect[/** @type {keyof Reflect} */(trap)];
			return forward(this.#target, ...args);
		};
		// Add a proxy handler method to the class.
		Reflect.set(this.prototype, trap, method);
	}

	static {
		for (const trap of Object.keys(Reflect))
			trap !== 'get' && this.#addTrap(trap);
	}
}
