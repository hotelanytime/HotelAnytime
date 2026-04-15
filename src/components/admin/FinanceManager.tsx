"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { FinanceAnalytics, FinanceExpense, FinancePayment, Room } from '@/types';
import { CalendarDays, Download, DollarSign, Plus, Save, Trash2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCsrfToken } from '@/lib/csrf';

interface Props {
  rooms: Room[];
}

type PaymentMode = 'cash' | 'upi' | 'card' | 'bank' | 'other';

interface PaymentForm {
  _id?: string;
  date: string;
  roomId: string;
  customerName: string;
  amount: number;
  paymentMode: PaymentMode;
  notes: string;
  reference: string;
}

interface ExpenseForm {
  _id?: string;
  date: string;
  category: string;
  amount: number;
  paymentMode: PaymentMode;
  notes: string;
  vendor: string;
}

const paymentModes: PaymentMode[] = ['cash', 'upi', 'card', 'bank', 'other'];

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function formatCurrency(amount: number) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

const FINANCE_LAST_RANGE_KEY = 'finance:lastRange';
const FINANCE_LAST_SNAPSHOT_KEY = 'finance:lastSnapshot';

export default function FinanceManager({ rooms }: Props) {
  const [fromDate, setFromDate] = useState(firstDayOfMonth());
  const [toDate, setToDate] = useState(todayDate());
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [expenses, setExpenses] = useState<FinanceExpense[]>([]);
  const [analytics, setAnalytics] = useState<FinanceAnalytics | null>(null);
  const [purging, setPurging] = useState(false);
  const cacheRef = useRef(new Map<string, { payments: FinancePayment[]; expenses: FinanceExpense[]; analytics: FinanceAnalytics | null }>());
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    date: todayDate(),
    roomId: '',
    customerName: '',
    amount: 0,
    paymentMode: 'cash',
    notes: '',
    reference: '',
  });
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
    date: todayDate(),
    category: '',
    amount: 0,
    paymentMode: 'cash',
    notes: '',
    vendor: '',
  });

  const roomOptions = useMemo(
    () => rooms.filter((room) => room._id).map((room) => ({ id: room._id as string, name: room.name })),
    [rooms]
  );

  const applyQuickRange = (days: number) => {
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    const fromDateValue = new Date(now);
    fromDateValue.setDate(now.getDate() - days + 1);
    const from = fromDateValue.toISOString().slice(0, 10);
    setFromDate(from);
    setToDate(to);
    loadData(from, to);
  };

  const toCsvCell = (value: string | number) => {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  };

  const asDateText = (value: string) => `'${value}`;

  const exportCsv = () => {
    const rows: string[] = [];
    rows.push('Report,Value');
    rows.push([toCsvCell('From'), toCsvCell(asDateText(fromDate))].join(','));
    rows.push([toCsvCell('To'), toCsvCell(asDateText(toDate))].join(','));
    rows.push('');
    rows.push('Summary,Amount');
    rows.push([toCsvCell('Total Income'), toCsvCell(analytics?.summary.totalIncome || 0)].join(','));
    rows.push([toCsvCell('Total Expense'), toCsvCell(analytics?.summary.totalExpense || 0)].join(','));
    rows.push([toCsvCell('Profit'), toCsvCell(analytics?.summary.profit || 0)].join(','));
    rows.push([toCsvCell('Payment Count'), toCsvCell(analytics?.summary.paymentCount || 0)].join(','));
    rows.push([toCsvCell('Expense Count'), toCsvCell(analytics?.summary.expenseCount || 0)].join(','));
    rows.push('');
    rows.push('Daily Analytics');
    rows.push('Date,Income,Expense,Profit');
    (analytics?.daily || []).forEach((d) => {
      rows.push(
        [
          asDateText(d.date),
          d.income,
          d.expense,
          d.profit,
        ].map(toCsvCell).join(',')
      );
    });
    rows.push('');
    rows.push('Room Revenue');
    rows.push('Room,Amount');
    (analytics?.roomRevenue || []).forEach((r) => {
      rows.push([r.roomName, r.amount].map(toCsvCell).join(','));
    });
    rows.push('');
    rows.push('Payment Modes');
    rows.push('Mode,Amount');
    (analytics?.paymentModes || []).forEach((m) => {
      rows.push([m.mode, m.amount].map(toCsvCell).join(','));
    });
    rows.push('');
    rows.push('Expense Categories');
    rows.push('Category,Amount');
    (analytics?.expenseCategories || []).forEach((c) => {
      rows.push([c.category, c.amount].map(toCsvCell).join(','));
    });
    rows.push('');
    rows.push('Entries');
    rows.push('Type,Date,Room,Customer,Category,Amount,PaymentMode,Reference,Vendor,Notes');
    payments.forEach((p) => {
      rows.push(
        [
          'Payment',
          asDateText(p.date),
          p.roomName || '',
          p.customerName || 'Walk-in',
          '',
          p.amount,
          p.paymentMode || '',
          p.reference || '',
          '',
          p.notes || '',
        ].map(toCsvCell).join(',')
      );
    });
    expenses.forEach((e) => {
      rows.push(
        [
          'Expense',
          asDateText(e.date),
          '',
          '',
          e.category || '',
          e.amount,
          e.paymentMode || '',
          '',
          e.vendor || '',
          e.notes || '',
        ].map(toCsvCell).join(',')
      );
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance_${fromDate}_to_${toDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported (open in Google Sheets)');
  };

  const loadData = async (from = fromDate, to = toDate, forceRefresh = false) => {
    const cacheKey = `${from}|${to}`;
    if (!forceRefresh) {
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setPayments(cached.payments);
        setExpenses(cached.expenses);
        setAnalytics(cached.analytics);
        return;
      }
    }

    setLoading(true);
    try {
      const query = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const [paymentsRes, expensesRes, analyticsRes] = await Promise.all([
        fetch(`/api/finance/payments?${query}`),
        fetch(`/api/finance/expenses?${query}`),
        fetch(`/api/finance/analytics?${query}`),
      ]);

      if (!paymentsRes.ok || !expensesRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to load finance data');
      }

      const [paymentsData, expensesData, analyticsData] = await Promise.all([
        paymentsRes.json(),
        expensesRes.json(),
        analyticsRes.json(),
      ]);
      setPayments(paymentsData);
      setExpenses(expensesData);
      setAnalytics(analyticsData);
      cacheRef.current.set(cacheKey, {
        payments: paymentsData,
        expenses: expensesData,
        analytics: analyticsData,
      });
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(FINANCE_LAST_RANGE_KEY, JSON.stringify({ from, to }));
        window.sessionStorage.setItem(
          FINANCE_LAST_SNAPSHOT_KEY,
          JSON.stringify({ key: cacheKey, payments: paymentsData, expenses: expensesData, analytics: analyticsData })
        );
      }
    } catch {
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastRangeRaw = window.sessionStorage.getItem(FINANCE_LAST_RANGE_KEY);
      if (lastRangeRaw) {
        try {
          const parsed = JSON.parse(lastRangeRaw) as { from?: string; to?: string };
          if (parsed.from && parsed.to) {
            setFromDate(parsed.from);
            setToDate(parsed.to);
            const key = `${parsed.from}|${parsed.to}`;
            const snapshotRaw = window.sessionStorage.getItem(FINANCE_LAST_SNAPSHOT_KEY);
            if (snapshotRaw) {
              const snapshot = JSON.parse(snapshotRaw) as {
                key?: string;
                payments?: FinancePayment[];
                expenses?: FinanceExpense[];
                analytics?: FinanceAnalytics;
              };
              if (snapshot.key === key && snapshot.payments && snapshot.expenses) {
                setPayments(snapshot.payments);
                setExpenses(snapshot.expenses);
                setAnalytics(snapshot.analytics || null);
                cacheRef.current.set(key, {
                  payments: snapshot.payments,
                  expenses: snapshot.expenses,
                  analytics: snapshot.analytics || null,
                });
                return;
              }
            }
            loadData(parsed.from, parsed.to);
            return;
          }
        } catch {
          // ignore broken cache data
        }
      }
    }
    loadData(fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savePayment = async () => {
    if (!paymentForm.roomId || paymentForm.amount <= 0) {
      toast.error('Fill payment date, room, and valid amount');
      return;
    }

    try {
      const csrfToken = await getCsrfToken();
      const method = paymentForm._id ? 'PUT' : 'POST';
      const url = paymentForm._id ? `/api/finance/payments/${paymentForm._id}` : '/api/finance/payments';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify(paymentForm),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Save failed');
      }
      toast.success(paymentForm._id ? 'Payment updated' : 'Payment added');
      setPaymentForm({
        date: todayDate(),
        roomId: '',
        customerName: '',
        amount: 0,
        paymentMode: 'cash',
        notes: '',
        reference: '',
      });
      loadData(fromDate, toDate, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save failed';
      toast.error(message);
    }
  };

  const saveExpense = async () => {
    if (!expenseForm.category.trim() || expenseForm.amount <= 0) {
      toast.error('Fill expense date, category, and valid amount');
      return;
    }

    try {
      const csrfToken = await getCsrfToken();
      const method = expenseForm._id ? 'PUT' : 'POST';
      const url = expenseForm._id ? `/api/finance/expenses/${expenseForm._id}` : '/api/finance/expenses';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify(expenseForm),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Save failed');
      }
      toast.success(expenseForm._id ? 'Expense updated' : 'Expense added');
      setExpenseForm({
        date: todayDate(),
        category: '',
        amount: 0,
        paymentMode: 'cash',
        notes: '',
        vendor: '',
      });
      loadData(fromDate, toDate, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save failed';
      toast.error(message);
    }
  };

  const deletePayment = async (id?: string) => {
    if (!id || !confirm('Delete this payment entry?')) return;
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/finance/payments/${id}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': csrfToken },
      });
      if (!res.ok) throw new Error();
      toast.success('Payment deleted');
      loadData(fromDate, toDate, true);
    } catch {
      toast.error('Failed to delete payment');
    }
  };

  const deleteExpense = async (id?: string) => {
    if (!id || !confirm('Delete this expense entry?')) return;
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/finance/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': csrfToken },
      });
      if (!res.ok) throw new Error();
      toast.success('Expense deleted');
      loadData(fromDate, toDate, true);
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  const purgeByDateRange = async () => {
    const typed = window.prompt('Type DELETE to continue purge for selected date range');
    if (typed !== 'DELETE') {
      toast.error('Purge cancelled: confirmation text mismatch');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete all finance entries from ${fromDate} to ${toDate}?`)) return;
    if (!window.confirm('Final confirmation: This cannot be undone. Continue delete?')) return;

    try {
      setPurging(true);
      const csrfToken = await getCsrfToken();
      const res = await fetch('/api/finance/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ from: fromDate, to: toDate, confirmText: 'DELETE' }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Purge failed');
      }
      const result = await res.json();
      toast.success(`Deleted ${result.deletedPayments || 0} payments and ${result.deletedExpenses || 0} expenses`);
      loadData(fromDate, toDate, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Purge failed';
      toast.error(message);
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div className="bg-gradient-to-r from-orange-50 to-white border border-orange-100 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-orange-600" />
              Finance Dashboard
            </h2>
            <p className="text-sm text-gray-700 mt-1">Track payments, expenses, and profit with room-wise analytics.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => applyQuickRange(1)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Today</button>
            <button onClick={() => applyQuickRange(7)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Last 7 Days</button>
            <button onClick={() => applyQuickRange(30)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Last 30 Days</button>
            <button
              onClick={() => {
                const from = firstDayOfMonth();
                const to = todayDate();
                setFromDate(from);
                setToDate(to);
                loadData(from, to);
              }}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
            >
              This Month
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 border rounded-lg text-gray-900 bg-white"
          />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 border rounded-lg text-gray-900 bg-white"
          />
          </div>
          <button
            onClick={() => loadData(fromDate, toDate, true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 inline-flex items-center gap-2"
            disabled={loading}
          >
            <CalendarDays className="w-4 h-4" />
            {loading ? 'Loading...' : 'Refresh Analytics'}
          </button>
          <button
            onClick={exportCsv}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={purgeByDateRange}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
            disabled={purging}
          >
            <Trash2 className="w-4 h-4" />
            {purging ? 'Deleting...' : 'Delete Range'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-700">Income</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(analytics?.summary.totalIncome || 0)}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-700">Expense</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(analytics?.summary.totalExpense || 0)}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-700">Profit</p>
          <p className={`text-xl font-bold ${(analytics?.summary.profit || 0) >= 0 ? 'text-gray-900' : 'text-red-700'}`}>
            {formatCurrency(analytics?.summary.profit || 0)}
          </p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-700">Payments</p>
          <p className="text-xl font-bold text-gray-900">{analytics?.summary.paymentCount || 0}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-700">Expenses</p>
          <p className="text-xl font-bold text-gray-900">{analytics?.summary.expenseCount || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="border rounded-xl p-4 space-y-3 bg-white shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Customer Payment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm((p) => ({ ...p, date: e.target.value }))} className="px-3 py-2 border rounded text-gray-900 bg-white" />
            <select value={paymentForm.roomId} onChange={(e) => setPaymentForm((p) => ({ ...p, roomId: e.target.value }))} className="px-3 py-2 border rounded text-gray-900 bg-white">
              <option value="">Select room</option>
              {roomOptions.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
            <input value={paymentForm.customerName} onChange={(e) => setPaymentForm((p) => ({ ...p, customerName: e.target.value }))} placeholder="Customer name (optional)" className="px-3 py-2 border rounded text-gray-900 bg-white placeholder:text-gray-400" />
            <input type="number" min="0" value={paymentForm.amount || ''} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: Number(e.target.value) }))} placeholder="Amount" className="px-3 py-2 border rounded text-gray-900 bg-white placeholder:text-gray-400" />
            <select value={paymentForm.paymentMode} onChange={(e) => setPaymentForm((p) => ({ ...p, paymentMode: e.target.value as PaymentMode }))} className="px-3 py-2 border rounded text-gray-900 bg-white">
              {paymentModes.map((mode) => (
                <option key={mode} value={mode}>{mode.toUpperCase()}</option>
              ))}
            </select>
            <input value={paymentForm.reference} onChange={(e) => setPaymentForm((p) => ({ ...p, reference: e.target.value }))} placeholder="Reference (optional)" className="px-3 py-2 border rounded text-gray-900 bg-white placeholder:text-gray-400" />
          </div>
          <textarea value={paymentForm.notes} onChange={(e) => setPaymentForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" rows={2} className="w-full px-3 py-2 border rounded text-gray-900 bg-white placeholder:text-gray-400" />
          <div className="flex gap-2">
            <button onClick={savePayment} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2">
              <Save className="w-4 h-4" /> {paymentForm._id ? 'Update Payment' : 'Add Payment'}
            </button>
            {paymentForm._id && (
              <button
                onClick={() => setPaymentForm({
                  date: todayDate(),
                  roomId: '',
                  customerName: '',
                  amount: 0,
                  paymentMode: 'cash',
                  notes: '',
                  reference: '',
                })}
                className="px-4 py-2 border rounded"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        <div className="border rounded-xl p-4 space-y-3 bg-white shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Daily Expense
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm((p) => ({ ...p, date: e.target.value }))} className="px-3 py-2 border rounded text-gray-900 bg-white" />
            <input value={expenseForm.category} onChange={(e) => setExpenseForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category (Food, Staff, etc.)" className="px-3 py-2 border rounded text-gray-900 bg-white placeholder:text-gray-400" />
            <input type="number" min="0" value={expenseForm.amount || ''} onChange={(e) => setExpenseForm((p) => ({ ...p, amount: Number(e.target.value) }))} placeholder="Amount" className="px-3 py-2 border rounded text-gray-900 bg-white placeholder:text-gray-400" />
            <select value={expenseForm.paymentMode} onChange={(e) => setExpenseForm((p) => ({ ...p, paymentMode: e.target.value as PaymentMode }))} className="px-3 py-2 border rounded text-gray-900 bg-white">
              {paymentModes.map((mode) => (
                <option key={mode} value={mode}>{mode.toUpperCase()}</option>
              ))}
            </select>
            <input value={expenseForm.vendor} onChange={(e) => setExpenseForm((p) => ({ ...p, vendor: e.target.value }))} placeholder="Vendor (optional)" className="px-3 py-2 border rounded text-gray-900 bg-white placeholder:text-gray-400" />
          </div>
          <textarea value={expenseForm.notes} onChange={(e) => setExpenseForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" rows={2} className="w-full px-3 py-2 border rounded text-gray-900 bg-white placeholder:text-gray-400" />
          <div className="flex gap-2">
            <button onClick={saveExpense} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2">
              <Save className="w-4 h-4" /> {expenseForm._id ? 'Update Expense' : 'Add Expense'}
            </button>
            {expenseForm._id && (
              <button
                onClick={() => setExpenseForm({
                  date: todayDate(),
                  category: '',
                  amount: 0,
                  paymentMode: 'cash',
                  notes: '',
                  vendor: '',
                })}
                className="px-4 py-2 border rounded"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Customer Payments ({payments.length})</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {payments.map((p) => (
              <div key={p._id} className="border rounded-lg p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{p.customerName || 'Walk-in'} · {p.roomName}</p>
                  <p className="text-xs text-gray-700">{p.date} · {String(p.paymentMode).toUpperCase()} {p.reference ? `· ${p.reference}` : ''}</p>
                  {p.notes ? <p className="text-xs text-gray-700 truncate">{p.notes}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600">{formatCurrency(p.amount)}</span>
                  <button
                    onClick={() => setPaymentForm({
                      _id: p._id,
                      date: p.date,
                      roomId: p.roomId,
                      customerName: p.customerName,
                      amount: p.amount,
                      paymentMode: p.paymentMode,
                      notes: p.notes || '',
                      reference: p.reference || '',
                    })}
                    className="text-xs px-2 py-1 border rounded"
                  >
                    Edit
                  </button>
                  <button onClick={() => deletePayment(p._id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {payments.length === 0 && <p className="text-sm text-gray-700 border border-dashed rounded-lg p-4">No payments in selected range.</p>}
          </div>
        </div>

        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Daily Expenses ({expenses.length})</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {expenses.map((e) => (
              <div key={e._id} className="border rounded-lg p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{e.category}</p>
                  <p className="text-xs text-gray-700">{e.date} · {String(e.paymentMode).toUpperCase()} {e.vendor ? `· ${e.vendor}` : ''}</p>
                  {e.notes ? <p className="text-xs text-gray-700 truncate">{e.notes}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-red-600">{formatCurrency(e.amount)}</span>
                  <button
                    onClick={() => setExpenseForm({
                      _id: e._id,
                      date: e.date,
                      category: e.category,
                      amount: e.amount,
                      paymentMode: e.paymentMode,
                      notes: e.notes || '',
                      vendor: e.vendor || '',
                    })}
                    className="text-xs px-2 py-1 border rounded"
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteExpense(e._id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && <p className="text-sm text-gray-700 border border-dashed rounded-lg p-4">No expenses in selected range.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Daily Profit</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {(analytics?.daily || []).map((d) => (
              <div key={d.date} className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                <span className="text-gray-700">{d.date}</span>
                <span className="text-green-600">{formatCurrency(d.income)}</span>
                <span className="text-red-600">{formatCurrency(d.expense)}</span>
                <span className={d.profit >= 0 ? 'text-gray-900 font-medium' : 'text-red-700 font-medium'}>{formatCurrency(d.profit)}</span>
              </div>
            ))}
            {(analytics?.daily || []).length === 0 && <p className="text-sm text-gray-700 border border-dashed rounded-lg p-4">No daily data.</p>}
          </div>
        </div>
        <div className="border rounded-xl p-4 grid grid-cols-1 gap-4 bg-white shadow-sm">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Room-wise Revenue</h3>
            <div className="space-y-1">
              {(analytics?.roomRevenue || []).slice(0, 6).map((r) => (
                <div key={r.roomName} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{r.roomName}</span>
                  <span className="font-medium">{formatCurrency(r.amount)}</span>
                </div>
              ))}
              {(analytics?.roomRevenue || []).length === 0 && <p className="text-sm text-gray-700">No room revenue data.</p>}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Payment Modes</h3>
            <div className="space-y-1">
              {(analytics?.paymentModes || []).map((m) => (
                <div key={m.mode} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{m.mode.toUpperCase()}</span>
                  <span className="font-medium">{formatCurrency(m.amount)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Expense Categories</h3>
            <div className="space-y-1">
              {(analytics?.expenseCategories || []).slice(0, 6).map((c) => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{c.category}</span>
                  <span className="font-medium">{formatCurrency(c.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
