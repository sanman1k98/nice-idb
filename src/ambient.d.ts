declare namespace NiceIDB {
	export type Database = import('#internal').Database;
	export type Transaction = import('#internal').Transaction;
	export type ObjectStore = import('#internal').ObjectStore;
	export type Index = import('#internal').Index;
}

declare interface NiceIDBDatabase extends NiceIDB.Database { };
