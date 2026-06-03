import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProperties } from '../../utils/api';

// Same featured properties as desktop
const featuredProperties = [
  {
    name: "Sunshine PG",
    location: "Koramangala, Bangalore",
    price: "₹8,500",
    rating: 4.8,
    verified: true,
    image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    name: "Student Hub",
    location: "Powai, Mumbai",
    price: "₹12,000",
    rating: 4.9,
    verified: true,
    image: "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    name: "Campus Stay",
    location: "Vijay Nagar, Delhi",
    price: "₹7,500",
    rating: 4.7,
    verified: true,
    image: "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    name: "Scholar's Den",
    location: "Aundh, Pune",
    price: "₹9,000",
    rating: 4.6,
    verified: true,
    image: "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    name: "Study Nest",
    location: "Madivala, Bangalore",
    price: "₹8,000",
    rating: 4.5,
    verified: true,
    image: "https://images.pexels.com/photos/1571470/pexels-photo-1571470.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    name: "Academic Homes",
    location: "T-Nagar, Chennai",
    price: "₹10,500",
    rating: 4.8,
    verified: true,
    image: "https://images.pexels.com/photos/1571462/pexels-photo-1571462.jpeg?auto=compress&cs=tinysrgb&w=800"
  }
];

export default function MobilePropertiesSection() {
  const [properties, setProperties] = useState(featuredProperties);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerView = 3; // Show 3 cards at a time like OYO
  
  // Touch/swipe handling refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const allProperties = await fetchProperties();
        if (allProperties && allProperties.length > 0) {
          const mapped = allProperties.slice(0, 6).map(p => ({
            name: p.propertyName,
            location: `${p.propertyInfo?.area || p.city}, ${p.city}`,
            price: `₹${p.propertyInfo?.rent || p.monthlyRent || '8,500'}`,
            rating: 4.5 + Math.random() * 0.5,
            verified: true,
            image: p.propertyInfo?.photos?.[0] || p.propertyImage || featuredProperties[0].image
          }));
          setProperties(mapped);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  const canShowPrev = startIndex > 0;
  const canShowNext = startIndex + itemsPerView < properties.length;

  const next = () => {
    if (canShowNext) {
      setStartIndex(startIndex + itemsPerView);
    }
  };

  const prev = () => {
    if (canShowPrev) {
      setStartIndex(startIndex - itemsPerView);
    }
  };

  const visibleProperties = properties.slice(startIndex, startIndex + itemsPerView);

  // Touch/swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && canShowNext) {
      next();
    } else if (isRightSwipe && canShowPrev) {
      prev();
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (loading) {
    return (
      <section className="md:hidden bg-gray-50 py-5 px-4">
        <div className="animate-pulse">
          <div className="bg-white rounded-xl h-64 mx-auto max-w-sm"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="md:hidden bg-gray-50 py-3">
      {/* Section Header - Same as Desktop */}
      <div className="px-4 mb-2">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Trending Stays This Week</h2>
        <p className="text-xs text-gray-600">Most popular properties among students</p>
      </div>

      {/* Carousel with Navigation Arrows - Like Popular Cities */}
      <div 
        className="relative px-4"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left Arrow */}
        {canShowPrev && (
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Right Arrow */}
        {canShowNext && (
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Cards Container - Show 3 cards in grid with swipe animation - OYO Style */}
        <div className="grid grid-cols-3 gap-2">
          {visibleProperties.map((property) => (
            <div 
              key={property.name} 
              className="bg-white rounded-lg shadow overflow-hidden transform transition-all duration-300 hover:scale-105"
            >
              {/* Property Image - Smaller */}
              <div className="relative h-20">
                <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                {property.verified && (
                  <div className="absolute top-1 right-1 bg-white rounded-full px-1 py-0.5 flex items-center">
                    <BadgeCheck className="w-2 h-2 text-teal-600 mr-0.5" />
                    <span className="text-[7px] font-bold">Verified</span>
                  </div>
                )}
              </div>

              {/* Property Info - Compact OYO Style */}
              <div className="p-2">
                <h3 className="font-bold text-xs mb-1 truncate">{property.name}</h3>
                <div className="flex items-center text-gray-600 text-[8px] mb-1">
                  <MapPin className="w-2 h-2 mr-0.5" />
                  <span className="truncate">{property.location}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-teal-600">{property.price}</span>
                  <div className="flex items-center">
                    <Star className="w-2 h-2 fill-yellow-400 text-yellow-400 mr-0.5" />
                    <span className="text-[8px] font-semibold">{property.rating.toFixed(1)}</span>
                  </div>
                </div>
                <Link
                  to="/website/fast-bidding"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-1 rounded font-bold text-center block transition-colors text-[8px]"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator - Show pages instead of individual cards */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(properties.length / itemsPerView) }).map((_, pageIndex) => (
            <button
              key={pageIndex}
              onClick={() => setStartIndex(pageIndex * itemsPerView)}
              className={`w-2 h-2 rounded-full transition-all ${
                Math.floor(startIndex / itemsPerView) === pageIndex ? 'bg-teal-500 w-4' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        {/* Swipe hint text */}
        <div className="text-center mt-2 text-xs text-gray-500">
          ← Swipe to navigate →
        </div>
      </div>
    </section>
  );
}
