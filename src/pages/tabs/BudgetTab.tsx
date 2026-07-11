// src/pages/tabs/BudgetTab.tsx
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, RefreshCw, Sparkles, ArrowLeftRight } from 'lucide-react';
import type { Trip, Expense } from '../../types';
import { BudgetMeter } from '../../components/BudgetMeter';

interface BudgetTabProps {
  trip: Trip;
  expenses: Expense[];
  onAddExpense: (amount: number, category: string, note: string) => void;
  onDeleteExpense: (expenseId: string) => void;
}

// Mock exchange rates (relative to USD)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, AUD: 1.53,
  CAD: 1.36, CHF: 0.89, INR: 83.2, SGD: 1.34, THB: 35.6,
  MXN: 17.2, NZD: 1.63, KRW: 1320, BRL: 4.97, AED: 3.67
};

const CURRENCIES = Object.keys(EXCHANGE_RATES);

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F97316',
  Flights: '#3730A3',
  Accommodation: '#7C3AED',
  Transport: '#0EA5E9',
  Activities: '#10B981',
  Shopping: '#EC4899',
  Emergency: '#EF4444',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Food: '🍜', Flights: '✈️', Accommodation: '🏨',
  Transport: '🚌', Activities: '🎭', Shopping: '🛍️', Emergency: '🚨',
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

function convertCurrency(amount: number, from: string, to: string): number {
  const fromRate = EXCHANGE_RATES[from] || 1;
  const toRate = EXCHANGE_RATES[to] || 1;
  return (amount / fromRate) * toRate;
}

// Simple bar chart component
const CategoryBarChart: React.FC<{ expenses: Expense[]; currency: string }> = ({ expenses, currency }) => {
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach(exp => {
      const amt = convertCurrency(exp.amount, exp.currency || currency, currency);
      totals[exp.category] = (totals[exp.category] || 0) + amt;
    });
    return Object.entries(totals).sort(([, a], [, b]) => b - a);
  }, [expenses, currency]);

  const maxVal = Math.max(...categoryTotals.map(([, v]) => v), 1);

  if (categoryTotals.length === 0) {
    return (
      <div className="py-8 text-center text-brand-muted text-xs">
        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-brand-muted/30" />
        No expenses logged yet
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {categoryTotals.map(([cat, total]) => (
        <div key={cat} className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-brand-dark">
              <span>{CATEGORY_EMOJIS[cat] || '💸'}</span> {cat}
            </span>
            <span className="font-mono font-bold text-brand-dark">{currency} {total.toFixed(2)}</span>
          </div>
          <div className="h-2 bg-brand-bg rounded-full overflow-hidden border border-brand-muted/10">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(total / maxVal) * 100}%`,
                backgroundColor: CATEGORY_COLORS[cat] || '#78716C',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const BudgetTab: React.FC<BudgetTabProps> = ({
  trip,
  expenses,
  onAddExpense,
  onDeleteExpense,
}) => {
  const tripCurrency = (trip.budget as any)?.currency || trip.currency || 'USD';
  const tripBudgetAmount = (trip.budget as any)?.amount || 0;

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [entryCurrency, setEntryCurrency] = useState(tripCurrency);
  const [viewCurrency, setViewCurrency] = useState(tripCurrency);
  const [converterFrom, setConverterFrom] = useState(tripCurrency);
  const [converterTo, setConverterTo] = useState('JPY');
  const [converterAmount, setConverterAmount] = useState('100');
  const [showConverter, setShowConverter] = useState(false);

  const totalSpentInTripCurrency = useMemo(() =>
    expenses.reduce((acc, exp) => {
      return acc + convertCurrency(exp.amount, exp.currency || tripCurrency, tripCurrency);
    }, 0),
    [expenses, tripCurrency]
  );

  const convertedAmount = useMemo(() => {
    const val = parseFloat(converterAmount);
    if (isNaN(val)) return '—';
    return convertCurrency(val, converterFrom, converterTo).toFixed(2);
  }, [converterAmount, converterFrom, converterTo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    // Convert to trip currency before saving
    const inTripCurrency = convertCurrency(parsedAmount, entryCurrency, tripCurrency);
    onAddExpense(inTripCurrency, category, note.trim() || category);
    setAmount('');
    setNote('');
  };

  const dailyAvg = expenses.length > 0
    ? (totalSpentInTripCurrency / Math.max(1, trip.itinerary?.length || 5)).toFixed(2)
    : '0.00';

  const remainingBudget = tripBudgetAmount - totalSpentInTripCurrency;
  const daysLeft = Math.max(1, trip.itinerary?.length || 5);
  const dailySafeSpend = (remainingBudget / daysLeft).toFixed(2);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Spent', value: `${tripCurrency} ${totalSpentInTripCurrency.toFixed(2)}`, sub: 'All categories', color: 'text-brand-dark' },
          { label: 'Remaining', value: `${tripCurrency} ${Math.max(0, remainingBudget).toFixed(2)}`, sub: 'Budget left', color: remainingBudget < 0 ? 'text-red-600' : 'text-emerald-600' },
          { label: 'Daily Average', value: `${tripCurrency} ${dailyAvg}`, sub: 'Per day so far', color: 'text-brand-dark' },
          { label: 'Safe to Spend', value: `${tripCurrency} ${parseFloat(dailySafeSpend) > 0 ? dailySafeSpend : '0.00'}`, sub: `Per day remaining`, color: 'text-brand-primary' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-brand-muted/10 rounded-card p-3.5 shadow-sm">
            <p className="text-[9px] font-bold text-brand-muted uppercase tracking-wider">{stat.label}</p>
            <p className={`text-sm font-black mt-1 ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-brand-muted mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: logger + logs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Add expense form */}
          <div className="bg-white border border-brand-muted/10 p-5 rounded-card shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-brand-primary" />
              Log Trip Expense
            </h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  step="0.01"
                  className="bg-brand-bg px-2.5 py-1.5 text-xs text-brand-dark font-medium border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary/50"
                />
                <select
                  value={entryCurrency}
                  onChange={(e) => setEntryCurrency(e.target.value)}
                  className="bg-brand-bg px-2.5 py-1.5 text-xs text-brand-dark font-bold border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary/50"
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-brand-bg px-2.5 py-1.5 text-xs text-brand-dark font-bold border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary/50"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
                </select>
                <button
                  type="submit"
                  className="bg-brand-primary text-white font-bold py-1.5 px-3 rounded-btn text-xs hover:bg-brand-primary/95 transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Log
                </button>
              </div>
              <input
                type="text"
                placeholder="Note (e.g. Tonkotsu ramen, Gion district)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-brand-bg px-2.5 py-1.5 text-xs text-brand-dark font-medium border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary/50"
              />
              {entryCurrency !== tripCurrency && amount && !isNaN(parseFloat(amount)) && (
                <p className="text-[10px] text-brand-muted">
                  ≈ {tripCurrency} {convertCurrency(parseFloat(amount), entryCurrency, tripCurrency).toFixed(2)} will be recorded
                </p>
              )}
            </form>
          </div>

          {/* Expense list */}
          <div className="bg-white border border-brand-muted/10 rounded-card p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">Expense History</h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-brand-muted">View in</span>
                <select
                  value={viewCurrency}
                  onChange={(e) => setViewCurrency(e.target.value)}
                  className="text-[10px] font-bold text-brand-primary bg-transparent border-none cursor-pointer"
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {expenses.length === 0 ? (
                <p className="text-xs text-brand-muted py-6 text-center">No expenses logged. Add your first item above.</p>
              ) : (
                expenses.map(exp => {
                  const dispAmt = convertCurrency(exp.amount, exp.currency || tripCurrency, viewCurrency);
                  return (
                    <div key={exp.id} className="flex items-center justify-between p-2.5 bg-brand-bg/50 border border-brand-muted/5 rounded-lg text-xs hover:border-brand-muted/15 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base">{CATEGORY_EMOJIS[exp.category] || '💸'}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-brand-dark truncate">{exp.note || exp.category}</span>
                            <span
                              className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0"
                              style={{ color: CATEGORY_COLORS[exp.category] || '#78716C', backgroundColor: `${CATEGORY_COLORS[exp.category]}15`, borderColor: `${CATEGORY_COLORS[exp.category]}30` }}
                            >
                              {exp.category}
                            </span>
                          </div>
                          <span className="text-[10px] text-brand-muted font-medium">{exp.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-black text-brand-dark">{viewCurrency} {dispAmt.toFixed(2)}</span>
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1 hover:bg-red-50 text-brand-muted hover:text-red-500 rounded transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Budget meter + charts + converter */}
        <div className="space-y-5">
          {/* Circular meter */}
          <BudgetMeter spent={totalSpentInTripCurrency} limit={tripBudgetAmount} currency={tripCurrency} />

          {/* Category breakdown chart */}
          <div className="bg-white border border-brand-muted/10 rounded-card p-4 shadow-sm space-y-3">
            <h5 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-brand-primary" /> Spending by Category
            </h5>
            <CategoryBarChart expenses={expenses} currency={tripCurrency} />
          </div>

          {/* Currency Converter */}
          <div className="bg-white border border-brand-muted/10 rounded-card shadow-sm overflow-hidden">
            <button
              onClick={() => setShowConverter(c => !c)}
              className="w-full flex items-center justify-between p-4 hover:bg-brand-bg transition-colors"
            >
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-dark">
                <ArrowLeftRight className="h-4 w-4 text-brand-primary" /> Currency Converter
              </span>
              <RefreshCw className={`h-3.5 w-3.5 text-brand-muted transition-transform ${showConverter ? 'rotate-180' : ''}`} />
            </button>
            {showConverter && (
              <div className="px-4 pb-4 space-y-3 border-t border-brand-muted/10">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={converterAmount}
                    onChange={(e) => setConverterAmount(e.target.value)}
                    className="flex-1 bg-brand-bg px-2.5 py-1.5 text-xs border border-brand-muted/20 rounded-btn focus:outline-none focus:border-brand-primary/50 font-mono"
                  />
                  <select
                    value={converterFrom}
                    onChange={(e) => setConverterFrom(e.target.value)}
                    className="text-xs font-bold bg-brand-bg border border-brand-muted/20 rounded-btn px-2 py-1.5 focus:outline-none"
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-brand-primary/5 border border-brand-primary/20 px-2.5 py-1.5 rounded-btn font-mono font-black text-brand-primary text-sm">
                    {convertedAmount}
                  </div>
                  <select
                    value={converterTo}
                    onChange={(e) => setConverterTo(e.target.value)}
                    className="text-xs font-bold bg-brand-bg border border-brand-muted/20 rounded-btn px-2 py-1.5 focus:outline-none"
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <p className="text-[10px] text-brand-muted">Indicative rates only. Check live rates before transactions.</p>
              </div>
            )}
          </div>

          {/* AI Advisor */}
          <div className="bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 border border-brand-primary/15 rounded-card p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI Budget Advisor
            </div>
            <p className="text-xs text-brand-dark leading-relaxed italic">
              {totalSpentInTripCurrency === 0
                ? `"You haven't logged any expenses yet. Start tracking to get personalized budget insights for ${trip.destination || 'your destination'}."`
                : parseFloat(dailySafeSpend) > 0
                  ? `"At your current pace of ${tripCurrency} ${dailyAvg}/day, you have ${tripCurrency} ${dailySafeSpend} left to safely spend per day to stay within budget. Your top spend category is ${expenses[0]?.category || 'Food'}."`
                  : `"You've exceeded your planned budget. Consider prioritising free activities or adjusting your remaining accommodation choices."`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
