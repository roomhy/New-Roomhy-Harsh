import React, { useState } from 'react';
import { Wifi, Wind, Droplet, Car, Dumbbell, Tv, Zap, Coffee, Check, Gift, Star, Shield, Shirt, Home, Microwave, Refrigerator, Flame, Lock, MapPin, Briefcase, Users, GraduationCap, IndianRupee, ChevronDown, Waves } from 'lucide-react';

const CATEGORY_LABELS = {
  basic: 'Basic Amenities',
  comfort: 'Comfort Features',
  luxury: 'Luxury Features',
};

const CATEGORY_ORDER = ['basic', 'comfort', 'luxury'];

const normalizeCategory = (category) => {
  if (!category) return 'basic';
  const normalized = String(category).trim().toLowerCase();
  if (['popular', 'mostpopular', 'most_popular', 'most-popular'].includes(normalized)) return 'popular';
  if (['basic', 'amenity', 'amenities'].includes(normalized)) return 'basic';
  return normalized;
};

const AmenitiesSection = ({ amenities = [], facilities = {} }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showAll, setShowAll] = useState(false);

  const normalizeAmenity = (amenity) => {
    if (!amenity) return null;
    if (typeof amenity === 'string') {
      try {
        const parsed = JSON.parse(amenity);
        return {
          name: parsed?.name || '',
          icon: parsed?.icon || 'check',
          category: normalizeCategory(parsed?.category),
        };
      } catch (_) {
        return { name: amenity, icon: 'check', category: 'basic' };
      }
    }
    return {
      name: amenity?.name || '',
      icon: amenity?.icon || 'check',
      category: normalizeCategory(amenity?.category),
    };
  };

  const getIcon = (iconName) => {
    const normalized = String(iconName || '').toLowerCase().trim();
    const iconMap = {
      wifi: Wifi, ac: Wind, water: Droplet, parking: Car, gym: Dumbbell,
      tv: Tv, power: Zap, food: Coffee, 'map-pin': MapPin, mappin: MapPin,
      briefcase: Briefcase, users: Users, 'graduation-cap': GraduationCap,
      graduationcap: GraduationCap, 'dollar-sign': IndianRupee, dollarsign: IndianRupee,
      laundry: Shirt, washing: Shirt, housekeeping: Home, home: Home,
      microwave: Microwave, refrigerator: Refrigerator, security: Shield,
      cctv: Shield, fire: Flame, lock: Lock, check: Check, gift: Gift,
      star: Star, shield: Shield, dumbbell: Dumbbell, wind: Wind,
      droplet: Droplet, coffee: Coffee, zap: Zap
    };
    return iconMap[normalized] || inferIconFromName(iconName) || Check;
  };

  const inferIconFromName = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('metro') || lower.includes('distance') || lower.includes('location')) return MapPin;
    if (lower.includes('professional') || lower.includes('hub') || lower.includes('it')) return Briefcase;
    if (lower.includes('student')) return GraduationCap;
    if (lower.includes('coaching') || lower.includes('college')) return GraduationCap;
    if (lower.includes('friendly') || lower.includes('shared')) return Users;
    if (lower.includes('budget') || lower.includes('price')) return IndianRupee;
    if (lower.includes('wifi')) return Wifi;
    if (lower.includes('air') || lower.includes('ac')) return Wind;
    if (lower.includes('water')) return Droplet;
    if (lower.includes('parking')) return Car;
    if (lower.includes('gym')) return Dumbbell;
    if (lower.includes('tv')) return Tv;
    if (lower.includes('power')) return Zap;
    if (lower.includes('food') || lower.includes('kitchen') || lower.includes('mess')) return Coffee;
    if (lower.includes('laundry') || lower.includes('washing')) return Shirt;
    if (lower.includes('housekeeping')) return Home;
    if (lower.includes('micro')) return Microwave;
    if (lower.includes('fridge') || lower.includes('refrigerator')) return Refrigerator;
    if (lower.includes('security') || lower.includes('cctv')) return Shield;
    if (lower.includes('fire')) return Flame;
    if (lower.includes('pool')) return Waves;
    return Check;
  };

  // Flatten all amenities for OYO-style display
  const allNormalized = amenities.map(normalizeAmenity).filter(a => a?.name);
  const displayAmenities = showAll ? allNormalized : allNormalized.slice(0, 6);

  const hasAmenities = amenities.length > 0;
  const hasFacilities = Object.values(facilities).some(Boolean);

  if (!hasAmenities && !hasFacilities) {
    return null;
  }

  return (
    <div className="py-6 md:py-8" style={{ borderBottom: '1px solid #e8e8e8' }}>
      <h2 className="text-[22px] font-bold text-[#222] mb-5">Amenities</h2>

      {/* OYO-style: simple icon + label rows in a grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
        {displayAmenities.map((amenity, index) => {
          const hasGenericIcon = !amenity.icon || amenity.icon === 'check';
          const Icon = hasGenericIcon ? inferIconFromName(amenity.name) : getIcon(amenity.icon);
          return (
            <div
              key={index}
              className="flex items-center gap-3"
            >
              <Icon className="w-5 h-5 text-[#6d787d] flex-shrink-0" strokeWidth={1.5} />
              <span className="text-[15px] text-[#222]">{amenity.name}</span>
            </div>
          );
        })}
      </div>

      {/* Show More / Show Less */}
      {allNormalized.length > 6 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-5 text-[#EE4266] text-sm font-semibold hover:underline flex items-center gap-1"
        >
          {showAll ? 'Show Less' : `Show More`}
          <ChevronDown size={14} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
};

export default AmenitiesSection;
