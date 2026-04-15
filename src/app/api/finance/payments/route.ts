import { NextRequest, NextResponse } from 'next/server';
import connectDB, { hasMongoURI } from '@/lib/mongodb';
import { FinancePayment, Room } from '@/models';

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: NextRequest) {
  if (!hasMongoURI) {
    return NextResponse.json({ error: 'Database is required for finance module' }, { status: 503 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const query: Record<string, unknown> = {};
    if (from || to) {
      query.date = {};
      if (from) (query.date as Record<string, string>).$gte = from;
      if (to) (query.date as Record<string, string>).$lte = to;
    }

    const payments = await FinancePayment.find(query).sort({ date: -1, createdAt: -1 });
    return NextResponse.json(payments);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasMongoURI) {
    return NextResponse.json({ error: 'Database is required for finance module' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const date = String(body.date || '').trim();
    const roomId = String(body.roomId || '').trim();
    const customerName = String(body.customerName || '').trim();
    const amount = Number(body.amount);
    const paymentMode = String(body.paymentMode || 'cash').trim();

    if (!isValidDate(date)) {
      return NextResponse.json({ error: 'Invalid date format (YYYY-MM-DD)' }, { status: 400 });
    }
    if (!roomId) {
      return NextResponse.json({ error: 'Room is required' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    await connectDB();
    const room = await Room.findById(roomId).lean();
    if (!room) {
      return NextResponse.json({ error: 'Selected room not found' }, { status: 400 });
    }

    const payment = await FinancePayment.create({
      date,
      roomId,
      roomName: room.name,
      customerName,
      amount,
      paymentMode,
      notes: body.notes || '',
      reference: body.reference || '',
    });

    return NextResponse.json(payment);
  } catch {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
