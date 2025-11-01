import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

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
    console.log('Connected to MongoDB (statistics)');
  }
  return db;
}

export async function GET() {
  try {
    if (!MONGO_URL) {
      // fallback sample data when Mongo not configured
      return NextResponse.json({
        ordersCount: 0,
        productsCount: 0,
        totalRevenue: 0,
      });
    }

    const db = await connect();
    const ordersColl = db.collection('orders');
    const productsColl = db.collection('products');

    const [ordersCount, productsCount, revenueAgg] = await Promise.all([
      ordersColl.countDocuments(),
      productsColl.countDocuments(),
      ordersColl.aggregate([
        { $group: { _id: null, total: { $sum: { $ifNull: ['$totalAmount', 0] } } } }
      ]).toArray()
    ]);

    const totalRevenue = (revenueAgg[0]?.total) ? revenueAgg[0].total : 0;

    return NextResponse.json({
      ordersCount,
      productsCount,
      totalRevenue
    });
  } catch (err) {
    console.error('GET /api/statistics error', err);
    return NextResponse.json({ error: 'Gagal memuat statistik' }, { status: 500 });
  }
}