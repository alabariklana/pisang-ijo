import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'pisangijo';

let client;
let db;
async function connect() {
  if (!MONGO_URL) throw new Error('MONGO_URL not set');
  if (!client) {
    client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    db = client.db(DB_NAME);
  }
  return db;
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const db = await connect();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
    const item = await db.collection('products').findOne(query);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (err) {
    console.error('GET /api/products/[id] error', err);
    return NextResponse.json({ error: 'Server error', detail: err?.message ?? null }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const db = await connect();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
    const res = await db.collection('products').deleteOne(query);
    if (res.deletedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/products/[id] error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}