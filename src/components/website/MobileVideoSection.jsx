import { Play, X } from 'lucide-react';
import { useState } from 'react';

export default function MobileVideoSection() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="md:hidden bg-gradient-to-b from-gray-50 to-white py-3 px-4">
      <div className="max-w-lg mx-auto">
        {/* Section Header - Same as Desktop */}
        <div className="text-center mb-3">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            How Roomhy Works
          </h2>
          <p className="text-gray-600 text-xs">
            Find, compare, and book your perfect stay in just a few steps
          </p>
        </div>

        {/* Video Container - Smaller for mobile */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl group max-w-xs mx-auto">
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10"></div>

          {!showVideo ? (
            <>
              {/* Thumbnail Image */}
              <div className="aspect-video bg-gradient-to-br from-[#1ab64f]/20 to-blue-900/20 relative">
                <img
                  src="https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Roomhy Video Thumbnail"
                  className="w-full h-full object-cover opacity-60"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <button
                    onClick={() => setShowVideo(true)}
                    className="w-12 h-12 bg-[#1ab64f] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                  >
                    <Play className="w-5 h-5 text-white fill-white ml-1" />
                  </button>
                </div>
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded z-20">
                  0:45
                </div>
                {/* Watch Demo Badge - Like Desktop */}
                <div className="absolute bottom-2 left-2 z-20 text-white">
                  <h3 className="text-sm font-semibold">Watch Demo</h3>
                  <p className="text-[10px] text-white/80">See how booking works</p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Video Player */}
              <div className="aspect-video bg-black flex items-center justify-center relative">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/4pFUP0HZwWM?autoplay=1"
                  title="Roomhy demo video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                ></iframe>
                {/* Close Button */}
                <button
                  onClick={() => setShowVideo(false)}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center z-30"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
