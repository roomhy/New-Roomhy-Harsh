import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function FloatingBidButton() {
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setShowFloatingButton(false);
      } else {
        // Scrolling up
        setShowFloatingButton(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Desktop Floating Buttons */}
      <Link
        to="/website/chat"
        className="hidden md:flex fixed bottom-48 right-6 z-50 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full font-bold hover:shadow-2xl transition-all items-center shadow-xl group px-4 py-4 overflow-hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 whitespace-nowrap group-hover:ml-1.5">Chat Now</span>
      </Link>

      <Link
        to="/website/fast-bidding"
        className="hidden md:flex fixed bottom-32 right-6 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold hover:shadow-2xl transition-all items-center shadow-xl group px-4 py-4 overflow-hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 whitespace-nowrap group-hover:ml-1.5">BidNow</span>
      </Link>

      {/* Mobile Bid Now Button - Full button with text on scroll up, icon only on scroll down */}
      <Link
        to="/website/fast-bidding"
        className={`md:hidden fixed bottom-20 right-6 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold shadow-xl flex items-center overflow-hidden active:scale-95 transition-all duration-300 ${
          showFloatingButton ? 'px-4 py-4' : 'px-4 py-4'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
          showFloatingButton ? 'max-w-xs opacity-100 ml-1.5' : 'max-w-0 opacity-0 ml-0'
        }`}>BidNow</span>
      </Link>
    </>
  );
}
