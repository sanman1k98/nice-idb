import type { Mock } from 'vitest';
import { Database } from '#nice-idb/db';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseExists, delay, deleteAllDatabases } from './utils';

describe('basic usage', () => {
	it('can open and close a connection', async () => {
		const db = Database.init('test-db');
		const close = vi.fn(() => db.close());

		await expect(db.open()).resolves.toBeInstanceOf(Database);

		expect(db.opened).toBe(true);
		expect(db.version).toBeGreaterThanOrEqual(1);

		close();
		expect(close).not.toThrow();
	});

	it('has similar properties to an IDBDatabase', async () => {
		const db = await Database.init('test-db').open();

		expect(db.name).toBeTypeOf('string');
		expect(db.version).toBeTypeOf('number');
		expect(db.storeNames).toSatisfy(Array.isArray);

		db.close();
	});
});

describe('defining upgrades', () => {
	beforeEach(async () => deleteAllDatabases());

	describe('basic usage', () => {
		it('can define the structure of a new database', async () => {
			const db = Database.init('test-db').define((version, db) => {
				version(1, async () => {
					const logs = db.upgrade.createStore('logs', { autoIncrement: true });
					logs.createIndex('types', 'type');
					await logs.add({ type: 'info', message: 'Hello, World!' });
				});
			});

			await expect(db.upgrade()).resolves.toBeInstanceOf(Database);

			expect(db.version).toBe(1);
			expect(db.storeNames).toContain('logs');
			expect(db.transaction('logs').store('logs').indexNames).toContain('types');

			db.close();
		});
	});

	describe('upgrade proxies', () => {
		let testDB: Database;

		beforeEach(async () => deleteAllDatabases());
		afterEach(() => testDB!.close());

		it('will error when accessed outside of upgrade callbacks', async () => {
			testDB = Database.init('test-db').define((version, db) => {
				expect.soft(() => db.version).toThrow('Cannot access');
				version(1, () => {
					expect.soft(db.version).toBe(1);
				});
			});

			expect.assertions(2);
			await testDB.upgrade();
		});
	});

	describe('upgrading existing databases', () => {
		let testDB: Database;

		beforeEach(async () => {
			const existingDB = Database.init('test-db')
				.define((version, db) => {
					version(1, async () => {
						const logs = db.upgrade.createStore('logs', { autoIncrement: true });
						logs.createIndex('types', 'type');
						await logs.add({ type: 'info', message: 'Hello, World!' });
					});
				});
			await existingDB.upgrade();
			existingDB.close();

			testDB = Database.init('test-db');
		});

		afterEach(async () => {
			testDB.close();
		});

		it('will only execute upgrades if needed', async () => {
			let callback: Mock;

			testDB.define((version, db) => {
				version(1, callback = vi.fn(async () => {
					const logs = db.upgrade.createStore('logs', { autoIncrement: true });
					logs.createIndex('types', 'type');
					await logs.add({ type: 'info', message: 'Hello, World!' });
				}));
			});

			const spy = vi.spyOn(indexedDB, 'open');
			await expect(testDB.upgrade()).resolves.toBeInstanceOf(Database);
			expect(testDB.version).toBe(1);
			expect(spy).toBeCalledTimes(1);
			expect(callback!).not.toBeCalled();
		});
	});

	describe('upgrade transactions', () => {
		beforeEach(async () => deleteAllDatabases());

		it('will create an upgrade tranaction for each upgrade', async () => {
			const db = Database.init('test-db').define((version, db) => {
				version(1, async () => {
					expect(db.version).toBe(1);
					db.upgrade.commit();
				});
				version(2, async () => {
					expect(db.version).toBe(2);
					db.upgrade.commit();
				});
				version(3, async () => {
					expect(db.version).toBe(3);
					db.upgrade.commit();
				});
			});

			await expect(db.upgrade()).resolves.toBeInstanceOf(Database);
			expect(db.version).toBe(3);

			db.close();
		});

		it('will abort an upgrade if an error is thrown', async () => {
			const db = Database.init('test-db').define((version, db) => {
				version(1, async () => {
					const logs = db.upgrade.createStore('logs', { autoIncrement: true });
					logs.createIndex('types', 'type');
					await logs.add({ type: 'info', message: 'Hello, World!' });
					throw new Error('SomeError');
				});
			});

			await expect(db.upgrade()).rejects.toThrowError('SomeError');
			await expect(databaseExists('test-db')).resolves.toBe(false);
		});

		it('supports manually committing at the end of an upgrade', async () => {
			const db = Database.init('test-db').define((version, db) => {
				version(1, async () => {
					const logs = db.upgrade.createStore('logs', { autoIncrement: true });
					logs.createIndex('types', 'type');
					await logs.add({ type: 'info', message: 'Hello, World!' });
					db.upgrade.commit();
				});
				version(2, async () => {
					const logs = db.upgrade.store('logs');
					logs.createIndex('scopes', 'scope');
					db.upgrade.commit();
				});
			});

			await expect(db.upgrade()).resolves.toBeInstanceOf(Database);
			expect(db.version).toBe(2);
			expect(db.store('logs').indexNames).toHaveLength(2);

			db.close();
		});
	});

	describe('async footguns', () => {
		beforeEach(async () => deleteAllDatabases());

		it('can unexpectedly yield control when awaiting', async () => {
			const db = Database.init('test-db').define((version, db) => {
				version(1, async () => {
					const logs = db.upgrade.createStore('logs', { autoIncrement: true });
					logs.createIndex('types', 'type');
					// WARN: awaiting a task can preempt the "upgradeneeded" event handler.
					await delay(1);
					await logs.add({ type: 'info', message: 'Hello, World!' });
					expect.unreachable('The above line will throw an error since the upgrade transaction is finished');
				});
			});

			// TODO: custom error with hints.
			await expect(db.upgrade()).rejects.toThrowError('transaction is inactive or finished');

			// The database connection should be closed.
			expect(db.opened).toBe(false);
			// But the upgrade won't have been aborted.
			await expect(databaseExists('test-db')).resolves.toBe(true);

			await expect(db.open()).resolves.toBeInstanceOf(Database);
			expect(db.version).toBe(1);
			// Creates store and index as part of the upgrade.
			expect(db.storeNames).includes('logs');
			const logs = db.store('logs');
			expect(logs.indexNames).includes('types');
			// Failed to add a record, because the event handler was preempted.
			await expect(logs.count()).resolves.toBe(0);

			db.close();
		});
	});
});
