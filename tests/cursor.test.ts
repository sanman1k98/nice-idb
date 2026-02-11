import { Database } from '#nice-idb/db';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

describe('cursors', () => {
	describe('async iterable usage', () => {
		let testDB: Database;

		beforeAll(async () => {
			testDB = Database.init('test-data').define((version, db) => {
				version(1, async () => {
					const data = db.createStore('data', { autoIncrement: true });
					for (let i = 1; i <= 10; i++)
						await data.add(i);
				});
			});

			await testDB.upgrade();
		});

		afterAll(() => testDB.close());

		it('can be used in a "for await...of" loop', async () => {
			const store = testDB.store('data');
			const size = await store.count();
			let iters = 0;

			for await (const _ of store.cursor())
				iters++;

			expect(iters).toBe(size);
		});

		it('supports calling cursor.continue() manually', async () => {
			const store = testDB.store('data');
			const size = await store.count();
			let iters = 0;

			for await (const c of store.cursor()) {
				iters++;
				c.continue();
			}

			expect(iters).toBe(size);
		});

		it('supports calling cursor.advance()', async () => {
			const store = testDB.store('data');
			const size = await store.count();
			let iters = 0;

			for await (const c of store.cursor()) {
				iters++;
				c.advance(2);
			}

			expect(iters).toBeCloseTo(size / 2);
		});

		it('can handle no matching records', async () => {
			const store = testDB.store('data');
			const key = '404 not found';
			await expect(store.get(key)).resolves.toBeUndefined();

			const loop = vi.fn(async () => {
				for await (const _ of store.cursor({ only: key }))
					expect.unreachable('No matching records');
				return true;
			});

			await expect(loop()).resolves.toBeTruthy();
		});

		it('updates the "key" prop on every iteration', async () => {
			const store = testDB.store('data');
			expect.assertions(await store.count());
			let prevKey: IDBValidKey | undefined;

			for await (const { key } of store.cursor()) {
				expect(key).not.toBe(prevKey);
				prevKey = key;
			}
		});
	});
});
