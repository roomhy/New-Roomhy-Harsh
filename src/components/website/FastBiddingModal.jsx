import React, { useState, useEffect } from 'react';
import { X, MapPin, Zap, Send, Loader, Info, Shield, Search, Locate } from 'lucide-react';
import { fetchCities, fetchAreas, fetchProperties, submitBid } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import LocationMapPicker from './LocationMapPicker';

export default function FastBiddingModal({ isOpen, onClose, initialData = {} }) {
  const { user, isAuthenticated } = useAuth();
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [matchingProperties, setMatchingProperties] = useState([]);
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    area: '',
    priceRange: '', // e.g., "7000-10000" or "less than 8000"
    locationName: '',
    latitude: null,
    longitude: null,
    gender: 'Any'
  });

  const [matchCount, setMatchCount] = useState(0);

  // Update match count whenever filters change
  useEffect(() => {
    const updateCount = async () => {
      try {
        const allProperties = await fetchProperties();
        const filtered = allProperties.filter(prop => {
          if (form.city && prop.city !== form.city) return false;
          if (form.area && !prop.area?.includes(form.area) && !prop.propertyInfo?.area?.includes(form.area)) return false;
          if (form.latitude && form.longitude && prop.latitude && prop.longitude) {
            const dist = calculateDistance(form.latitude, form.longitude, prop.latitude, prop.longitude);
            if (dist > 10) return false;
          }
          if (form.priceRange) {
            const range = parsePriceRange(form.priceRange);
            const rent = prop.monthlyRent || prop.rent || 0;
            if (range.max && rent > (range.max + 3000)) return false;
            if (range.min && rent < (range.min - 3000)) return false;
          }
          return true;
        });
        setMatchCount(filtered.length);
      } catch (err) {
        console.error('Error counting matches:', err);
      }
    };
    if (isOpen) updateCount();
  }, [form.city, form.area, form.priceRange, form.latitude, form.longitude, isOpen]);

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

  // Load cities
  useEffect(() => {
    const loadCities = async () => {
      const data = await fetchCities();
      setCities(data);
    };
    loadCities();
  }, []);

  // Load areas when city changes
  useEffect(() => {
    const loadAreas = async () => {
      if (form.city) {
        const allAreas = await fetchAreas();
        const filtered = allAreas.filter(a => 
          (typeof a === 'object' ? a.city?.name === form.city || a.city === form.city : a.startsWith(form.city))
        );
        setAreas(filtered.map(a => typeof a === 'string' ? a : a.name));
      } else {
        setAreas([]);
      }
    };
    loadAreas();
  }, [form.city]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to place a bid');
      return;
    }

    setSubmitting(true);
    try {
      // Find matching properties based on filters
      const allProperties = await fetchProperties();
      
      // Filter logic
      const filtered = allProperties.filter(prop => {
        // City match
        if (form.city && prop.city !== form.city) return false;
        
        // Area match
        if (form.area && !prop.area?.includes(form.area) && !prop.propertyInfo?.area?.includes(form.area)) return false;
        
        // Distance match if location provided (10km radius)
        if (form.latitude && form.longitude && prop.latitude && prop.longitude) {
          const dist = calculateDistance(form.latitude, form.longitude, prop.latitude, prop.longitude);
          if (dist > 10) return false;
        }

        // Price range match (with 3000 margin for negotiation)
        const rent = prop.monthlyRent || prop.rent || 0;
        if (form.priceRange) {
          const range = parsePriceRange(form.priceRange);
          // If user says max 10000, allow properties up to 13000 (owner might negotiate)
          if (range.max && rent > (range.max + 3000)) return false;
          // If user says min 7000, allow properties down to 4000 (owner might be okay)
          if (range.min && rent < (range.min - 3000)) return false;
        }

        return true;
      });

      if (filtered.length === 0) {
        alert('No properties found matching your criteria. We will notify you when something matches!');
      }

      // Submit bids to all matching owners
      const results = await Promise.all(filtered.map(prop => {
        const ownerId = prop.owner_id || prop.generatedCredentials?.loginId || prop.ownerLoginId;
        if (!ownerId) return null;

        const rent = prop.monthlyRent || prop.rent || 0;

        return submitBid({
          property_id: prop._id,
          property_name: prop.property_name || prop.name,
          area: prop.area || prop.propertyInfo?.area || '',
          property_type: prop.propertyType || 'PG',
          rent_amount: rent,
          user_id: user.loginId || user._id,
          owner_id: ownerId,
          name: form.fullName,
          email: form.email,
          phone: form.phone,
          request_type: 'bid',
          message: `Flexible Bid: ${form.priceRange}. Preferred Location: ${form.locationName || 'Nearby'}`,
          latitude: form.latitude,
          longitude: form.longitude,
          filter_criteria: {
            priceRange: form.priceRange,
            location: form.locationName,
            gender: form.gender
          }
        });
      }));

      alert(`Successfully sent bids to ${results.filter(Boolean).length} owners!`);
      onClose();
    } catch (error) {
      console.error('Error submitting bids:', error);
      alert('Failed to submit bids. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const parsePriceRange = (str) => {
    const numbers = str.match(/\d+/g)?.map(Number);
    if (!numbers) return { min: null, max: null };
    
    if (str.toLowerCase().includes('less') || str.includes('<')) {
      return { min: null, max: numbers[0] };
    }
    if (str.toLowerCase().includes('more') || str.includes('>')) {
      return { min: numbers[0], max: null };
    }
    if (numbers.length >= 2) {
      return { min: Math.min(...numbers), max: Math.max(...numbers) };
    }
    return { min: null, max: numbers[0] };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
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
          {/* User Details (Auto-filled) */}
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

          {/* Location Search API Mock-ish */}
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
                  <Send className="w-6 h-6" /> Send Bids to {matchCount > 0 ? matchCount : ''} Matching Owners
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

// Icons for the form
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
