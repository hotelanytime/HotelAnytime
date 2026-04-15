const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function loadEnvFromDotEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
  return list[randomInt(0, list.length - 1)];
}

function randomDateWithinLastDays(days) {
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - days);
  const ts = randomInt(start.getTime(), now.getTime());
  return new Date(ts).toISOString().slice(0, 10);
}

async function main() {
  loadEnvFromDotEnv();
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not found. Set it in environment or .env');
  }

  await mongoose.connect(mongoUri, { bufferCommands: false });

  const roomSchema = new mongoose.Schema({}, { strict: false, collection: 'rooms' });
  const paymentSchema = new mongoose.Schema({}, { strict: false, collection: 'financepayments' });
  const expenseSchema = new mongoose.Schema({}, { strict: false, collection: 'financeexpenses' });
  const Room = mongoose.models.SeedRoom || mongoose.model('SeedRoom', roomSchema);
  const FinancePayment = mongoose.models.SeedFinancePayment || mongoose.model('SeedFinancePayment', paymentSchema);
  const FinanceExpense = mongoose.models.SeedFinanceExpense || mongoose.model('SeedFinanceExpense', expenseSchema);

  const rooms = await Room.find({}, { _id: 1, name: 1 }).lean();
  if (!rooms.length) {
    throw new Error('No rooms found. Please create rooms first, then run this script.');
  }

  const paymentModes = ['cash', 'upi', 'card', 'bank', 'other'];
  const categories = ['Food', 'Staff', 'Laundry', 'Supplies', 'Electricity', 'Water', 'Maintenance', 'Internet', 'Transport'];
  const vendors = ['Local Market', 'City Supplier', 'Utility Board', 'Service Partner', 'Quick Services'];
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Ishaan', 'Riya', 'Ananya', 'Kiara', 'Meera', 'Kabir', 'Arjun'];
  const lastNames = ['Sharma', 'Patel', 'Singh', 'Verma', 'Gupta', 'Joshi', 'Kumar', 'Yadav'];

  const totalPayments = 140;
  const totalExpenses = 60;

  const paymentDocs = [];
  for (let i = 0; i < totalPayments; i++) {
    const room = pick(rooms);
    const maybeWalkIn = Math.random() < 0.2;
    const customerName = maybeWalkIn ? '' : `${pick(firstNames)} ${pick(lastNames)}`;
    paymentDocs.push({
      date: randomDateWithinLastDays(90),
      roomId: String(room._id),
      roomName: room.name || 'Room',
      customerName,
      amount: randomInt(700, 4500),
      paymentMode: pick(paymentModes),
      notes: Math.random() < 0.35 ? 'Test seeded payment' : '',
      reference: Math.random() < 0.4 ? `REF-${randomInt(10000, 99999)}` : '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const expenseDocs = [];
  for (let i = 0; i < totalExpenses; i++) {
    expenseDocs.push({
      date: randomDateWithinLastDays(90),
      category: pick(categories),
      amount: randomInt(200, 4000),
      paymentMode: pick(paymentModes),
      notes: Math.random() < 0.35 ? 'Test seeded expense' : '',
      vendor: Math.random() < 0.75 ? pick(vendors) : '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await FinancePayment.insertMany(paymentDocs, { ordered: false });
  await FinanceExpense.insertMany(expenseDocs, { ordered: false });

  console.log(`Seed complete: ${paymentDocs.length} payments + ${expenseDocs.length} expenses = ${paymentDocs.length + expenseDocs.length} entries.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Seed failed:', error.message || error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
