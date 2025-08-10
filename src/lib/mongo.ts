import { MongoClient, Collection, Document } from "mongodb";

type GlobalWithMongo = typeof globalThis & {
  __mongoClientPromise?: Promise<MongoClient>;
};

const globalWithMongo = global as GlobalWithMongo;

export async function getMongoCollection<T extends Document = Document>(name?: string): Promise<Collection<T> | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (!globalWithMongo.__mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });
    globalWithMongo.__mongoClientPromise = client.connect();
  }

  const client = await globalWithMongo.__mongoClientPromise;
  const dbName = process.env.MONGODB_DB || "salle_de_jeuxx-database-database";
  const collName = name || process.env.MONGODB_COLLECTION || "states";
  return client.db(dbName).collection<T>(collName);
}
