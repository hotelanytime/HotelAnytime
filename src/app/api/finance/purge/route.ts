import { NextRequest, NextResponse } from 'next/server';
import connectDB, { hasMongoURI } from '@/lib/mongodb';
import { FinanceExpense, FinancePayment } from '@/models';

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: NextRequest) {
  if (!hasMongoURI) {
    return NextResponse.json({ error: 'Database is required for finance module' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const from = String(body.from || '').trim();
    const to = String(body.to || '').trim();
    const confirmText = String(body.confirmText || '').trim();

    if (!isValidDate(from) || !isValidDate(to)) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
    }
    if (confirmText !== 'DELETE') {
      return NextResponse.json({ error: 'Invalid delete confirmation text' }, { status: 400 });
    }

    await connectDB();
    const query = { date: { $gte: from, $lte: to } };
    const [paymentsResult, expensesResult] = await Promise.all([
      FinancePayment.deleteMany(query),
      FinanceExpense.deleteMany(query),
    ]);

    return NextResponse.json({
      success: true,
      deletedPayments: paymentsResult.deletedCount || 0,
      deletedExpenses: expensesResult.deletedCount || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to purge finance data' }, { status: 500 });
  }
}
