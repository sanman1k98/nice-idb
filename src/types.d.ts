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

import type { VirtualInstance } from './wrap.js';

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

export interface UpgradeCallback {
	(evt: IDBVersionChangeEvent): void | Promise<void>;
};

export interface RegisterUpgrade {
	(version: number, upgrade: UpgradeCallback): void;
};

export interface UpgradeState {
	db: VirtualInstance<UpgradableDatabase>;
	upgrades: Map<number, UpgradeCallback>;
	latest: number;
}

export type {
	KeyRangeOptions,
	OpenCursorOptions,
	QueryOptions,
	SourceGetAllOptions,
} from './util.d.ts';
