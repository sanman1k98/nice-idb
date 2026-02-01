/**
 * Returns true if a database with the given name exists.
 */
export async function databaseExists(name: string): Promise<boolean> {
	return indexedDB.databases().then(dbs =>
		dbs.some(db => db.name === name),
	);
}

/**
 * Deletes all IndexedDB databases; will reject if any are blocked.
 */
export async function deleteAllDatabases(
	opts: { signal?: AbortSignal } = {
		signal: AbortSignal.timeout(1500),
	},
): Promise<void> {
	const requests = indexedDB.databases().then(dbs => dbs.map(db =>
		new Promise((resolve, reject) => {
			if (!db.name)
				return resolve(undefined);

			const signal = opts?.signal ?? AbortSignal.timeout(1500);
			const request = indexedDB.deleteDatabase(db.name);

			const handleEvent: EventListener = (event) => {
				signal.removeEventListener('abort', handleEvent);
				request.removeEventListener('error', handleEvent);
				request.removeEventListener('success', handleEvent);
				request.removeEventListener('blocked', handleEvent);

				if (event.type === 'abort')
					return reject(signal.reason);
				if (event.type === 'error')
					return reject(request.error);
				if (event.type === 'success')
					return resolve(request.result);
				if (event.type === 'blocked') {
					return reject(
						new Error(`Blocked from deleting "${db.name}"`, { cause: { event } }),
					);
				}
			};

			const options = { once: true };
			signal.addEventListener('abort', handleEvent, options);
			request.addEventListener('error', handleEvent, options);
			request.addEventListener('success', handleEvent, options);
			request.addEventListener('blocked', handleEvent, options);
		}),
	));

	return requests.then(reqs => void Promise.all(reqs));
}

export async function delay(ms: number): Promise<void> {
	return await new Promise(resolve => setTimeout(resolve, ms));
}
