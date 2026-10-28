'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calendar,
  LayoutDashboard, 
  CalendarCheck2, 
  Coins, 
  Store, 
  ShieldAlert, 
  Bot, 
  Share2, 
  Bell, 
  LogOut, 
  Plus,
  Trash2,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  Menu,
  X
} from 'lucide-react';
import { useEventContext } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { currentPlan, userEvents, switchEvent, deleteCurrentEvent } = useEventContext();
  
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const eventRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (eventRef.current && !eventRef.current.contains(event.target as Node)) {
        setShowEventDropdown(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setShowToolsDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary workspace links visible in the clean bar
  const primaryLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/timeline', label: 'Timeline' },
    { href: '/budget', label: 'Budget' },
    { href: '/vendors', label: 'Vendors' },
    { href: '/recovery', label: 'Crisis Recovery', badge: currentPlan.incidents.length > 0 },
    { href: '/copilot', label: 'AI Copilot', isAI: true },
  ];

  // Secondary tools tucked into an elegant dropdown
  const secondaryTools = [
    { href: '/export', label: 'Export & Share Plan', icon: Share2, desc: 'Generate PDF or shareable summary' },
    { href: '/wizard', label: 'AI Planning Wizard', icon: Sparkles, desc: 'Generate a new plan from text prompt' },
  ];

  const isToolActive = secondaryTools.some(t => pathname === t.href);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-rose-100/70 shadow-[0_2px_12px_rgba(244,63,94,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform duration-200">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="text-base font-extrabold text-slate-900 tracking-tight leading-none flex items-center gap-1">
                EventWise <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">AI</span>
              </div>
              <span className="text-[10px] text-rose-400 font-semibold tracking-wider uppercase mt-0.5">
                Smart Planner
              </span>
            </div>
          </Link>

          {/* Active Event Selector Pill */}
          <div className="hidden lg:flex items-center" ref={eventRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEventDropdown(!showEventDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50/70 hover:bg-rose-100/60 border border-rose-200/60 text-xs font-semibold text-slate-700 transition-all active:scale-98 max-w-[200px]"
                title={currentPlan.event.name}
              >
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                <span className="truncate">{currentPlan.event.name || 'Select Event'}</span>
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${showEventDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showEventDropdown && (
                <div className="absolute left-0 top-10 w-72 bg-white/95 backdrop-blur-xl border border-rose-100 rounded-2xl shadow-xl shadow-rose-950/5 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                    Your Events ({userEvents.length})
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-1 py-1">
                    {userEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => {
                          switchEvent(ev.id);
                          setShowEventDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                          currentPlan.event.id === ev.id
                            ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200/50'
                            : 'text-slate-700 hover:bg-rose-50/50'
                        }`}
                      >
                        <span className="truncate pr-2">{ev.name}</span>
                        <span className="text-[10px] font-semibold text-slate-400 capitalize px-2 py-0.5 rounded-md bg-slate-100">
                          {ev.eventType}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-1 border-t border-rose-100/70 flex items-center justify-between">
                    <Link
                      href="/wizard"
                      onClick={() => setShowEventDropdown(false)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> New Event
                    </Link>
                    {userEvents.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${currentPlan.event.name}"?`)) {
                            deleteCurrentEvent();
                            setShowEventDropdown(false);
                          }
                        }}
                        className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 px-2 py-1 font-medium transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clean Desktop Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 p-1 rounded-full border border-slate-200/40">
            {primaryLinks.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-rose-600 font-bold shadow-sm shadow-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {item.isAI && (
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-600">
                        AI
                      </span>
                    )}
                    {item.badge && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </span>
                </Link>
              );
            })}

            {/* More Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                type="button"
                onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isToolActive
                    ? 'bg-white text-rose-600 font-bold shadow-sm shadow-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="More planning tools"
              >
                <span>More</span>
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${showToolsDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showToolsDropdown && (
                <div className="absolute right-0 top-10 w-64 bg-white/95 backdrop-blur-xl border border-rose-100 rounded-2xl shadow-xl shadow-rose-950/5 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                    Tools & Exports
                  </div>
                  <div className="space-y-1 py-1">
                    {secondaryTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={() => setShowToolsDropdown(false)}
                          className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-colors ${
                            pathname === tool.href
                              ? 'bg-rose-50 text-rose-700 font-bold'
                              : 'text-slate-700 hover:bg-rose-50/50'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-rose-100/60 text-rose-600 mt-0.5">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{tool.label}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{tool.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Section: Notification, Auth & Create Event CTA */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Notification Bell */}
            <Link
              href="/recovery"
              className="relative p-2 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Risk & Contingency Alerts"
            >
              <Bell className="h-4 w-4" />
              {currentPlan.incidents.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </Link>

            {/* Auth User Pill */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white border border-rose-200/80 hover:border-rose-300 text-xs font-semibold text-slate-800 shadow-sm transition-all"
                >
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 top-11 w-52 bg-white/95 backdrop-blur-xl border border-rose-100 rounded-2xl shadow-xl shadow-rose-950/5 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-rose-100/70">
                      <span className="block font-bold text-slate-900 truncate">{user.name}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{user.email}</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 mt-1 rounded-xl text-rose-500 hover:bg-rose-50 flex items-center gap-2 font-semibold transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Premium CTA Button */}
            <Link
              href="/wizard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-sm shadow-pink-500/25 transition-all hover:shadow-md hover:scale-[1.02] active:scale-98"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Event</span>
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-rose-100/70 bg-white/95 backdrop-blur-xl px-4 py-3 space-y-1.5 animate-in slide-in-from-top-2 duration-150">
          <div className="pb-2 border-b border-rose-100/60 mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Event:
            </span>
            <div className="font-bold text-xs text-rose-700 truncate">{currentPlan.event.name}</div>
          </div>
          
          {[...primaryLinks, ...secondaryTools].map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-rose-50 text-rose-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                {item.isAI && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
