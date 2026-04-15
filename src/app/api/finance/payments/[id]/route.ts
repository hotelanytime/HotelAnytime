import { NextRequest, NextResponse } from 'next/server';
import connectDB, { hasMongoURI } from '@/lib/mongodb';
import { FinancePayment, Room } from '@/models';

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasMongoURI) {
    return NextResponse.json({ error: 'Database is required for finance module' }, { status: 503 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const date = String(body.date || '').trim();
    const roomId = String(body.roomId || '').trim();
    const customerName = String(body.customerName || '').trim();
    const amount = Number(body.amount);

    if (!isValidDate(date)) return NextResponse.json({ error: 'Invalid date format (YYYY-MM-DD)' }, { status: 400 });
    if (!roomId) return NextResponse.json({ error: 'Room is required' }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });

    await connectDB();
    const room = await Room.findById(roomId).lean();
    if (!room) return NextResponse.json({ error: 'Selected room not found' }, { status: 400 });

    const updated = await FinancePayment.findByIdAndUpdate(
      id,
      {
        date,
        roomId,
        roomName: room.name,
        customerName,
        amount,
        paymentMode: body.paymentMode || 'cash',
        notes: body.notes || '',
        reference: body.reference || '',
      },
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasMongoURI) {
    return NextResponse.json({ error: 'Database is required for finance module' }, { status: 503 });
  }

  try {
    const { id } = await params;
    await connectDB();
    const deleted = await FinancePayment.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
