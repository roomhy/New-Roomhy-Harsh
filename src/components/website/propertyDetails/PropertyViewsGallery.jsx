import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, ArrowLeft, Share2, Heart, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PropertyViewsGallery = ({ propertyViews = [], images = [] }) => {
  const [selectedView, setSelectedView] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showDetailedGallery, setShowDetailedGallery] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Helper to open detailed gallery at a specific category
  const openDetailedGallery = (viewIndex) => {
    console.log('🔓 openDetailedGallery called with viewIndex:', viewIndex);
    setSelectedView(viewIndex);
    setSelectedImageIndex(0);
    setShowDetailedGallery(true);
    console.log('🔓 setShowDetailedGallery(true) called, showDetailedGallery:', true);
  };

  // Use images array for main gallery, propertyViews for categories
  const galleryViews = (propertyViews && propertyViews.length > 0) 
    ? propertyViews 
    : (images && images.length > 0)
      ? [{ label: 'Photos', images: images }]
      : [];

  const currentView = galleryViews[selectedView];
  
  // Use propertyViews images for category-based display
  const currentImages = currentView?.images || images || [];
  const viewLabels = galleryViews.map(view => view.label);

  console.log('🖼️ Gallery Data Check v2:', { 
    propertyViews: propertyViews,
    images: images,
    galleryViews: galleryViews,
    viewCount: galleryViews.length, 
    currentView: viewLabels[selectedView], 
    imageCount: currentImages.length,
    selectedView: selectedView,
    selectedImageIndex: selectedImageIndex
  });
  
  // Debug: Show first few images from each source
  console.log('🔍 Image Sources Debug:');
  console.log('  images prop (first 2):', images?.slice(0, 2));
  console.log('  propertyViews first view images:', propertyViews?.[0]?.images);
  console.log('  currentImages (first 2):', currentImages?.slice(0, 2));
  console.log('  ✅ USING IMAGES ARRAY:', images && images.length > 0 ? 'YES' : 'NO');
  
  // Debug: Show if images are the same across different properties
  if (images && images.length > 0) {
    console.log(`  Property has ${images.length} images`);
    console.log(`  First image: ${images[0]}`);
    console.log(`  Second image: ${images[1] || 'No second image'}`);
    console.log(`  Third image: ${images[2] || 'No third image'}`);
    console.log(`  Fourth image: ${images[3] || 'No fourth image'}`);
  }

  const handleViewChange = (viewIndex) => {
    console.log('🔄 Switching to view:', { 
      fromIndex: selectedView, 
      toIndex: viewIndex, 
      fromView: viewLabels[selectedView], 
      toView: viewLabels[viewIndex],
      totalViews: viewLabels.length
    });
    setSelectedView(viewIndex);
    setSelectedImageIndex(0);
  };

  const handleImageChange = (direction) => {
    console.log('🖼️ Image Change:', { direction, currentLength: currentImages.length, currentIndex: selectedImageIndex });
    if (direction === 'next') {
      setSelectedImageIndex((prev) => {
        const newIndex = (prev + 1) % currentImages.length;
        console.log('🖼️ Next Image:', { from: prev, to: newIndex });
        return newIndex;
      });
    } else {
      setSelectedImageIndex((prev) => {
        const newIndex = (prev - 1 + currentImages.length) % currentImages.length;
        console.log('🖼️ Previous Image:', { from: prev, to: newIndex });
        return newIndex;
      });
    }
  };

  // Mobile swipe handlers
  const handleTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentImages.length > 1) {
      handleImageChange('next');
    }
    if (isRightSwipe && currentImages.length > 1) {
      handleImageChange('prev');
    }
  };

  const openFullscreen = (imageIndex) => {
    setSelectedImageIndex(imageIndex);
    setShowFullscreen(true);
  };

  const navigate = useNavigate();

  if (!currentImages || currentImages.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Image Display */}
      <div className="relative overflow-hidden bg-gray-900 group">
        <div 
          className="aspect-[4/3] md:aspect-video relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="w-full h-full cursor-pointer relative z-5"
            onClick={(e) => {
              e.stopPropagation();
              console.log('🖼️ Image clicked! Opening modal for view:', selectedView);
              openDetailedGallery(selectedView);
            }}
          >
            <img
              src={currentImages[selectedImageIndex]}
              alt={`${viewLabels[selectedView]} - Image ${selectedImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('🖼️ Image failed to load:', currentImages[selectedImageIndex]);
                e.target.src = 'https://picsum.photos/800/600?random=' + Math.random();
              }}
            />
          </div>

          
          
          {/* Top Navigation Bar (Floating) */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/50 to-transparent">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-transparent hover:bg-white/10 text-white transition-all">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-transparent hover:bg-white/10 text-white transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Navigation Arrows (Always Visible on Mobile, Hover on Desktop) */}
          {currentImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleImageChange('prev'); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/10 text-white rounded-full p-2 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleImageChange('next'); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/10 text-white rounded-full p-2 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Counter & View Selector Floating at Bottom */}
          <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
            <div className="flex items-end justify-between">
              {/* Category Thumbnails (Facade, Reception, etc.) */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {galleryViews.map((view, index) => (
                  <button
                    key={index}
                    onClick={(e) => { 
              e.stopPropagation(); 
              handleViewChange(index); 
              openDetailedGallery(index); 
            }}
                    className={`relative flex-shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedView === index
                        ? 'border-white shadow-xl scale-105'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img src={view.images?.[0] || images[0]} className="w-full h-full object-cover" alt={view.label} />
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="absolute bottom-1 left-0 right-0 text-[10px] md:text-xs text-white font-bold text-center drop-shadow-md">
                      {view.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Total Images Count */}
              <button 
                onClick={() => openDetailedGallery(selectedView)}
                className="mb-2 flex-shrink-0 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-white/20 active:scale-95 transition-transform"
              >
                <ImageIcon className="w-3 h-3" />
                {selectedImageIndex + 1}/{currentImages.length}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip (Optional, hidden on mobile) */}
      {currentImages.length > 1 && (
        <div className="hidden md:flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
          {currentImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImageIndex === index
                  ? 'border-[#EE4266] shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* DETAILED GALLERY VIEW (Full Screen Vertical List) */}
      {console.log('🎬 Rendering modal, showDetailedGallery:', showDetailedGallery) || showDetailedGallery && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          {/* Header with Close Button */}
          <div className="bg-white px-4 py-3 flex items-center gap-4 border-b border-gray-100 shadow-sm">
            <button onClick={() => setShowDetailedGallery(false)} className="text-gray-900 p-1">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-base font-bold text-gray-900">Property Photos</h2>
            <button onClick={() => setShowDetailedGallery(false)} className="ml-auto text-gray-400 p-1">
              <X size={20} />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="bg-white px-4 flex gap-6 overflow-x-auto no-scrollbar border-b border-gray-100">
            {galleryViews.map((view, index) => (
              <button
                key={index}
                onClick={() => handleViewChange(index)}
                className={`py-3 text-sm font-semibold whitespace-nowrap transition-all relative ${
                  selectedView === index ? 'text-[#EE4266]' : 'text-gray-500'
                }`}
              >
                {view.label}
                {selectedView === index && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EE4266]" />
                )}
              </button>
            ))}
          </div>

          {/* Vertical Images Feed */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-20 no-scrollbar">
            <div className="flex items-baseline gap-2 mb-4">
              <h3 className="text-xl font-bold text-gray-900">{viewLabels[selectedView]}</h3>
              <span className="text-sm text-gray-400 font-medium">({currentImages.length})</span>
            </div>
            
            <div className="space-y-4">
              {currentImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className="rounded-xl overflow-hidden shadow-sm bg-white cursor-pointer active:scale-[0.98] transition-all"
                  onClick={() => openFullscreen(idx)}
                >
                  <img 
                    src={img} 
                    alt={`${viewLabels[selectedView]} ${idx + 1}`} 
                    className="w-full h-auto object-cover max-h-[500px]"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal (Single Image Preview) */}
      {showFullscreen && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 z-[210] bg-black/20 rounded-full"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative max-w-6xl w-full max-h-full flex items-center justify-center">
            <img
              src={currentImages[selectedImageIndex]}
              alt={`Fullscreen Image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />

            {/* Fullscreen Navigation */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={() => handleImageChange('prev')}
                  className="absolute left-0 md:-left-20 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/10 text-white rounded-full p-4 transition-all z-[210]"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() => handleImageChange('next')}
                  className="absolute right-0 md:-right-20 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/10 text-white rounded-full p-4 transition-all z-[210]"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Fullscreen Counter & Label */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-white text-center w-full">
              <p className="text-xl font-bold tracking-wide">{viewLabels[selectedView]}</p>
              <p className="text-sm text-white/50 mt-1">{selectedImageIndex + 1} / {currentImages.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyViewsGallery;
