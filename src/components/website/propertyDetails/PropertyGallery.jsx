import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, Heart, Share2, X, ChevronRight, Camera } from "lucide-react";

export default function PropertyGallery({ images = [], propertyName = "", onBack, onShare }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const validImages = images.length > 0 ? images : [`https://picsum.photos/800/600?random=${Math.floor(Math.random() * 100)}`];

  const nextImage = useCallback(() => {
    setSelectedImage((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const prevImage = useCallback(() => {
    setSelectedImage((prev) => (prev - 1 + validImages.length) % validImages.length);
  }, [validImages.length]);

  // Keyboard navigation for fullscreen
  useEffect(() => {
    if (!showFullscreen) return;
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") setShowFullscreen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showFullscreen, nextImage, prevImage]);

  // Touch swipe handling
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextImage() : prevImage();
    }
    setTouchStart(null);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: propertyName, url: window.location.href }).catch(() => {});
    } else if (onShare) {
      onShare();
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      {/* Hero Image Section */}
      <div className="relative w-full bg-gray-900" style={{ maxHeight: '460px' }}>
        {/* Main Image */}
        <div
          className="relative w-full overflow-hidden cursor-pointer"
          style={{ aspectRatio: '16/10', maxHeight: '460px' }}
          onClick={() => setShowFullscreen(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={validImages[selectedImage]}
            alt={propertyName}
            className="w-full h-full object-cover transition-opacity duration-300"
            loading="eager"
            onError={(e) => {
              e.target.src = `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 100)}`;
            }}
          />
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
          
          {/* Top overlay controls */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); onBack?.(); }}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all active:scale-95"
              aria-label="Go back"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all active:scale-95"
                aria-label="Add to wishlist"
              >
                <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all active:scale-95"
                aria-label="Share"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Image counter badge */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium z-10">
            <Camera size={14} />
            <span>{selectedImage + 1}/{validImages.length}</span>
          </div>

          {/* Desktop navigation arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg items-center justify-center text-gray-800 hover:bg-white transition-all z-10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg items-center justify-center text-gray-800 hover:bg-white transition-all z-10"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {validImages.length > 1 && (
          <div className="flex gap-2 p-3 bg-white overflow-x-auto scrollbar-hide">
            {validImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`flex-shrink-0 w-[72px] h-[54px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  selectedImage === idx
                    ? "border-[#EE4266] ring-1 ring-[#EE4266]/30 scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img 
                  src={img} 
                  alt="" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/72/54?random=${Math.floor(Math.random() * 100)}`;
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Gallery Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 text-white">
            <button
              onClick={() => setShowFullscreen(false)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <X size={22} />
            </button>
            <span className="text-white/80 font-medium">{selectedImage + 1} / {validImages.length}</span>
            <div className="w-10" />
          </div>

          {/* Modal Image */}
          <div
            className="flex-1 flex items-center justify-center px-4 relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={validImages[selectedImage]}
              alt={propertyName}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.src = `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 100)}`;
              }}
            />
            {validImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Modal Thumbnails */}
          <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide justify-center">
            {validImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === idx
                    ? "border-white scale-110"
                    : "border-transparent opacity-40 hover:opacity-70"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
