// src/pages/tabs/BudgetTab.tsx
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Trip, Expense } from '../../types';
import { BudgetMeter } from '../../components/BudgetMeter';

interface BudgetTabProps {
  trip: Trip;
  expenses: Expense[];
  onAddExpense: (amount: number, category: string, note: string) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({
  trip,
  expenses,
  onAddExpense,
  onDeleteExpense
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    onAddExpense(parsedAmount, category, note.trim());
    setAmount('');
    setNote('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Left panel: logger and expenses */}
      <div className="lg:col-span-2 space-y-6">
        {/* Add expense form */}
        <div className="bg-white border border-brand-muted/10 p-5 rounded-card shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">Log Trip Expense</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input 
              type="number" 
              placeholder="Amount" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="bg-brand-bg px-2.5 py-1.5 text-xs text-brand-dark font-medium border border-brand-muted/20 rounded-btn"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-brand-bg px-2.5 py-1.5 text-xs text-brand-dark font-bold border border-brand-muted/20 rounded-btn"
            >
              {['Food', 'Flights', 'Accommodation', 'Transport', 'Activities', 'Shopping', 'Emergency'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input 
              type="text" 
              placeholder="Note (e.g. Ramen meal)" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-brand-bg px-2.5 py-1.5 text-xs text-brand-dark font-medium border border-brand-muted/20 rounded-btn"
            />
            <button 
              type="submit"
              className="bg-brand-primary text-white font-bold py-1.5 px-3 rounded-btn text-xs hover:bg-brand-primary/95 transition-all shadow-sm flex items-center justify-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Cost</span>
            </button>
          </form>
        </div>

        {/* List logged expenses */}
        <div className="bg-white border border-brand-muted/10 rounded-card p-4 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">Expense Logs History</h4>
          
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {expenses.length === 0 ? (
              <p className="text-xs text-brand-muted py-4 text-center">No expenses logged. Add your first item above.</p>
            ) : (
              expenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-2.5 bg-brand-bg/50 border border-brand-muted/5 rounded-lg text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-dark">{exp.note || exp.category}</span>
                      <span className="text-[9px] font-bold uppercase bg-brand-primary/5 text-brand-primary px-1.5 py-0.2 border border-brand-primary/10 rounded">
                        {exp.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-brand-muted font-medium">{exp.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-dark">{trip.budget.currency} {exp.amount}</span>
                    <button 
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1 hover:bg-red-50 text-brand-muted hover:text-brand-danger rounded transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right panel: circular progress */}
      <div className="space-y-6">
        <BudgetMeter spent={totalSpent} limit={trip.budget.amount} currency={trip.budget.currency} />

        {/* AI Insights Card */}
        <div className="bg-white border border-brand-muted/10 rounded-card p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-1 text-xs font-bold text-brand-primary uppercase tracking-wider">
            <span>🧠 AI Budget Advisor</span>
          </div>
          <p className="text-xs text-brand-dark leading-relaxed italic">
            "You are spending approximately {trip.budget.currency} {(totalSpent / Math.max(1, trip.itinerary?.length || 5)).toFixed(2)} per day. If this velocity continues, you will end the trip in line with your settings."
          </p>
        </div>
      </div>
    </div>
  );
};
