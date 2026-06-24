import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, MapPin, Zap, Send, Loader, Info, Shield, Locate, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { fetchCities, fetchAreas, fetchJson } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LocationMapPicker from './LocationMapPicker';

export default function FastBiddingModal({ isOpen, onClose, initialData = {} }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [toast, setToast] = useState(null);
  // Cache all properties after first fetch — never refetch
  const [allProperties, setAllProperties] = useState([]);
  const propertiesFetched = useRef(false);

  const apiUrl = useMemo(() => (
    import.meta.env?.VITE_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5001'
      : 'https://roohmy-backend-xwa9.vercel.app')
  ), []);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    area: '',
    priceRange: '',
    locationName: '',
    latitude: null,
    longitude: null,
    gender: 'Any'
  });

  // Fetch properties ONCE when modal first opens
  useEffect(() => {
    if (!isOpen || propertiesFetched.current) return;
    propertiesFetched.current = true;
    fetchJson(`${apiUrl}/api/approved-properties/public/approved`)
      .then(data => {
        let all = Array.isArray(data) ? data : data?.properties || [];
        all = all.filter(p => p.isLiveOnWebsite === true || p.status === 'live' || p.status === 'approved');
        setAllProperties(all);
      })
      .catch(() => setAllProperties([]));
  }, [isOpen, apiUrl]);

  // Reset cache when modal closes so next open gets fresh data
  useEffect(() => {
    if (!isOpen) {
      propertiesFetched.current = false;
    }
  }, [isOpen]);

  // Filter locally — no API call
  const filteredProperties = useMemo(() => {
    return allProperties.filter(prop => {
      const propInfo = prop.propertyInfo || {};
      const propArea = (prop.locality || propInfo.area || '').toLowerCase().trim();

      if (form.area && propArea) {
        const areaLower = form.area.toLowerCase();
        if (!propArea.includes(areaLower) && !areaLower.includes(propArea)) return false;
      }

      if (form.latitude && form.longitude && prop.latitude && prop.longitude) {
        if (calculateDistance(form.latitude, form.longitude, prop.latitude, prop.longitude) > 10) return false;
      }

      if (form.priceRange) {
        const range = parsePriceRange(form.priceRange);
        const rent = parseInt(prop.monthlyRent || prop.rent || propInfo.rent || 0, 10);
        if (Number.isFinite(rent) && rent > 0) {
          if (range.max && rent > range.max + 3000) return false;
          if (range.min && rent < range.min - 3000) return false;
        }
      }

      if (form.gender && form.gender !== 'Any') {
        const propGender = (prop.gender || propInfo.gender || prop.genderSuitability || '').toLowerCase();
        if (propGender && !propGender.includes('co-ed') && !propGender.includes(form.gender.toLowerCase())) return false;
      }

      return true;
    });
  }, [allProperties, form.area, form.priceRange, form.gender, form.latitude, form.longitude]);

  // Auto-fill from user context or initialData
  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated && user) {
        setForm(prev => ({
          ...prev,
          fullName: user.name || user.firstName || prev.fullName,
          email: user.email || prev.email,
          phone: user.phone || prev.phone
        }));
      }
      if (initialData.city) setForm(prev => ({ ...prev, city: initialData.city }));
      if (initialData.area) setForm(prev => ({ ...prev, area: initialData.area }));
      if (initialData.priceRange) setForm(prev => ({ ...prev, priceRange: initialData.priceRange }));
      if (initialData.gender) setForm(prev => ({ ...prev, gender: initialData.gender || 'Any' }));
    }
  }, [isOpen, isAuthenticated, user, initialData]);

  // Load cities once
  useEffect(() => {
    fetchCities().then(setCities).catch(() => {});
  }, []);

  // Load areas when city changes
  useEffect(() => {
    if (!form.city) { setAreas([]); return; }
    
    // Find selected city object to get its ID
    const selectedCityObj = cities.find(c => (typeof c === 'object' ? c.name : c) === form.city);
    const selectedCityId = selectedCityObj?._id || selectedCityObj?.id || '';

    fetchAreas()
      .then(allAreas => {
        const cityLower = form.city.toLowerCase().trim();
        const filtered = allAreas.filter(a => {
          if (typeof a === 'string') return a.toLowerCase().startsWith(cityLower);
          
          const cityName = (a.cityName || a.city?.name || '').toLowerCase().trim();
          const cityIdStr = (a.cityId || a.city?._id || a.city || '').toString();

          return cityName === cityLower || 
                 cityName.includes(cityLower) || 
                 (selectedCityId && cityIdStr === selectedCityId);
        });
        setAreas(filtered.map(a => typeof a === 'string' ? a : (a.name || a.areaName || '')));
      })
      .catch(() => setAreas([]));
  }, [form.city, cities]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (loc) => {
    setForm(prev => ({
      ...prev,
      locationName: loc.location,
      latitude: loc.latitude,
      longitude: loc.longitude
    }));
    setShowMapPicker(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    if (filteredProperties.length === 0) {
      showToast('No properties found matching your criteria. We will notify you when something matches!', 'warning');
      return;
    }

    // Show success immediately, send all bids in parallel in background
    showToast(`Sending bids to ${filteredProperties.length} matching properties!`, 'success');
    onClose();

    const userId = user.loginId || user._id || user.id || '';
    const range = parsePriceRange(form.priceRange);

    const bidRequests = filteredProperties
      .map((prop, index) => {
        const propInfo = prop.propertyInfo || {};
        const propertyId = prop._id || prop.propertyNumber || `property-${index}`;
        const ownerId =
          (prop.generatedCredentials && prop.generatedCredentials.loginId) ||
          prop.ownerLoginId ||
          prop.createdBy ||
          prop.owner ||
          prop.propertyOwnerId ||
          prop.owner_id;

        if (!ownerId) return null;

        return fetch(`${apiUrl}/api/booking/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: propertyId,
            property_name: prop.property_name || propInfo.name || 'Property',
            area: prop.locality || propInfo.area || '',
            property_type: prop.propertyType || propInfo.propertyType || 'PG',
            rent_amount: parseInt(prop.monthlyRent || prop.rent || propInfo.rent || 0, 10),
            user_id: userId,
            owner_id: ownerId,
            name: form.fullName,
            email: form.email,
            phone: form.phone,
            request_type: 'bid',
            bid_min: range.min || null,
            bid_max: range.max || null,
            message: `Flexible Bid: ${form.priceRange}. Preferred Location: ${form.locationName || 'Nearby'}. Gender: ${form.gender}`,
            latitude: form.latitude,
            longitude: form.longitude,
            filter_criteria: {
              priceRange: form.priceRange,
              location: form.locationName,
              city: form.city,
              area: form.area,
              gender: form.gender
            }
          })
        }).catch(() => null);
      })
      .filter(Boolean);

    // Fire all bids simultaneously
    Promise.allSettled(bidRequests);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

        {/* Login Required Prompt Overlay */}
        {showLoginPrompt && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
            <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center">
              <div className="w-16 h-16 rounded-full bg-[#EE4266]/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-[#EE4266]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
              <p className="text-gray-500 text-sm mb-6">Please login to your account to place a bid and connect with property owners.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowLoginPrompt(false); onClose(); navigate('/website/login'); }}
                  className="flex-1 py-2.5 rounded-lg bg-[#EE4266] text-white font-bold text-sm hover:bg-[#d63a5b] transition-colors"
                >
                  Login Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-[#EE4266] to-[#FF6B6B] p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 fill-white" /> Quick Bid Now
            </h2>
            <p className="text-white/80 text-sm mt-1">Get the best deals directly from property owners</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[80vh]">
          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-[#EE4266] px-0 py-2 transition-all outline-none font-semibold text-gray-800"
                placeholder="Your Name"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-[#EE4266] px-0 py-2 transition-all outline-none font-semibold text-gray-800"
                placeholder="Email Address"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-[#EE4266] px-0 py-2 transition-all outline-none font-semibold text-gray-800"
                placeholder="Phone Number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* City & Area */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preferred City</label>
                <div className="relative">
                  <select
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 appearance-none focus:border-[#EE4266] outline-none transition-all font-semibold"
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map(c => {
                      const cityName = typeof c === 'object' ? c.name : c;
                      return <option key={cityName} value={cityName}>{cityName}</option>;
                    })}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Area / Locality</label>
                <div className="relative">
                  <select
                    name="area"
                    value={form.area}
                    onChange={handleInputChange}
                    disabled={!form.city}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 appearance-none focus:border-[#EE4266] outline-none transition-all font-semibold disabled:opacity-50"
                  >
                    <option value="">All Areas</option>
                    {areas.map(a => {
                      const areaName = typeof a === 'object' ? a.name : a;
                      return <option key={areaName} value={areaName}>{areaName}</option>;
                    })}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Price Range & Gender */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price Range (Your Choice)</label>
                <div className="relative">
                  <input
                    type="text"
                    name="priceRange"
                    value={form.priceRange}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-12 py-3 focus:border-[#EE4266] outline-none transition-all font-semibold"
                    placeholder="e.g. 7000-10000 or < 8000"
                    required
                  />
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#EE4266]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gender Preference</label>
                <div className="flex gap-2">
                  {['Male', 'Female', 'Any'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, gender: g }))}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${
                        form.gender === g
                          ? 'bg-[#EE4266] border-[#EE4266] text-white shadow-lg shadow-[#EE4266]/30'
                          : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-8">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Specific Location (e.g. near Resonance, Kota)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={form.locationName}
                  readOnly
                  placeholder="Search location on map..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-12 py-3 font-semibold text-gray-800"
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <Locate className="w-5 h-5" /> Locate
              </button>
            </div>
            {form.latitude && (
              <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Location detected: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#EE4266] hover:bg-[#d63a5b] text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-[#EE4266]/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" /> Placing Bids...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" /> Send Bids to {filteredProperties.length > 0 ? filteredProperties.length : ''} Matching Owners
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-6 text-gray-400">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5 text-green-500" /> Direct from Owner
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                <Zap className="w-3.5 h-3.5 text-yellow-500" /> Fast Response
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                <Info className="w-3.5 h-3.5 text-blue-500" /> Negotiable
              </div>
            </div>
          </div>
        </form>
      </div>

      {showMapPicker && (
        <LocationMapPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const parsePriceRange = (str) => {
  const numbers = str.match(/\d+/g)?.map(Number);
  if (!numbers) return { min: null, max: null };
  if (str.toLowerCase().includes('less') || str.includes('<')) return { min: null, max: numbers[0] };
  if (str.toLowerCase().includes('more') || str.includes('>')) return { min: numbers[0], max: null };
  if (numbers.length >= 2) return { min: Math.min(...numbers), max: Math.max(...numbers) };
  return { min: null, max: numbers[0] };
};

const ChevronDown = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const Wallet = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);
