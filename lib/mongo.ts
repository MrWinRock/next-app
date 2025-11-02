import "server-only";
import { MongoClient, Db, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
    // Fail early with a helpful message during server startup
    console.warn("[mongo] MONGODB_URI is not set. Set it in .env.local");
}
if (!dbName) {
    console.warn("[mongo] DB_NAME is not set. Set it in .env.local");
}

// Cache the client across hot reloads in dev
declare global {
    var _mongoCache: { client: MongoClient | null; promise: Promise<MongoClient> | null } | undefined;
}

const cached: { client: MongoClient | null; promise: Promise<MongoClient> | null } = globalThis._mongoCache || {
    client: null,
    promise: null,
};
globalThis._mongoCache = cached;

export async function getClient(): Promise<MongoClient> {
    if (cached.client) return cached.client;
    if (!cached.promise) {
        if (!uri) throw new Error("MONGODB_URI is not set");
        cached.promise = MongoClient.connect(uri);
    }
    cached.client = await cached.promise;
    return cached.client;
}

export async function getDb(): Promise<Db> {
    const client = await getClient();
    if (!dbName) throw new Error("DB_NAME is not set");
    return client.db(dbName);
}

export type WithIdString<T> = Omit<T, "_id"> & { _id: string };

export function toObjectId(id: string): ObjectId {
    return new ObjectId(id);
}

export function idToString(id: ObjectId | undefined | null): string | undefined {
    return id ? id.toHexString() : undefined;
}
