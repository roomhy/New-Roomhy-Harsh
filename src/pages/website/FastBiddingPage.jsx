import { useState, useEffect, useMemo } from 'react';
import { Zap, ArrowLeft, Send, Loader, Heart, CheckCircle, X, Shield, Info } from 'lucide-react';
import WebsiteNavbar from "../../components/website/WebsiteNavbar";
import WebsiteFooter from "../../components/website/WebsiteFooter";
import MobileBottomNav from "../../components/website/MobileBottomNav";
import { fetchCities, fetchAreas, fetchProperties, submitBid } from '../../utils/api';
import { getWebsiteUser, getWebsiteUserId, getWebsiteUserName, getWebsiteUserEmail, isWebsiteLoggedIn } from '../../utils/websiteSession';

const defaultCities = [
  { _id: 'kota', name: 'Kota, Rajasthan' },
  { _id: 'indore', name: 'Indore, Madhya Pradesh' },
  { _id: 'sikar', name: 'Sikar, Rajasthan' },
  { _id: 'pune', name: 'Pune, Maharashtra' },
  { _id: 'delhi', name: 'Delhi' }
];

export default function FastBiddingPage() {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  const [form, setForm] = useState({
    fullName: '',
    gmail: '',
    gender: '',
    city: '',
    area: '',
    minPrice: '',
    maxPrice: ''
  });

  const apiUrl = useMemo(() => {
    return import.meta.env?.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5001'
      : 'https://roohmy-backend-xwa9.vercel.app');
  }, []);

  // Load user data if logged in
  useEffect(() => {
    const user = getWebsiteUser();
    if (user) {
      setForm(prev => ({
        ...prev,
        fullName: getWebsiteUserName() || '',
        gmail: getWebsiteUserEmail() || ''
      }));
    }
  }, []);

  // Load cities
  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await fetchCities();
        setCities(data.length > 0 ? data : defaultCities);
      } catch {
        setCities(defaultCities);
      }
    };
    loadCities();
  }, []);

  // Load areas when city changes
  useEffect(() => {
    const loadAreas = async () => {
      if (!form.city) {
        setAreas([]);
        return;
      }
      try {
        const allAreas = await fetchAreas();
        const filtered = allAreas.filter(a => a.city?._id === form.city || a.city === form.city);
        setAreas(filtered.length > 0 ? filtered : []);
      } catch {
        setAreas([]);
      }
    };
    loadAreas();
  }, [form.city]);

  // Load and filter properties
  useEffect(() => {
    const loadProperties = async () => {
      if (!form.area) {
        setProperties([]);
        return;
      }
      setLoading(true);
      try {
        const allProperties = await fetchProperties();
        const selectedArea = areas.find(a => (a._id || a.id) === form.area);
        const areaName = selectedArea?.name?.toLowerCase()?.trim() || '';
        const gender = form.gender.toLowerCase();
        const minPrice = parseInt(form.minPrice || 0);
        const maxPrice = parseInt(form.maxPrice || 0);

        console.log('Filtering properties:', {
          totalProperties: allProperties.length,
          areaName,
          gender,
          minPrice,
          maxPrice
        });

        let rejectionReasons = { area: 0, gender: 0, rent: 0 };
        
        const filtered = allProperties.filter((prop, index) => {
          const propName = prop.propertyName || prop.property_name || `Property ${index}`;
          const propArea = (prop.locality || prop.propertyInfo?.area || '').toString().toLowerCase().trim();
          const areaMatch = areaName ? (propArea.includes(areaName) || areaName.includes(propArea)) : true;
          
          if (!areaMatch) {
            if (index < 3) console.log(`❌ ${propName}: Area mismatch - propArea: "${propArea}", looking for: "${areaName}"`);
            rejectionReasons.area++;
            return false;
          }

          if (gender) {
            const propGender = (prop.gender || prop.propertyInfo?.gender || '').toString().toLowerCase();
            const genderMatch = propGender.includes('co-ed') || propGender.includes(gender) || gender.includes(propGender);
            if (propGender && !genderMatch) {
              if (index < 3) console.log(`❌ ${propName}: Gender mismatch - propGender: "${propGender}", looking for: "${gender}"`);
              rejectionReasons.gender++;
              return false;
            }
          }

          if (minPrice || maxPrice) {
            const rawRent = prop.monthlyRent || prop.rent || prop.propertyInfo?.rent || 0;
            const rent = parseInt(rawRent);
            const rentInRange = (!minPrice || rent >= minPrice) && (!maxPrice || maxPrice === 50000 || rent <= maxPrice);
            
            console.log(`${rentInRange ? '✅' : '❌'} ${propName}: Rent ${rent} (raw: ${rawRent}) - Range: ${minPrice}-${maxPrice}`);
            
            if (!rentInRange) {
              rejectionReasons.rent++;
              return false;
            }
          }
          return true;
        });
        
        console.log('Rejection summary:', rejectionReasons);

        console.log('Filtered properties:', filtered.length);

        setProperties(filtered);
      } catch (error) {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, [form.area, form.gender, form.minPrice, form.maxPrice, areas]);

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const toggleProperty = (propertyId) => {
    setSelectedIds(prev => {
      if (prev.includes(propertyId)) return prev.filter(id => id !== propertyId);
      return [...prev, propertyId];
    });
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return false;
    if (!form.gmail.trim() || !form.gmail.includes('@')) return false;
    if (!form.gender) return false;
    if (!form.city || !form.area) return false;
    if (!form.minPrice || !form.maxPrice) return false;
    if (parseInt(form.minPrice) > parseInt(form.maxPrice)) return false;
    return true;
  };

  const submitBids = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill in all required fields correctly');
      return;
    }

    if (!isWebsiteLoggedIn()) {
      alert('Please login to submit bids');
      window.location.href = '/login';
      return;
    }

    if (selectedIds.length === 0) {
      alert('Please select at least one property to bid on');
      return;
    }

    const userId = getWebsiteUserId();
    const selectedCity = cities.find(c => (c._id || c.id) === form.city);
    const selectedArea = areas.find(a => (a._id || a.id) === form.area);
    const bidMin = parseInt(form.minPrice || 0);
    const bidMax = parseInt(form.maxPrice || 0);

    let successCount = 0;
    for (const propertyId of selectedIds) {
      try {
        const property = properties.find(p => p._id === propertyId);
        if (!property) continue;

        const ownerId = property.generatedCredentials?.loginId || property.ownerLoginId || property.createdBy;
        if (!ownerId) continue;

        await submitBid({
          property_id: propertyId,
          property_name: property.property_name || property.propertyInfo?.name || 'Property',
          area: property.locality || property.propertyInfo?.area || '',
          property_type: property.propertyType || property.propertyInfo?.propertyType || 'Property',
          rent_amount: parseInt(property.monthlyRent || property.rent || 0),
          user_id: userId,
          owner_id: ownerId,
          name: form.fullName,
          email: form.gmail,
          phone: '',
          request_type: 'bid',
          bid_min: bidMin > 0 ? bidMin : null,
          bid_max: bidMax > 0 ? bidMax : null,
          filter_criteria: {
            gender: form.gender,
            city_id: form.city,
            city: selectedCity?.name || '',
            area_id: form.area,
            area: selectedArea?.name || '',
            min_price: bidMin > 0 ? bidMin : null,
            max_price: bidMax > 0 ? bidMax : null
          },
          message: `Looking for property with rent Rs ${form.minPrice}-${form.maxPrice}, Gender: ${form.gender}`
        });
        successCount++;
      } catch (err) {
        console.error('Failed to submit bid for property:', propertyId);
      }
    }

    setSuccessCount(successCount);
    setShowSuccessModal(true);
    setSelectedIds([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WebsiteNavbar />

      <header className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/website/index" className="font-bold text-xl text-blue-600 flex items-center gap-2">
            <Zap className="w-6 h-6" /> Roomhy Fast Bidding
          </a>
          <a href="/website/index" className="text-gray-600 hover:text-blue-600 inline-flex items-center text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Bidding Form</h1>
          <p className="text-gray-600">Fill in your details to find matching properties and send bids to multiple owners</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 mb-8">
          <form onSubmit={submitBids}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  value={form.fullName}
                  onChange={handleFormChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Email Address *</label>
                <input
                  type="email"
                  id="gmail"
                  value={form.gmail}
                  onChange={handleFormChange}
                  placeholder="your.email@gmail.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Gender *</label>
              <select
                id="gender"
                value={form.gender}
                onChange={handleFormChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Select City *</label>
                <select
                  id="city"
                  value={form.city}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a city</option>
                  {cities.map(city => (
                    <option key={city._id || city.id} value={city._id || city.id}>
                      {city.name || city.cityName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Select Area *</label>
                <select
                  id="area"
                  value={form.area}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!form.city}
                >
                  <option value="">{form.city ? 'Select an area' : 'First select a city'}</option>
                  {areas.map(area => (
                    <option key={area._id || area.id} value={area._id || area.id}>
                      {area.name || area.areaName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Minimum Price (₹) *</label>
                <input
                  type="number"
                  id="minPrice"
                  value={form.minPrice}
                  onChange={handleFormChange}
                  placeholder="Min price"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1000"
                  step="500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Maximum Price (₹) *</label>
                <input
                  type="number"
                  id="maxPrice"
                  value={form.maxPrice}
                  onChange={handleFormChange}
                  placeholder="Max price"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1000"
                  step="500"
                  required
                />
              </div>
            </div>

            {/* Properties List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Properties Found in Your Area</h3>
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                  <span className="ml-2 text-gray-600">Loading properties...</span>
                </div>
              )}
              {!loading && properties.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <p>No properties found. Try adjusting your filters.</p>
                </div>
              )}
              <div className="space-y-3">
                {properties.map(prop => {
                  const propertyId = prop._id;
                  const propertyName = prop.property_name || prop.propertyInfo?.name || `Property ${propertyId}`;
                  const rent = prop.monthlyRent || prop.rent || prop.propertyInfo?.rent || 0;
                  const gender = prop.gender || prop.propertyInfo?.gender || 'Not specified';
                  const propertyType = prop.propertyType || prop.propertyInfo?.propertyType || 'Property';
                  const isSelected = selectedIds.includes(propertyId);

                  return (
                    <div
                      key={propertyId}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => toggleProperty(propertyId)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{propertyName}</h4>
                          <p className="text-sm text-gray-600 mt-1">#{propertyId}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-gray-600"><strong>₹{rent.toLocaleString()}</strong>/month</span>
                            <span className="text-gray-600">{gender}</span>
                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">{propertyType}</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-blue-600 rounded"
                          checked={isSelected}
                          onChange={() => toggleProperty(propertyId)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setForm({ fullName: '', gmail: '', gender: '', city: '', area: '', minPrice: '', maxPrice: '' });
                  setSelectedIds([]);
                }}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Form
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-5 h-5" />
                Send Bids ({selectedIds.length})
              </button>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">How It Works</h4>
                <p className="text-sm text-blue-800">Your bid will be sent to all property owners matching your criteria. Owners will review and can accept or counter your bid.</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex gap-3">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Secure & Safe</h4>
                <p className="text-sm text-green-800">Your phone number will only be shared after the owner accepts your bid. No direct contact until agreement.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="mb-20">
        <WebsiteFooter />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bid Sent Successfully!</h2>
              <p className="text-gray-600 text-sm">Your bid has been sent to property owners.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600"><strong>Bids sent to:</strong> {successCount} properties</p>
              <p className="text-xs text-gray-500 mt-2">Property owners will review your bid and respond within 24 hours.</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
