'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Languages, 
  Check,
  Coins
} from 'lucide-react';
import { useEventContext } from '@/context/EventContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CopilotRecommendation } from '@/lib/ai/copilotEngine';
import { formatCurrency } from '@/lib/planning/budgetEngine';

const QUICK_QUERIES = [
  'Reduce our budget by ₹50,000 without compromising food quality.',
  'Generate wedding invitation text in English and Tamil.',
  'Create an authentic vegetarian menu for 300 guests.',
  'What critical milestones should we complete this week?',
  'Which tasks will be affected if the venue changes?',
];

export default function CopilotPage() {
  const { currentPlan, updateCategory, addTask } = useEventContext();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appliedItemIndex, setAppliedItemIndex] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; text?: string; advice?: CopilotRecommendation }>>([
    {
      role: 'assistant',
      text: `Hello! I am your EventWise AI Planning Copilot. I have full context of "${currentPlan.event.name}" (${formatCurrency(currentPlan.event.budgetTotal, currentPlan.event.currency)} budget, ${currentPlan.event.guestCount} guests). Ask me to optimize budgets, draft bilingual invitations, evaluate vendor quotes, or suggest tailored menus.`,
    },
  ]);

  const handleSendQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    setInputQuery('');
    setConversation((prev) => [...prev, { role: 'user', text: q }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ask_copilot',
          payload: {
            plan: currentPlan,
            query: q,
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setConversation((prev) => [...prev, { role: 'assistant', advice: json.data }]);
      } else {
        setConversation((prev) => [
          ...prev,
          { role: 'assistant', text: 'I encountered an error answering your inquiry. Please try again.' },
        ]);
      }
    } catch (e: any) {
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', text: `Network error: ${e.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChange = (idxKey: string, change: any) => {
    if (change.costImpact !== 0) {
      // Find a matching non-contingency category and offset
      const targetCat = currentPlan.categories.find(c => !c.isContingency);
      if (targetCat) {
        updateCategory(targetCat.id, Math.max(0, targetCat.allocatedAmount + change.costImpact));
      }
    }
    setAppliedItemIndex(idxKey);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200/80">
        <Badge variant="purple" className="mb-1">Conversational Decision Engine</Badge>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Bot className="h-7 w-7 text-violet-600" />
          <span>AI Planning Copilot</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Context-aware guidance with structured proposals, cost trade-off computations, and bilingual drafting.
        </p>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-semibold">Quick Inquiries:</span>
        {QUICK_QUERIES.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(q)}
            className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-slate-700 font-medium border border-stone-200 shadow-soft-sm transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="space-y-4 min-h-[400px]">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-soft font-medium'
                  : 'bg-white border border-stone-200 text-slate-800 shadow-soft'
              }`}
            >
              {msg.text && <p className="leading-relaxed">{msg.text}</p>}

              {/* Render Structured Copilot Advice if present */}
              {msg.advice && (
                <div className="space-y-4">
                  <p className="font-bold text-slate-900 leading-relaxed">
                    {msg.advice.summary}
                  </p>

                  {msg.advice.categoryAdvice && (
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-slate-700 font-medium">
                      💡 {msg.advice.categoryAdvice}
                    </div>
                  )}

                  {/* Proposed Changes list with cost impact & Apply action */}
                  {msg.advice.proposedChanges && msg.advice.proposedChanges.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <span className="text-xs font-bold text-slate-900 block">Proposed Actionable Changes:</span>
                      {msg.advice.proposedChanges.map((change, i) => {
                        const key = `${index}-${i}`;
                        const isApplied = appliedItemIndex === key;
                        return (
                          <div key={i} className="p-3 rounded-xl bg-stone-50/80 border border-stone-200 flex items-center justify-between text-xs">
                            <span className="text-slate-700 font-medium">{change.description}</span>
                            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                              <span
                                className={`font-bold ${
                                  change.costImpact < 0
                                    ? 'text-emerald-700'
                                    : change.costImpact > 0
                                    ? 'text-rose-600'
                                    : 'text-slate-500'
                                }`}
                              >
                                {change.costImpact < 0
                                  ? `Save ${formatCurrency(Math.abs(change.costImpact), currentPlan.event.currency)}`
                                  : change.costImpact > 0
                                  ? `+${formatCurrency(change.costImpact, currentPlan.event.currency)}`
                                  : 'Neutral'}
                              </span>

                              {isApplied ? (
                                <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Applied
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleApplyChange(key, change)}
                                  className="text-[11px] font-bold text-violet-700 hover:text-violet-800 bg-white border border-stone-200 rounded-lg px-2.5 py-1 shadow-soft-sm"
                                >
                                  Apply
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Bilingual Output if present */}
                  {msg.advice.bilingualOutput && (
                    <div className="pt-2 border-t border-stone-100 space-y-3">
                      <span className="text-xs font-bold text-violet-700 flex items-center gap-1.5">
                        <Languages className="h-4 w-4" /> Bilingual Invitation Drafts:
                      </span>
                      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                        <strong className="text-xs text-slate-500 font-semibold block">English Invitation:</strong>
                        <p className="text-xs text-slate-800 whitespace-pre-line font-medium">{msg.advice.bilingualOutput.english}</p>
                      </div>
                      {msg.advice.bilingualOutput.tamil && (
                        <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2">
                          <strong className="text-xs text-violet-700 font-bold block">தமிழ் வடிவம் (Traditional Tamil):</strong>
                          <p className="text-xs text-slate-900 whitespace-pre-line font-serif leading-relaxed">{msg.advice.bilingualOutput.tamil}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actionable Followup */}
                  {msg.advice.actionableFollowup && (
                    <p className="text-xs text-violet-700 font-semibold italic pt-1">
                      → {msg.advice.actionableFollowup}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 rounded-2xl p-3.5 text-xs text-slate-500 flex items-center gap-2 shadow-soft-sm">
              <Sparkles className="h-4 w-4 text-violet-600 animate-spin" />
              <span>Analyzing current event context and computing recommendations...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="sticky bottom-4 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery(inputQuery);
          }}
          className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-stone-200 shadow-soft-lg"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about budget trade-offs, tasks, invitations, or vendors..."
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />
          <Button type="submit" variant="gradient" size="sm" disabled={isLoading || !inputQuery.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
