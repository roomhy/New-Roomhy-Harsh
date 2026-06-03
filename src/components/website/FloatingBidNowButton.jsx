import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function FloatingBidNowButton({ onOpenModal }) {
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
      {/* Desktop Chat Button (above BidNow) */}
      <Link
        to="/website/chat"
        className="hidden md:flex fixed bottom-24 right-6 z-50 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full font-bold hover:shadow-2xl transition-all items-center shadow-xl group px-4 py-4 overflow-hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.232-3.696A7.965 7.965 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 whitespace-nowrap group-hover:ml-1.5">Chat</span>
      </Link>

      {/* Desktop BidNow Button */}
      <button
        onClick={onOpenModal}
        className="hidden md:flex fixed bottom-8 right-6 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold hover:shadow-2xl transition-all items-center shadow-xl group px-4 py-4 overflow-hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 whitespace-nowrap group-hover:ml-1.5">BidNow</span>
      </button>

      {/* Mobile Chat Button (above BidNow) */}
      <Link
        to="/website/chat"
        className="md:hidden fixed bottom-36 right-6 z-50 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full font-bold shadow-xl flex items-center overflow-hidden active:scale-95 transition-all duration-300 px-4 py-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.232-3.696A7.965 7.965 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
          showFloatingButton ? 'max-w-xs opacity-100 ml-1.5' : 'max-w-0 opacity-0 ml-0'
        }`}>Chat</span>
      </Link>

      {/* Mobile BidNow Button - Collapse on scroll down, expand on scroll up */}
      <button
        onClick={onOpenModal}
        className={`md:hidden fixed bottom-20 right-6 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold shadow-xl flex items-center overflow-hidden active:scale-95 transition-all duration-300 px-4 py-4`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
          showFloatingButton ? 'max-w-xs opacity-100 ml-1.5' : 'max-w-0 opacity-0 ml-0'
        }`}>BidNow</span>
      </button>
    </>
  );
}
