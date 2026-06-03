import React, { useEffect, useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { useHtmlPage } from "../../utils/htmlPage";
import { clearOwnerRuntimeSession, getOwnerRuntimeSession } from "../../utils/propertyowner";
import { Plus, X, Upload, Camera, Gift, Check, Wifi, Wind, Droplet, Car, Dumbbell, Tv, Zap, Coffee } from "lucide-react";

export default function PropertyDetails() {
  useHtmlPage({
    title: "Roomhy - Property Details",
    bodyClass: "text-foreground",
    htmlAttrs: { lang: "en" },
    metas: [
      { charset: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" }
    ],
    links: [
      {
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
        rel: "stylesheet"
      }
    ],
    scripts: [{ src: "https://cdn.tailwindcss.com" }],
    inlineScripts: []
  });

  const [owner, setOwner] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [amenities, setAmenities] = useState([]);
  const [exclusiveBenefits, setExclusiveBenefits] = useState([]);
  const [propertyViews, setPropertyViews] = useState([]);
  const [facilities, setFacilities] = useState({
    wifi: false,
    ac: false,
    food: false,
    laundry: false,
    parking: false,
    gym: false,
    tv: false,
    powerBackup: false
  });

  // New item states
  const [newAmenity, setNewAmenity] = useState({ name: '', icon: 'check', category: 'basic' });
  const [newBenefit, setNewBenefit] = useState({ title: '', description: '', icon: 'gift' });
  const [newView, setNewView] = useState({ label: '', images: [], description: '' });

  // Available icons
  const availableIcons = [
    { value: 'check', label: 'Check', icon: Check },
    { value: 'wifi', label: 'WiFi', icon: Wifi },
    { value: 'wind', label: 'AC', icon: Wind },
    { value: 'droplet', label: 'Water', icon: Droplet },
    { value: 'car', label: 'Parking', icon: Car },
    { value: 'dumbbell', label: 'Gym', icon: Dumbbell },
    { value: 'tv', label: 'TV', icon: Tv },
    { value: 'zap', label: 'Power', icon: Zap },
    { value: 'coffee', label: 'Food', icon: Coffee },
    { value: 'gift', label: 'Gift', icon: Gift }
  ];

  useEffect(() => {
    const session = getOwnerRuntimeSession();
    if (!session?.loginId) {
      window.location.href = "/propertyowner/ownerlogin";
      return;
    }
    setOwner(session);
    fetchPropertyDetails();
  }, []);

  // Static sample data for Vercel deployment
const staticPropertyData = {
  _id: "static123",
  title: "Roomhy Boys PG - Kota",
  description: "Premium paying guest accommodation for boys near coaching centers",
  address: "Talwandi, Kota, Rajasthan 324005",
  locationCode: "KOT",
  status: "active",
  isPublished: true,
  amenities: [
    { name: "High-Speed WiFi", icon: "wifi", category: "basic" },
    { name: "Air Conditioning", icon: "wind", category: "comfort" },
    { name: "Attached Bathroom", icon: "droplet", category: "basic" },
    { name: "Study Table", icon: "check", category: "basic" },
    { name: "Power Backup", icon: "zap", category: "comfort" }
  ],
  exclusiveBenefits: [
    {
      title: "Free First Month Maintenance",
      description: "No maintenance charges for the first month",
      icon: "gift"
    },
    {
      title: "24/7 Medical Support",
      description: "On-call doctor assistance",
      icon: "shield"
    }
  ],
  propertyViews: [
    {
      label: "Facade",
      images: ["https://picsum.photos/800/600?random=1"],
      description: "Beautiful exterior"
    },
    {
      label: "Room",
      images: ["https://picsum.photos/800/600?random=2"],
      description: "Spacious rooms"
    }
  ],
  facilities: {
    wifi: true,
    ac: true,
    food: true,
    laundry: true,
    parking: false,
    gym: false,
    tv: true,
    powerBackup: true
  },
  propertyType: "pg",
  gender: "male",
  monthlyRent: 8000,
  totalRooms: 20,
  bedsPerRoom: 2
};

const fetchPropertyDetails = async () => {
    try {
      const session = getOwnerRuntimeSession();
      
      // Try API first, fallback to static data
      let data;
      try {
        const response = await fetch(`/api/properties/ensure-owner`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ownerLoginId: session.loginId })
        });
        data = await response.json();
      } catch (apiError) {
        console.warn('API failed, using static data:', apiError.message);
        data = { success: true, property: staticPropertyData };
      }
      
      if (data.success) {
        setProperty(data.property);
        setAmenities(data.property.amenities || []);
        setExclusiveBenefits(data.property.exclusiveBenefits || []);
        setPropertyViews(data.property.propertyViews || []);
        setFacilities(data.property.facilities || facilities);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      // Use static data as ultimate fallback
      setProperty(staticPropertyData);
      setAmenities(staticPropertyData.amenities);
      setExclusiveBenefits(staticPropertyData.exclusiveBenefits);
      setPropertyViews(staticPropertyData.propertyViews);
      setFacilities(staticPropertyData.facilities);
    } finally {
      setLoading(false);
    }
  };

  const savePropertyDetails = async () => {
    setSaving(true);
    try {
      const session = getOwnerRuntimeSession();
      
      // Try API first
      try {
        const response = await fetch(`/api/properties/${property._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
          },
          body: JSON.stringify({
            amenities,
            exclusiveBenefits,
            propertyViews,
            facilities
          })
        });

        const data = await response.json();
        if (data.success) {
          alert('Property details updated successfully!');
          setProperty(data.property);
        } else {
          throw new Error(data.message);
        }
      } catch (apiError) {
        console.warn('API save failed, updating local state:', apiError.message);
        // Update local state for demo purposes
        const updatedProperty = {
          ...property,
          amenities,
          exclusiveBenefits,
          propertyViews,
          facilities,
          updatedAt: new Date()
        };
        setProperty(updatedProperty);
        alert('Demo mode: Changes saved locally! (Backend not available)');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Error updating property');
    } finally {
      setSaving(false);
    }
  };

  const addAmenity = () => {
    if (newAmenity.name.trim()) {
      setAmenities([...amenities, { ...newAmenity }]);
      setNewAmenity({ name: '', icon: 'check', category: 'basic' });
    }
  };

  const removeAmenity = (index) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    if (newBenefit.title.trim()) {
      setExclusiveBenefits([...exclusiveBenefits, { ...newBenefit }]);
      setNewBenefit({ title: '', description: '', icon: 'gift' });
    }
  };

  const removeBenefit = (index) => {
    setExclusiveBenefits(exclusiveBenefits.filter((_, i) => i !== index));
  };

  const addView = () => {
    if (newView.label.trim() && newView.images.length > 0) {
      setPropertyViews([...propertyViews, { ...newView }]);
      setNewView({ label: '', images: [], description: '' });
    }
  };

  const removeView = (index) => {
    setPropertyViews(propertyViews.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e, viewType = 'new') => {
    const files = Array.from(e.target.files);
    // In production, upload to cloud storage and get URLs
    // For now, create object URLs
    const imageUrls = files.map(file => URL.createObjectURL(file));
    
    if (viewType === 'new') {
      setNewView({ ...newView, images: [...newView.images, ...imageUrls] });
    }
  };

  if (loading) {
    return (
      <PropertyOwnerLayout owner={owner} title="Property Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </PropertyOwnerLayout>
    );
  }

  return (
    <PropertyOwnerLayout
      owner={owner}
      title="Property Details"
      navVariant="property"
      onLogout={() => {
        clearOwnerRuntimeSession();
        window.location.href = "/propertyowner/ownerlogin";
      }}
      contentClassName="max-w-6xl mx-auto"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{property?.title}</h2>
              <p className="text-gray-600 mt-1">{property?.address}</p>
            </div>
            <button
              onClick={savePropertyDetails}
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Quick Facilities */}
        <div className="bg-card rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Facilities</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(facilities).map(([key, value]) => (
              <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setFacilities({ ...facilities, [key]: e.target.checked })}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Amenities Section */}
        <div className="bg-card rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Amenities</h3>
          
          {/* Add New Amenity */}
          <div className="mb-4 p-4 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Amenity name"
                value={newAmenity.name}
                onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={newAmenity.icon}
                onChange={(e) => setNewAmenity({ ...newAmenity, icon: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                {availableIcons.map(icon => (
                  <option key={icon.value} value={icon.value}>{icon.label}</option>
                ))}
              </select>
              <select
                value={newAmenity.category}
                onChange={(e) => setNewAmenity({ ...newAmenity, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="basic">Basic</option>
                <option value="comfort">Comfort</option>
                <option value="luxury">Luxury</option>
              </select>
              <button
                onClick={addAmenity}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Existing Amenities */}
          <div className="space-y-2">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {availableIcons.find(i => i.value === amenity.icon)?.icon && 
                    React.createElement(availableIcons.find(i => i.value === amenity.icon).icon, { className: "w-5 h-5 text-purple-600" })
                  }
                  <span className="font-medium">{amenity.name}</span>
                  <span className="text-sm text-gray-500 capitalize">{amenity.category}</span>
                </div>
                <button
                  onClick={() => removeAmenity(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Exclusive Benefits Section */}
        <div className="bg-card rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Exclusive Direct Benefits</h3>
          
          {/* Add New Benefit */}
          <div className="mb-4 p-4 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Benefit title"
                value={newBenefit.title}
                onChange={(e) => setNewBenefit({ ...newBenefit, title: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newBenefit.description}
                onChange={(e) => setNewBenefit({ ...newBenefit, description: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addBenefit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Benefit
              </button>
            </div>
          </div>

          {/* Existing Benefits */}
          <div className="space-y-2">
            {exclusiveBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">{benefit.title}</div>
                  {benefit.description && (
                    <div className="text-sm text-gray-600">{benefit.description}</div>
                  )}
                </div>
                <button
                  onClick={() => removeBenefit(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Property Views Section */}
        <div className="bg-card rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Property Views (Like OYO)</h3>
          
          {/* Add New View */}
          <div className="mb-4 p-4 border border-gray-200 rounded-lg">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="View label (e.g., Facade, Room, Kitchen)"
                  value={newView.label}
                  onChange={(e) => setNewView({ ...newView, label: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newView.description}
                  onChange={(e) => setNewView({ ...newView, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images for this View
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'new')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {newView.images.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {newView.images.length} image(s) selected
                  </div>
                )}
              </div>
              
              <button
                onClick={addView}
                disabled={!newView.label.trim() || newView.images.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add View
              </button>
            </div>
          </div>

          {/* Existing Views */}
          <div className="space-y-4">
            {propertyViews.map((view, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{view.label}</h4>
                  <button
                    onClick={() => removeView(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {view.description && (
                  <p className="text-sm text-gray-600 mb-2">{view.description}</p>
                )}
                <div className="text-sm text-gray-500">
                  {view.images?.length || 0} image(s)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
