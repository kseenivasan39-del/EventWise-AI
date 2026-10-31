'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ArrowRight, 
  Trophy,
  LayoutDashboard,
  Calendar,
  Coins,
  Store,
  ShieldAlert,
  Bot,
  Share2,
  Users,
  CheckCircle2,
  Send,
  FileText,
  Clock,
  MapPin,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { useEventContext } from '@/context/EventContext';

export default function LandingPage() {
  const router = useRouter();
  const { loadScenario } = useEventContext();

  const [promptText, setPromptText] = useState('');

  // Event templates matching screenshot
  const TEMPLATES = [
    {
      key: 'wedding' as const,
      title: 'Tamil Wedding in Chennai',
      description: 'Traditional celebration with 300 guests, customizable budget and cultural preferences.',
      guests: '300 Guests',
      budget: '₹5,00,000',
      duration: '45 Days',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    },
    {
      key: 'birthday' as const,
      title: 'Kids Birthday Party',
      description: 'Fun-filled birthday party with themes, activities, and budget-friendly options.',
      guests: '100 Guests',
      budget: '₹40,000',
      duration: '30 Days',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    },
    {
      key: 'community' as const,
      title: 'Community Festival',
      description: 'Plan large-scale community events with stage, logistics, and volunteer coordination.',
      guests: '500 Guests',
      budget: 'Custom Budget',
      duration: '60 Days',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleQuickSubmit = (customPrompt?: string) => {
    const textToSend = customPrompt || promptText;
    if (!textToSend.trim()) return;
    router.push(`/wizard?prefill=${encodeURIComponent(textToSend)}`);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F8] text-[#1e1b4b] flex flex-col selection:bg-pink-200 selection:text-pink-900 overflow-x-hidden">
      
      {/* =========================================================================
          HERO SECTION (Exact match to screenshot)
         ========================================================================= */}
      <section className="relative pt-6 pb-12 lg:pt-10 lg:pb-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headline, CTAs, Feature Pills */}
          <div className="lg:col-span-5 space-y-6 text-left z-10">
            {/* PromptWars Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/80 border border-pink-200 text-pink-700 text-xs font-bold tracking-tight">
              <Trophy className="h-3.5 w-3.5 text-pink-600" />
              <span>PromptWars Competition Edition</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.12] text-slate-900">
              Your vision. Your budget. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600">
                One intelligent plan.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-lg">
              EventWise AI turns your ideas into complete, actionable event plans with smart budgets, timelines, vendor options, and adaptive recovery when plans change.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/wizard">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-pink-glow hover:shadow-pink-glow transition-all active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Launch Natural Language Wizard</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </Link>

              <Link href="/dashboard">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-pink-50/60 border border-pink-200 text-slate-800 font-bold text-sm shadow-card-subtle transition-all"
                >
                  <LayoutDashboard className="h-4 w-4 text-pink-500" />
                  <span>Open Command Center</span>
                </button>
              </Link>
            </div>

            {/* Feature Pills Row */}
            <div className="flex flex-wrap gap-2 pt-3 text-xs font-bold text-slate-700">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-pink-100 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-pink-500" /> AI-Powered Planning
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-pink-100 shadow-sm">
                <Coins className="h-3.5 w-3.5 text-pink-500" /> Budget Optimization
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-pink-100 shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-pink-500" /> Smart Timelines
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-pink-100 shadow-sm">
                <Store className="h-3.5 w-3.5 text-pink-500" /> Vendor Intelligence
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-pink-100 shadow-sm">
                <ShieldAlert className="h-3.5 w-3.5 text-pink-500" /> Event Recovery
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> End-to-End Management
              </span>
            </div>
          </div>

          {/* Right Column: Floral Mandap Gazebo Backdrop + 3D Angled Live Dashboard */}
          <div className="lg:col-span-7 relative flex justify-center items-center">
            
            {/* Romantic Floral Mandap Background Image */}
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-90 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                alt="Floral Mandap"
                className="w-full h-full object-contain filter drop-shadow-md rounded-3xl"
              />
            </div>

            {/* Hand-drawn style decorative note */}
            <div className="absolute -top-4 right-4 z-20 hidden sm:block text-pink-500 font-serif italic text-xs tracking-wide transform rotate-6">
              From idea<br />to unforgettable<br />events ➔
            </div>

            {/* Isometric Angled Glass Dashboard (Pixel-perfect mirror of the screenshot mockup) */}
            <div className="relative z-10 w-full max-w-[620px] bg-white/95 rounded-3xl border border-pink-100 p-4 sm:p-5 shadow-2xl backdrop-blur-md transform lg:rotate-1 hover:rotate-0 transition-transform duration-300">
              
              {/* Header inside Dashboard Card */}
              <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-pink-500 text-white flex items-center justify-center text-xs font-bold">
                    E
                  </div>
                  <span className="text-xs font-bold text-slate-800">EventWise AI</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-bold text-slate-800">
                    <span className="h-2 w-2 rounded-full bg-pink-500" />
                    <span>Tamil Wedding in Chennai</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </div>
                  <div className="flex -space-x-1.5">
                    <div className="h-6 w-6 rounded-full bg-pink-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">P</div>
                    <div className="h-6 w-6 rounded-full bg-rose-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">R</div>
                    <div className="h-6 w-6 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-[9px] text-slate-500">+2</div>
                  </div>
                  <Link href="/export">
                    <button className="px-3 py-1 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                      <Share2 className="h-3 w-3" /> Share
                    </button>
                  </Link>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-12 gap-3 pt-3">
                {/* Mini Left Sidebar */}
                <div className="col-span-3 space-y-1 text-[11px] font-bold text-slate-600 border-r border-pink-100 pr-2">
                  <div className="px-2 py-1.5 rounded-lg bg-pink-50 text-pink-700 flex items-center gap-1.5">
                    <LayoutDashboard className="h-3 w-3" /> Overview
                  </div>
                  <div className="px-2 py-1.5 hover:text-pink-600 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> Timeline
                  </div>
                  <div className="px-2 py-1.5 hover:text-pink-600 flex items-center gap-1.5">
                    <Coins className="h-3 w-3" /> Budget
                  </div>
                  <div className="px-2 py-1.5 hover:text-pink-600 flex items-center gap-1.5">
                    <Store className="h-3 w-3" /> Vendors
                  </div>
                  <div className="px-2 py-1.5 hover:text-pink-600 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" /> Tasks
                  </div>
                  <div className="px-2 py-1.5 hover:text-pink-600 flex items-center gap-1.5">
                    <ShieldAlert className="h-3 w-3 text-amber-500" /> Crisis Recovery
                  </div>
                  <div className="px-2 py-1.5 hover:text-pink-600 flex items-center gap-1.5">
                    <Bot className="h-3 w-3 text-pink-500" /> AI Copilot
                  </div>
                </div>

                {/* Center / Right Content Panel */}
                <div className="col-span-9 space-y-3">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Budget Tile */}
                    <div className="p-2.5 rounded-2xl bg-[#FFF9FA] border border-pink-100">
                      <span className="text-[10px] text-slate-500 font-bold block">Total Budget</span>
                      <span className="text-sm font-black text-slate-900 block mt-0.5">₹5,00,000</span>
                      <div className="w-full h-1 bg-stone-200 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full" style={{ width: '73%' }} />
                      </div>
                      <span className="text-[9px] text-pink-600 font-bold mt-1 block">73% used</span>
                    </div>

                    {/* Tasks Tile */}
                    <div className="p-2.5 rounded-2xl bg-[#FFF9FA] border border-pink-100">
                      <span className="text-[10px] text-slate-500 font-bold block">Tasks</span>
                      <span className="text-sm font-black text-slate-900 block mt-0.5">18 / 32</span>
                      <div className="w-full h-1 bg-stone-200 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '56%' }} />
                      </div>
                      <span className="text-[9px] text-emerald-600 font-bold mt-1 block">56% complete</span>
                    </div>

                    {/* Event Date Tile */}
                    <div className="p-2.5 rounded-2xl bg-[#FFF9FA] border border-pink-100">
                      <span className="text-[10px] text-slate-500 font-bold block">Event Date</span>
                      <span className="text-xs font-black text-slate-900 block mt-0.5">Dec 14, 2026</span>
                      <span className="text-[9px] text-pink-500 font-bold mt-2.5 block">45 days left</span>
                    </div>
                  </div>

                  {/* Middle Widgets: Budget Breakdown + Upcoming Tasks + AI Suggestions */}
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    {/* Budget Breakdown Donut */}
                    <div className="p-2.5 rounded-2xl bg-white border border-pink-100">
                      <strong className="block text-[11px] font-bold text-slate-800 mb-2">Budget Breakdown</strong>
                      <div className="flex items-center gap-2">
                        <div className="h-12 w-12 rounded-full border-4 border-pink-500 border-t-amber-400 border-r-emerald-400 flex items-center justify-center flex-shrink-0" />
                        <div className="space-y-0.5 text-[9px] font-semibold text-slate-600">
                          <div><span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-500 mr-1" />Venue 34%</div>
                          <div><span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" />Catering 30%</div>
                          <div><span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />Decor 20%</div>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Tasks Checklist */}
                    <div className="p-2.5 rounded-2xl bg-white border border-pink-100 space-y-1.5">
                      <strong className="block text-[11px] font-bold text-slate-800 mb-1">Upcoming Tasks</strong>
                      <div className="flex items-center justify-between text-[9px] text-slate-700">
                        <span className="flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Book Venue
                        </span>
                        <span className="text-slate-400">Oct 20</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-700">
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="h-2 w-2 rounded-full border border-pink-400" /> Finalize Catering
                        </span>
                        <span className="text-slate-400">Oct 25</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-700">
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="h-2 w-2 rounded-full border border-pink-400" /> Confirm Decor
                        </span>
                        <span className="text-slate-400">Oct 30</span>
                      </div>
                    </div>

                    {/* AI Suggestions Card with Miniature Visual */}
                    <div className="p-2.5 rounded-2xl bg-white border border-pink-100">
                      <strong className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-pink-500" /> AI Suggestions
                      </strong>
                      <div className="rounded-xl overflow-hidden h-10 w-full mb-1">
                        <img
                          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80"
                          alt="Decor"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[8px] text-slate-600 font-medium leading-tight">
                        Elegant traditional theme aligned with your budget.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: EXPLORE EVENT TEMPLATES (Matching Screenshot)
         ========================================================================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Explore Event Templates
          </h2>
          <Link href="/wizard" className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1">
            <span>View all templates</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.key}
              onClick={() => {
                loadScenario(tmpl.key);
                router.push('/dashboard');
              }}
              className="cursor-pointer group rounded-3xl bg-white border border-pink-100 p-3 shadow-card-subtle hover:shadow-pink-soft transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center gap-4">
                {/* Rounded Square Event Thumbnail */}
                <div className="h-24 w-28 rounded-2xl overflow-hidden flex-shrink-0 bg-stone-100">
                  <img
                    src={tmpl.image}
                    alt={tmpl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                      {tmpl.key === 'wedding' && <span>💍</span>}
                      {tmpl.key === 'birthday' && <span>🎂</span>}
                      {tmpl.key === 'community' && <span>🎪</span>}
                      <span>{tmpl.title}</span>
                    </h3>
                    <div className="h-6 w-6 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors flex-shrink-0">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-1 leading-snug">
                    {tmpl.description}
                  </p>
                </div>
              </div>

              {/* Bottom Meta Pill Stats */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-pink-50 text-[10px] font-bold text-slate-600">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-pink-500" /> {tmpl.guests}
                </span>
                <span className="flex items-center gap-1">
                  <Coins className="h-3 w-3 text-pink-500" /> {tmpl.budget}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-pink-500" /> {tmpl.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PLAN WITH AI IN NATURAL LANGUAGE (Matching Screenshot)
         ========================================================================= */}
      <section className="py-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-pink-100/70 via-rose-50/80 to-pink-100/70 border border-pink-200/80 p-6 sm:p-8 shadow-card-subtle">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Prompt Description */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-pink-500 text-white flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Plan with AI in Natural Language
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Describe your event and let EventWise AI create a complete plan for you.
              </p>

              {/* Sample Quick Prompt Chips */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickSubmit('A traditional Tamil wedding in Chennai for 300 guests within ₹5,00,000')}
                  className="w-full text-left px-3.5 py-2 rounded-full bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold border border-pink-200/70 flex items-center justify-between shadow-sm transition-all"
                >
                  <span>A traditional Tamil wedding in Chennai for 300 guests within ₹5,00,000</span>
                  <ArrowRight className="h-3 w-3 text-pink-500 flex-shrink-0" />
                </button>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickSubmit('A kids birthday party with superhero theme')}
                    className="px-3.5 py-2 rounded-full bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold border border-pink-200/70 flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>A kids birthday party with superhero theme</span>
                    <ArrowRight className="h-3 w-3 text-pink-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSubmit('A community festival for 500 people')}
                    className="px-3.5 py-2 rounded-full bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold border border-pink-200/70 flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>A community festival for 500 people</span>
                    <ArrowRight className="h-3 w-3 text-pink-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Interactive Prompt Form Box */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-white p-4 shadow-pink-soft border border-pink-100 space-y-4">
                
                {/* Textarea + Submit Arrow Button */}
                <div className="flex items-center gap-2 border-b border-pink-100 pb-3">
                  <FileText className="h-5 w-5 text-pink-400 flex-shrink-0 ml-1" />
                  <input
                    type="text"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuickSubmit();
                    }}
                    placeholder="Describe your event... (e.g., wedding, birthday, community event, budget, guests, date, preferences)"
                    className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuickSubmit()}
                    className="h-9 w-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-pink-300 transition-all active:scale-95"
                    aria-label="Submit Plan Request"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>

                {/* Bottom Context Helpers (Matching Screenshot) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-bold text-slate-600">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPromptText(prev => `${prev} within ₹5,00,000`)}
                      className="inline-flex items-center gap-1 hover:text-pink-600 transition-colors"
                    >
                      <Coins className="h-3.5 w-3.5 text-pink-500" />
                      <span>Add Budget</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPromptText(prev => `${prev} in 45 days`)}
                      className="inline-flex items-center gap-1 hover:text-pink-600 transition-colors"
                    >
                      <Calendar className="h-3.5 w-3.5 text-pink-500" />
                      <span>Add Date</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPromptText(prev => `${prev} for 300 guests`)}
                      className="inline-flex items-center gap-1 hover:text-pink-600 transition-colors"
                    >
                      <Users className="h-3.5 w-3.5 text-pink-500" />
                      <span>Add Guest Count</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPromptText(prev => `${prev} in Chennai`)}
                      className="inline-flex items-center gap-1 hover:text-pink-600 transition-colors"
                    >
                      <MapPin className="h-3.5 w-3.5 text-pink-500" />
                      <span>Add Location</span>
                    </button>
                  </div>

                  <Link
                    href="/wizard"
                    className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 ml-auto"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Advanced Options</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-pink-100 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 bg-white/70">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-semibold text-slate-700">
            © 2026 EventWise AI. PromptWars Competition Edition.
          </p>
          <div className="flex items-center space-x-6 font-bold text-slate-600">
            <Link href="/dashboard" className="hover:text-pink-600">Command Center</Link>
            <Link href="/wizard" className="hover:text-pink-600">AI Wizard</Link>
            <Link href="/recovery" className="hover:text-pink-600">Crisis Recovery</Link>
            <Link href="/export" className="hover:text-pink-600">Export & Share</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
