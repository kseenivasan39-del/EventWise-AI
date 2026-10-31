'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, Wand2 } from 'lucide-react';
import { ParsedNLRequest } from '@/types/event';
import { useEventContext } from '@/context/EventContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const PROMPT_TEMPLATES = [
  {
    title: 'Tamil Wedding in Chennai',
    text: 'Plan a traditional Tamil wedding in Chennai for 300 guests, within ₹5,00,000, in 45 days. Prioritize good food, comfortable guest arrangements, and elegant decor.',
  },
  {
    title: 'Kids Birthday Party in Bangalore',
    text: 'Organize a superhero themed 10th birthday party for 100 kids and parents in Indiranagar, Bangalore, within ₹40,000 in 30 days. Need pizza, cake, and magician.',
  },
  {
    title: 'Community Eco-Festival in Pune',
    text: 'Coordinate an eco-friendly community street festival in Pune for 500 attendees with ₹2,50,000 budget in 60 days. Need live stage, waste management, and safety marshals.',
  },
];

export default function WizardPage() {
  const router = useRouter();
  const { setCustomPlan } = useEventContext();

  const [prompt, setPrompt] = useState(PROMPT_TEMPLATES[0].text);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedSpec, setParsedSpec] = useState<ParsedNLRequest | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parseNotes, setParseNotes] = useState<string | null>(null);

  // Contextual overrides
  const [overrideBudget, setOverrideBudget] = useState<number | ''>('');
  const [overrideGuests, setOverrideGuests] = useState<number | ''>('');
  const [overrideDays, setOverrideDays] = useState<number | ''>('');
  const [overrideLocation, setOverrideLocation] = useState<string>('');

  const handleParsePrompt = async () => {
    if (!prompt.trim()) return;
    setIsParsing(true);
    setErrorMessage(null);
    setParseNotes(null);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parse_prompt',
          payload: { prompt },
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setParsedSpec(json.data.data);
        setOverrideBudget(json.data.data.budgetTotal);
        setOverrideGuests(json.data.data.guestCount);
        setOverrideDays(json.data.data.daysUntilEvent);
        setOverrideLocation(json.data.data.location);

        if (json.data.notes) {
          setParseNotes(json.data.notes);
        }
      } else {
        setErrorMessage(json.error || 'Failed to parse prompt requirements');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred during parsing');
    } finally {
      setIsParsing(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!parsedSpec) return;
    setIsGenerating(true);
    setErrorMessage(null);

    // Apply any customized overrides from inputs
    const finalPayload: ParsedNLRequest = {
      ...parsedSpec,
      budgetTotal: typeof overrideBudget === 'number' && overrideBudget > 0 ? overrideBudget : parsedSpec.budgetTotal,
      guestCount: typeof overrideGuests === 'number' && overrideGuests > 0 ? overrideGuests : parsedSpec.guestCount,
      daysUntilEvent: typeof overrideDays === 'number' && overrideDays > 0 ? overrideDays : parsedSpec.daysUntilEvent,
      location: overrideLocation || parsedSpec.location,
    };

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_plan',
          payload: finalPayload,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCustomPlan(json.data);
        router.push('/dashboard');
      } else {
        setErrorMessage(json.error || 'Plan generation failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during plan generation');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Badge variant="purple" className="mb-2">AI Event Planning Pipeline</Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Planning Workspace</h1>
        <p className="text-sm text-slate-500 mt-1">
          Describe your occasion in natural language. EventWise AI extracts parameters, validates feasibility, and generates structured plans.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Step 1: Prompt Input */}
      <Card className="mb-8 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Wand2 className="h-4 w-4 text-violet-600" />
            <span>Step 1: Natural Language Specification</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Quick Presets:</span>
            {PROMPT_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(tmpl.text)}
                className="text-xs px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-slate-700 font-medium border border-stone-200/70 transition-colors"
              >
                {tmpl.title}
              </button>
            ))}
          </div>

          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Plan an eco-friendly wedding in Chennai for 250 guests within ₹6,00,000 in 60 days..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
          />

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="gradient"
              onClick={handleParsePrompt}
              isLoading={isParsing}
              className="px-6 font-bold shadow-soft hover:shadow-glow-purple"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze & Parse Requirements
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Parsed & Validated Configuration Confirmation */}
      {parsedSpec && (
        <Card className="border-purple-200 bg-white shadow-soft-lg">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Step 2: Confirm & Refine Event Parameters</span>
              </CardTitle>
              <Badge variant="success">Validated Schema</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {parseNotes && (
              <p className="text-xs text-slate-600 bg-stone-50 p-3 rounded-xl border border-stone-200 mb-4 font-medium">
                ℹ️ {parseNotes}
              </p>
            )}

            {/* Contextual Editable Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
              <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/80">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Event Name & Type</span>
                <span className="font-bold text-slate-900">{parsedSpec.name}</span>
                <span className="ml-2 text-xs uppercase px-2 py-0.5 rounded-lg bg-stone-200 text-slate-700 font-bold">
                  {parsedSpec.eventType}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/80">
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Budget ({parsedSpec.currency})
                </label>
                <input
                  type="number"
                  value={overrideBudget}
                  onChange={(e) => setOverrideBudget(parseFloat(e.target.value) || '')}
                  className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/80">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Guest Attendees</label>
                <input
                  type="number"
                  value={overrideGuests}
                  onChange={(e) => setOverrideGuests(parseInt(e.target.value, 10) || '')}
                  className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/80">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Location</label>
                <input
                  type="text"
                  value={overrideLocation}
                  onChange={(e) => setOverrideLocation(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/80 sm:col-span-2">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Dietary & Cultural Preferences</span>
                <span className="text-slate-800 font-medium">{parsedSpec.culturalDietaryPreferences || 'Standard catering'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
              <span className="text-xs text-slate-500 font-medium">
                Deterministic validation: Category totals match limit with 10% contingency buffer.
              </span>
              <Button
                type="button"
                variant="gradient"
                onClick={handleGeneratePlan}
                isLoading={isGenerating}
                size="lg"
                className="w-full sm:w-auto font-bold px-7 shadow-soft hover:shadow-glow-purple"
              >
                Generate Full Plan & Command Center <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
