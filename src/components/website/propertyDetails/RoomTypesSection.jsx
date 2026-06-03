import React, { useState } from 'react';
import { Check, Info, Users, Bed, ChevronRight, Image as ImageIcon, Star } from 'lucide-react';
import RoomImageModal from './RoomImageModal';

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function RoomTypesSection({ roomTypes = [] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  if (!roomTypes || roomTypes.length === 0) return null;

  const handleImageClick = (room) => {
    setSelectedRoom(room);
    setModalOpen(true);
  };

  return (
    <div className="py-8 bg-white" style={{ borderBottom: '1px solid #f0f0f0' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#222]">Choose your room</h2>
      </div>

      <div className="space-y-6">
        {roomTypes.map((room, idx) => (
          <div 
            key={idx} 
            className="border border-[#e0e0e0] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Optional Banner */}
            {idx === 0 && (
              <div className="bg-[#5a5c7c] py-1.5 px-4 flex items-center gap-2">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Most Popular</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row">
              {/* Left Side: Room Details */}
              <div className="flex-1 p-5 md:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#222] flex items-center gap-2">
                      {room.type}
                      <div className="w-5 h-5 bg-[#2ecc71] rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    </h3>
                    <p className="text-xs text-[#6d787d] mt-1 flex items-center gap-2">
                      <Info size={12} /> {room.desc || "Fully furnished spacious room"}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#222] bg-[#f8f9fa] px-3 py-1.5 rounded-full border border-[#eee]">
                    <Users size={14} className="text-[#6d787d]" />
                    {room.occupancy === 1 ? "Single Occupancy" : `${room.occupancy} Sharing`}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#222] bg-[#f8f9fa] px-3 py-1.5 rounded-full border border-[#eee]">
                    <Bed size={14} className="text-[#6d787d]" />
                    {room.totalBeds} Beds Total
                  </div>
                </div>

                {/* Mini Amenities */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {["Attached Washroom", "Study Table", "WiFi", "Individual Locker"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-[#222]">
                      <div className="w-4 h-4 rounded-full border border-[#e0e0e0] flex items-center justify-center">
                        <Check size={10} className="text-[#2ecc71]" />
                      </div>
                      {item}
                    </div>
                  ))}
                  <button className="text-[11px] font-bold text-[#EE4266] hover:underline">+4 more</button>
                </div>

                {/* Price and Actions for Mobile (shown below info) */}
                <div className="md:hidden mt-6 pt-5 border-t border-[#f0f0f0] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#6d787d] uppercase font-bold tracking-wider">Starts from</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-[#222]">₹{room.pricePerBed || room.pricePerRoom}</span>
                      <span className="text-[11px] text-[#6d787d]">/ month</span>
                    </div>
                  </div>
                  <button className="px-6 py-2.5 bg-[#EE4266] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#d63a5b] transition-colors">
                    Select
                  </button>
                </div>
              </div>

              {/* Right Side: Image & Desktop CTA */}
              <div className="w-full md:w-[320px] bg-[#f8f9fa] p-4 md:p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#eee]">
                {/* Image Placeholder/Thumbnail */}
                <div 
                  className="relative aspect-[4/3] rounded-lg overflow-hidden mb-5 group bg-white shadow-sm border border-[#e0e0e0] cursor-pointer"
                  onClick={() => handleImageClick(room)}
                >
                  {room.images && room.images.length > 0 ? (
                    <img src={room.images[0]} alt={room.type} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#ccd6dd]">
                      <ImageIcon size={32} />
                      <span className="text-[10px] uppercase font-black mt-2">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 p-2 rounded-full shadow-lg">
                      <ImageIcon size={20} className="text-[#EE4266]" />
                    </div>
                  </div>
                  {room.images && room.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[9px] font-black flex items-center gap-1.5 shadow-lg">
                       <ImageIcon size={10} /> {room.images.length} PHOTOS
                    </div>
                  )}
                </div>

                {/* Desktop Pricing & Button */}
                <div className="hidden md:block">
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-[#222]">₹{room.pricePerBed || room.pricePerRoom}</span>
                    <span className="text-[11px] text-[#6d787d] font-bold">/ month</span>
                  </div>
                  
                  {room.totalRooms === "0" ? (
                    <button className="w-full py-3 bg-gray-200 text-gray-500 rounded-xl font-bold text-sm cursor-not-allowed">
                      Sold Out
                    </button>
                  ) : (
                    <button className="w-full py-3 bg-[#EE4266] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#d63a5b] transition-all transform active:scale-[0.98]">
                      Select Room
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Room Image Modal */}
      {selectedRoom && (
        <RoomImageModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          roomType={selectedRoom.type}
          images={selectedRoom.images}
        />
      )}
    </div>
  );
}
