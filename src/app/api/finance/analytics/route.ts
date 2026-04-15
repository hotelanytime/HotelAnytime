import { NextRequest, NextResponse } from 'next/server';
import connectDB, { hasMongoURI } from '@/lib/mongodb';
import { FinanceExpense, FinancePayment } from '@/models';

interface EntryLike {
  date: string;
  amount: number;
}

export async function GET(request: NextRequest) {
  if (!hasMongoURI) {
    return NextResponse.json({ error: 'Database is required for finance module' }, { status: 503 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';

    const rangeQuery: Record<string, unknown> = {};
    if (from || to) {
      rangeQuery.date = {};
      if (from) (rangeQuery.date as Record<string, string>).$gte = from;
      if (to) (rangeQuery.date as Record<string, string>).$lte = to;
    }

    const [payments, expenses] = await Promise.all([
      FinancePayment.find(rangeQuery).lean(),
      FinanceExpense.find(rangeQuery).lean(),
    ]);

    const totalIncome = payments.reduce((sum: number, p: EntryLike) => sum + (p.amount || 0), 0);
    const totalExpense = expenses.reduce((sum: number, e: EntryLike) => sum + (e.amount || 0), 0);
    const profit = totalIncome - totalExpense;

    const dailyMap = new Map<string, { income: number; expense: number }>();
    for (const p of payments as Array<{ date: string; amount: number }>) {
      const row = dailyMap.get(p.date) || { income: 0, expense: 0 };
      row.income += p.amount || 0;
      dailyMap.set(p.date, row);
    }
    for (const e of expenses as Array<{ date: string; amount: number }>) {
      const row = dailyMap.get(e.date) || { income: 0, expense: 0 };
      row.expense += e.amount || 0;
      dailyMap.set(e.date, row);
    }
    const daily = [...dailyMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, row]) => ({ date, income: row.income, expense: row.expense, profit: row.income - row.expense }));

    const roomMap = new Map<string, number>();
    for (const p of payments as Array<{ roomName?: string; amount: number }>) {
      const key = p.roomName || 'Unknown Room';
      roomMap.set(key, (roomMap.get(key) || 0) + (p.amount || 0));
    }
    const roomRevenue = [...roomMap.entries()]
      .map(([roomName, amount]) => ({ roomName, amount }))
      .sort((a, b) => b.amount - a.amount);

    const modeMap = new Map<string, number>();
    for (const p of payments as Array<{ paymentMode?: string; amount: number }>) {
      const key = p.paymentMode || 'other';
      modeMap.set(key, (modeMap.get(key) || 0) + (p.amount || 0));
    }
    const paymentModes = [...modeMap.entries()]
      .map(([mode, amount]) => ({ mode, amount }))
      .sort((a, b) => b.amount - a.amount);

    const categoryMap = new Map<string, number>();
    for (const e of expenses as Array<{ category?: string; amount: number }>) {
      const key = e.category || 'Other';
      categoryMap.set(key, (categoryMap.get(key) || 0) + (e.amount || 0));
    }
    const expenseCategories = [...categoryMap.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpense,
        profit,
        paymentCount: payments.length,
        expenseCount: expenses.length,
      },
      daily,
      roomRevenue,
      paymentModes,
      expenseCategories,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 });
  }
}
