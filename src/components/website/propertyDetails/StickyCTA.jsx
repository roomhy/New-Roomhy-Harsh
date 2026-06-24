import { Phone, Mail, Navigation, Shield, Zap, BadgePercent, Users } from "lucide-react";

export default function StickyCTA({ property, onBookNow }) {
  if (!property) return null;

  const price = property.price || 0;
  const discountPercent = parseInt(property.discountPercent) || 0;
  const originalPrice = discountPercent > 0 
    ? Math.round(price / (1 - (discountPercent / 100)))
    : Math.round(price * 1.1);
  const discount = discountPercent;

  return (
    <>
      {/* ==================== MOBILE STICKY BOTTOM CTA ==================== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-gray-900">₹{price}</span>
              {discount > 0 && (
                <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {discount > 0 && (
                <span className="text-xs font-semibold text-green-600">{discount}% off</span>
              )}
              <span className="text-[10px] text-gray-400">per month</span>
            </div>
          </div>
          <button
            onClick={onBookNow || (() => { if (property.ownerPhone) window.location.href = `tel:${property.ownerPhone}`; })}
            className="px-8 py-3 bg-[#EE4266] text-white font-bold rounded-lg text-sm hover:bg-[#d63a5b] active:scale-[0.97] transition-all"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* ==================== DESKTOP STICKY SIDEBAR — OYO Style ==================== */}
      <div className="hidden md:block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#e8e8e8]">
          
          {/* 1. Top Offer Banner — OYO style premium */}
          {discount > 0 && (
            <div className="px-5 py-3.5 flex items-center justify-center gap-2" style={{ background: '#EE4266' }}>
              <Zap size={16} className="text-yellow-300 fill-yellow-300" />
              <span className="text-white text-xs font-black uppercase tracking-[0.05em]">
                Save up to {discount}% — Direct Booking
              </span>
            </div>
          )}

          {/* 2. Price Section */}
          <div className="px-7 py-8 border-b border-gray-100">
            <div className="flex items-baseline gap-2">
              <span className="text-[36px] font-black text-[#222]">₹{price}</span>
              {discount > 0 && (
                <span className="text-lg text-[#6d787d] line-through decoration-gray-400">₹{originalPrice}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {discount > 0 && (
                <span className="text-sm font-bold text-[#1ab64f] bg-[#1ab64f]/10 px-2 py-0.5 rounded">
                  {discount}% OFF
                </span>
              )}
              <span className="text-sm text-[#6d787d] font-medium">per month</span>
            </div>
          </div>

          {/* 3. Pricing Breakdown */}
          <div className="px-7 py-6 space-y-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between text-sm">
              <span className="text-[#6d787d] font-medium">Base Rent</span>
              <span className="text-[#222] font-bold">₹{originalPrice}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#1ab64f] font-bold flex items-center gap-1.5">
                  <BadgePercent size={15} />
                  Direct Discount
                </span>
                <span className="text-[#1ab64f] font-bold">-₹{originalPrice - price}</span>
              </div>
            )}
            <div className="pt-4 mt-2 flex justify-between border-t border-dashed border-gray-300">
              <span className="text-[#222] font-extrabold text-base">Total Amount</span>
              <span className="text-[#222] font-black text-2xl">₹{price}</span>
            </div>
          </div>

          {/* 4. Booking Action */}
          <div className="px-7 py-8 space-y-4">
            <button
              onClick={onBookNow || (() => { if (property.ownerPhone) window.location.href = `tel:${property.ownerPhone}`; })}
              className="w-full py-4 bg-[#EE4266] text-white font-black rounded-md text-base shadow-[0_4px_15px_rgba(238,66,102,0.3)] hover:bg-[#d63a5b] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Book Now
            </button>

            {/* Urgency indicators */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-[#EE4266] bg-[#EE4266]/5 px-3 py-2 rounded-lg">
                <Zap size={14} className="fill-[#EE4266]" />
                <span className="text-[11px] font-bold uppercase tracking-wide">
                  {Math.floor(Math.random() * 10) + 5} people viewed this in last 24 hours
                </span>
              </div>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <Shield size={14} className="fill-green-600" />
                <span className="text-[11px] font-bold uppercase tracking-wide">
                  Free cancellation available
                </span>
              </div>
            </div>
          </div>

          {/* 5. Why Roomhy? — Increases height and trust */}
          <div className="px-7 py-6 border-t border-gray-100 bg-[#fcfcfc]">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Why choose this stay?</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Shield size={16} className="text-[#EE4266]" />
                <span className="text-xs font-bold text-gray-800">Verified Property</span>
              </div>
              <div className="flex flex-col gap-1">
                <Zap size={16} className="text-[#EE4266]" />
                <span className="text-xs font-bold text-gray-800">Instant Booking</span>
              </div>
              <div className="flex flex-col gap-1">
                <BadgePercent size={16} className="text-[#EE4266]" />
                <span className="text-xs font-bold text-gray-800">Best Price</span>
              </div>
              <div className="flex flex-col gap-1">
                <Phone size={16} className="text-[#EE4266]" />
                <span className="text-xs font-bold text-gray-800">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* 6. Owner Quick Info */}
          <div className="px-7 py-6 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Owner</p>
                <p className="text-sm text-gray-900 font-bold">{property.owner}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {property.ownerPhone && (
                <a
                  href={`tel:${property.ownerPhone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-200 text-gray-700 font-bold text-xs hover:border-[#EE4266] hover:text-[#EE4266] transition-all"
                >
                  <Phone size={14} /> Call
                </a>
              )}
              {property.ownerEmail && (
                <a
                  href={`mailto:${property.ownerEmail}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-200 text-gray-700 font-bold text-xs hover:border-[#EE4266] hover:text-[#EE4266] transition-all"
                >
                  <Mail size={14} /> Email
                </a>
              )}
            </div>
          </div>

          {/* 7. Location Shortcut */}
          {property.latitude && property.longitude && (
            <div className="h-32 relative group">
              <iframe
                src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=14&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Property Location"
                className="grayscale-[0.5] group-hover:grayscale-0 transition-all"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent pointer-events-none transition-all" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-max">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1.5 hover:bg-white transition-all"
                >
                  <Navigation size={12} className="text-[#EE4266]" />
                  Open in Maps
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
