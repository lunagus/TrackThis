import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { UserDecision } from '../types/media';

interface TrackThisDB extends DBSchema {
  decisions: {
    key: string;
    value: UserDecision;
    indexes: {
      'by-mediaType': string;
      'by-status': string;
      'by-decidedAt': string;
    };
  };
  metadata: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'trackthis_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TrackThisDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<TrackThisDB>> {
  if (!dbPromise) {
    dbPromise = openDB<TrackThisDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('decisions')) {
          const store = db.createObjectStore('decisions', { keyPath: 'mediaId' });
          store.createIndex('by-mediaType', 'mediaType');
          store.createIndex('by-status', 'status');
          store.createIndex('by-decidedAt', 'decidedAt');
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata');
        }
      },
    });
  }
  return dbPromise;
}

export async function dbSaveDecision(decision: UserDecision): Promise<void> {
  const db = await getDB();
  await db.put('decisions', decision);
}

export async function dbSaveDecisionsBatch(decisions: UserDecision[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('decisions', 'readwrite');
  await Promise.all([
    ...decisions.map(d => tx.store.put(d)),
    tx.done
  ]);
}

export async function dbDeleteDecision(mediaId: string): Promise<void> {
  const db = await getDB();
  await db.delete('decisions', mediaId);
}

export async function dbGetAllDecisions(): Promise<Record<string, UserDecision>> {
  const db = await getDB();
  const all = await db.getAll('decisions');
  const record: Record<string, UserDecision> = {};
  for (const item of all) {
    record[item.mediaId] = item;
  }
  return record;
}

export async function dbClearAllDecisions(): Promise<void> {
  const db = await getDB();
  await db.clear('decisions');
}

export async function dbSaveMetadata(key: string, value: any): Promise<void> {
  const db = await getDB();
  await db.put('metadata', value, key);
}

export async function dbGetMetadata<T = any>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return db.get('metadata', key);
}
