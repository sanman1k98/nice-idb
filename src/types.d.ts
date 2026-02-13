import type {
	ReadOnlyCursor,
	ReadOnlyIndexCursor,
	ReadOnlyIndexKeyCursor,
	ReadOnlyKeyCursor,
	ReadWriteCursor,
	ReadWriteIndexCursor,
} from './cursor.js';

import type { UpgradableDatabase } from './db.js';

import type {
	ReadOnlyIndex,
	ReadWriteIndex,
} from './idx.js';

import type {
	ReadOnlyStore,
	ReadWriteStore,
	UpgradableStore,
} from './store.js';

import type {
	ReadOnlyTransaction,
	ReadWriteTransaction,
	UpgradeTransaction,
} from './tx.js';

import type { VirtualInstance, Wrappable } from './wrap.js';

export namespace Cursor {
	export type {
		ReadOnlyCursor as ReadOnly,
		ReadOnlyKeyCursor as ReadOnlyKey,
		ReadWriteCursor as ReadWrite,
	};
}

export namespace IndexCursor {
	export type {
		ReadOnlyIndexCursor as ReadOnly,
		ReadOnlyIndexKeyCursor as ReadOnlyKey,
		ReadWriteIndexCursor as ReadWrite,
	};
}

export namespace Index {
	export type {
		ReadOnlyIndex as ReadOnly,
		ReadWriteIndex as ReadWrite,
	};
}

export namespace Store {
	export type {
		ReadOnlyStore as ReadOnly,
		ReadWriteStore as ReadWrite,
		UpgradableStore as Upgradable,
	};
}

export namespace Transaction {
	export type {
		ReadOnlyTransaction as ReadOnly,
		ReadWriteTransaction as ReadWrite,
		UpgradeTransaction as Upgrade,
	};
}

// eslint-disable-next-line ts/no-empty-object-type
export interface Constructor<T = {}> {
	new (...args: any[]): T;
};

/**
 * Workaround for adding protected members to mixins.
 * Used for typecasting return type of {@link Wrappable}.
 */
export class WrapperClass<T extends object> {
	/**
	 * Create an empty wrapper.
	 */
	constructor(): WrapperClass<T>;
	/**
	 * Check the given target's type and wrap.
	 */
	constructor(target: T): WrapperClass<T>;
	/**
	 * Used by subclasses to access the wrapped object.
	 */
	get target(): T;
	/**
	 * Used from within subclasses set the wrapped object.
	 */
	wrap(target: T): this;
	/**
	 * Create a wrapper for the given target.
	 */
	static wrap(target: objectT): WrapperClass<object>;
}

export interface UpgradeCallback {
	(evt: IDBVersionChangeEvent): void | Promise<void>;
};

export interface RegisterUpgrade {
	(version: number, upgrade: UpgradeCallback): void;
};

export interface UpgradeState {
	db: VirtualInstance<UpgradableDatabase>;
	tx: VirtualInstance<UpgradeTransaction>;
	upgrades: Map<number, UpgradeCallback>;
	latest: number;
}

export type {
	KeyRangeOptions,
	OpenCursorOptions,
	QueryOptions,
	SourceGetAllOptions,
} from './util.d.ts';
