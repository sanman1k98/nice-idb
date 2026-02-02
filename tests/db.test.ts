import { NiceIDB } from '#nice-idb/db.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseExists, delay, deleteAllDatabases } from './utils';

describe('basic usage', () => {
	it('can open and close a connection', async () => {
		const db = new NiceIDB('test-db');
		const close = vi.fn(() => db.close());

		await expect(db.open()).resolves.toBeInstanceOf(NiceIDB);

		expect(db.opened).toBe(true);
		expect(db.version).toBeGreaterThanOrEqual(1);

		close();
		expect(close).not.toThrow();
	});

	it('has similar properties to an IDBDatabase', async () => {
		const db = await new NiceIDB('test-db').open();

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
			const db = new NiceIDB('test-db').define((version, db) => {
				version(1, async () => {
					const logs = db.createStore('logs', { autoIncrement: true });
					logs.createIndex('types', 'type');
					await logs.add({ type: 'info', message: 'Hello, World!' });
				});
			});

			await expect(db.upgrade()).resolves.toBeInstanceOf(NiceIDB);

			expect(db.version).toBe(1);
			expect(db.storeNames).toContain('logs');
			expect(db.transaction('logs').store('logs').indexNames).toContain('types');

			db.close();
		});
	});

	describe('upgrade transactions', () => {
		beforeEach(async () => deleteAllDatabases());

		it('will create an upgrade tranaction for each upgrade', async () => {
			const db = new NiceIDB('test-db').define((version, db, tx) => {
				version(1, async () => {
					expect(db.version).toBe(1);
					tx.commit();
				});
				version(2, async () => {
					expect(db.version).toBe(2);
					tx.commit();
				});
				version(3, async () => {
					expect(db.version).toBe(3);
					tx.commit();
				});
			});

			await expect(db.upgrade()).resolves.toBeInstanceOf(NiceIDB);
			expect(db.version).toBe(3);

			db.close();
		});

		it('will abort an upgrade if an error is thrown', async () => {
			const db = new NiceIDB('test-db').define((version, db) => {
				version(1, async () => {
					const logs = db.createStore('logs', { autoIncrement: true });
					logs.createIndex('types', 'type');
					await logs.add({ type: 'info', message: 'Hello, World!' });
					throw new Error('SomeError');
				});
			});

			await expect(db.upgrade()).rejects.toThrowError('SomeError');
			await expect(databaseExists('test-db')).resolves.toBe(false);
		});

		it('supports manually committing at the end of an upgrade', async () => {
			const db = new NiceIDB('test-db').define((version, db, tx) => {
				version(1, async () => {
					const logs = db.createStore('logs', { autoIncrement: true });
					logs.createIndex('types', 'type');
					await logs.add({ type: 'info', message: 'Hello, World!' });
					tx.commit();
				});
				version(2, async () => {
					const logs = tx.store('logs');
					logs.createIndex('scopes', 'scope');
					tx.commit();
				});
			});

			await expect(db.upgrade()).resolves.toBeInstanceOf(NiceIDB);
			expect(db.version).toBe(2);
			expect(db.store('logs').indexNames).toHaveLength(2);

			db.close();
		});
	});

	describe('async footguns', () => {
		beforeEach(async () => deleteAllDatabases());

		it('can unexpectedly yield control when awaiting', async () => {
			const db = new NiceIDB('test-db').define((version, db) => {
				version(1, async () => {
					const logs = db.createStore('logs', { autoIncrement: true });
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

			await expect(db.open()).resolves.toBeInstanceOf(NiceIDB);
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
