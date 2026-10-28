'use client';

import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  SlidersHorizontal,
  Search,
  Check
} from 'lucide-react';
import { useEventContext } from '@/context/EventContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Vendor } from '@/types/event';
import { formatCurrency } from '@/lib/planning/budgetEngine';

export default function VendorsPage() {
  const { currentPlan, updateVendor, addVendor } = useEventContext();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Vendor Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Venue');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [services, setServices] = useState('');

  const categories = ['all', ...Array.from(new Set(currentPlan.vendors.map((v) => v.category)))];

  const filteredVendors = currentPlan.vendors.filter((v) => {
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.servicesOffered?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(quotedPrice);
    if (!name || isNaN(price) || price < 0) return;

    addVendor({
      name,
      category,
      quotedPrice: price,
      contactPhone: phone || undefined,
      contactEmail: email || undefined,
      location: location || undefined,
      servicesOffered: services || undefined,
      quoteStatus: 'received',
      bookingStatus: 'tentative',
      paymentStatus: 'unpaid',
      isDemo: true,
      notes: 'Demo Data: Added by user',
    });

    setName('');
    setQuotedPrice('');
    setPhone('');
    setEmail('');
    setLocation('');
    setServices('');
    setShowAddModal(false);
  };

  const handleStatusChange = (vendor: Vendor, status: Vendor['bookingStatus']) => {
    updateVendor({
      ...vendor,
      bookingStatus: status,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div>
          <Badge variant="purple" className="mb-1">Vendor Procurement & Quotes</Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Vendor Workspace & Comparisons
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare vendor quotes side-by-side, manage booking lifecycle states, and track real commitments.
          </p>
        </div>

        <Button size="sm" variant="gradient" onClick={() => setShowAddModal(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Vendor Quote
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-stone-200 shadow-soft-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-500 mr-1 flex items-center gap-1 font-semibold">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-colors capitalize font-semibold ${
                categoryFilter === cat
                  ? 'bg-violet-50 text-violet-900 border-violet-200'
                  : 'text-slate-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendors..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id} className="flex flex-col justify-between hover:shadow-soft-lg transition-all duration-200">
            <div>
              <CardHeader className="pb-3">
                <div>
                  <Badge variant="purple" className="text-[10px] mb-1 capitalize">
                    {vendor.category}
                  </Badge>
                  <CardTitle className="text-base font-bold text-slate-900 leading-snug">
                    {vendor.name}
                  </CardTitle>
                </div>
                {vendor.isDemo && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-slate-500 font-bold border border-stone-200">
                    Demo
                  </span>
                )}
              </CardHeader>

              <CardContent className="space-y-3 pt-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Quoted Amount:</span>
                  <span className="text-sm font-black text-emerald-700">
                    {formatCurrency(vendor.quotedPrice, currentPlan.event.currency)}
                  </span>
                </div>

                {vendor.servicesOffered && (
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {vendor.servicesOffered}
                  </p>
                )}

                <div className="space-y-1.5 pt-2 border-t border-stone-100 text-slate-500 font-medium">
                  {vendor.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{vendor.location}</span>
                    </div>
                  )}
                  {vendor.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{vendor.contactPhone}</span>
                    </div>
                  )}
                  {vendor.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{vendor.contactEmail}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </div>

            {/* Booking State Actions */}
            <div className="p-4 border-t border-stone-100 bg-stone-50/50 rounded-b-2xl flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Status:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleStatusChange(vendor, 'confirmed')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    vendor.bookingStatus === 'confirmed'
                      ? 'bg-emerald-600 text-white shadow-soft-sm'
                      : 'bg-white text-slate-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => handleStatusChange(vendor, 'tentative')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    vendor.bookingStatus === 'tentative'
                      ? 'bg-amber-500 text-white shadow-soft-sm'
                      : 'bg-white text-slate-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  Tentative
                </button>
                <button
                  onClick={() => handleStatusChange(vendor, 'cancelled')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    vendor.bookingStatus === 'cancelled'
                      ? 'bg-rose-600 text-white shadow-soft-sm'
                      : 'bg-white text-slate-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal: Add Vendor Quote */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-soft-lg">
            <h3 className="text-base font-bold text-slate-900">Add Vendor Quote</h3>
            <form onSubmit={handleCreateVendor} className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Chennai Sound & Light Engineers"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="E.g., Music, Decor, Catering"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Quoted Price ({currentPlan.event.currency})</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                    placeholder="45000"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Services Offered</label>
                <input
                  type="text"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="E.g., 5-piece acoustics, morning & evening audio"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98400 11223"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Chennai"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" size="sm">
                  Save Quote
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
