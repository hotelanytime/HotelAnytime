import { NextRequest, NextResponse } from 'next/server';
import connectDB, { hasMongoURI } from '@/lib/mongodb';
import { FinanceExpense } from '@/models';

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

    const expenses = await FinanceExpense.find(query).sort({ date: -1, createdAt: -1 });
    return NextResponse.json(expenses);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasMongoURI) {
    return NextResponse.json({ error: 'Database is required for finance module' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const date = String(body.date || '').trim();
    const category = String(body.category || '').trim();
    const amount = Number(body.amount);

    if (!isValidDate(date)) {
      return NextResponse.json({ error: 'Invalid date format (YYYY-MM-DD)' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    await connectDB();
    const expense = await FinanceExpense.create({
      date,
      category,
      amount,
      paymentMode: body.paymentMode || 'cash',
      notes: body.notes || '',
      vendor: body.vendor || '',
    });

    return NextResponse.json(expense);
  } catch {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
