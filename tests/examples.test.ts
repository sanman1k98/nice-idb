/* eslint-disable test/consistent-test-it */
/* eslint-disable no-console */
import { NiceIDB } from 'nice-idb';
import { afterEach, describe, expect, test } from 'vitest';
import { deleteAllDatabases } from './utils.js';

async function example1() {
	const db = NiceIDB.init('library').define((version, db) => {
		version(1, async () => {
			// The database did not previously exist, so create object stores and indexes.
			const store = db.upgrade.createStore('books', { keyPath: 'isbn' });
			store.createIndex('by_title', 'title', { unique: true });
			store.createIndex('by_author', 'author');

			// Populate with initial data.
			await store.put({
				title: 'Quarry Memories',
				author: 'Fred',
				isbn: 123456,
			});
			await store.put({
				title: 'Water Buffaloes',
				author: 'Fred',
				isbn: 234567,
			});
			await store.put({
				title: 'Bedrock Nights',
				author: 'Barney',
				isbn: 345678,
			});
		});
		version(2, () => {
			// Version 2 introduces a new index of books by year.
			db.upgrade.store('books').createIndex('by_year', 'year');
		});
		version(3, async () => {
			// Version 3 introduces a new object store for magazines with two indexes.
			const magazines = db.upgrade.createStore('magazines');
			magazines.createIndex('by_publisher', 'publisher');
			magazines.createIndex('by_frequency', 'frequency');
		});
	});

	// Use the latest defined version number (3 in this case) to open a
	// connection to the "library" database and handle the "upgradeneeded"
	// event if fired.
	await db.latest().upgrade();

	{
		// Look up a single record in the database using an index.

		// Convenience method to access a store.
		const store = db.store('books');
		const index = store.index('by_title');

		const matching = await index.get('Bedrock Nights');

		if (matching != null) {
			console.log(
				'A match was found',
				matching.isbn,
				matching.title,
				matching.author,
			);
		} else {
			console.log('No match found');
		}
	}

	{
		// Look up all matching records with a specific key using an index and cursor.

		const store = db.store('books');
		const index = store.index('by_author');

		for await (const cursor of index.cursor({ only: 'Fred' })) {
			console.log(
				cursor.value.isbn,
				cursor.value.title,
				cursor.value.author,
			);
		}

		console.log('No more matching records');
	}

	{
		// Handle request errors with a Promise-like interface.

		const tx = db.transaction('books', 'readwrite');
		const store = tx.store('books');

		const request = store.put({
			title: 'Water Buffaloes', // Already exists.
			author: 'Slate',
			isbn: 987654,
		});

		await request.catch((error) => {
			console.assert(
				error instanceof DOMException
				&& error.name.includes('ConstraintError'),
			);
			console.error('The uniqueness constraint of the "by_title" index failed.');
		});

		tx.once('abort', () => {
			console.error('Transaction aborted.', tx.error);
		});
	}

	// Close the connection when it is no longer needed.
	db.close();
}

// eslint-disable-next-line test/prefer-lowercase-title
describe('Indexed Database API 3.0 Examples', () => {
	afterEach(async () => await deleteAllDatabases());

	test('example 1', async () => {
		await expect(example1()).resolves.not.toThrow();
	});
});
