import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function RoomImageModal({ isOpen, onClose, roomType, images = [] }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen) return null;

  const handlePrev = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/10">
        <div>
          <h2 className="text-white text-lg font-bold">{roomType}</h2>
          <p className="text-white/50 text-xs font-medium">{selectedImageIndex + 1} / {images.length} Photos</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {images.length > 1 && (
          <button 
            onClick={handlePrev}
            className="absolute left-4 z-10 p-4 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        <img 
          src={images[selectedImageIndex]} 
          alt={`${roomType} view ${selectedImageIndex + 1}`}
          className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
        />

        {images.length > 1 && (
          <button 
            onClick={handleNext}
            className="absolute right-4 z-10 p-4 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Thumbnails Strip */}
      {images.length > 1 && (
        <div className="bg-black/40 p-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-3 overflow-x-auto no-scrollbar max-w-4xl mx-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImageIndex === idx 
                    ? 'border-[#EE4266] scale-110 shadow-lg' 
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
