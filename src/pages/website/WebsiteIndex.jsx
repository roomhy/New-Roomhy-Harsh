import React, { useState, useEffect, useCallback } from "react";
import { useHtmlPage } from "../../utils/htmlPage";
import HowRoomhyWorks from "../../components/website/HowRoomhyWorks";
import { fetchPropertyTypes } from "../../utils/api";

// Custom hook for navigation history
function useNavigationHistory() {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    const currentPath = window.location.pathname;
    setHistory([currentPath]);
    setCurrentIndex(0);
  }, []);

  const push = useCallback((path) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      const updated = [...newHistory, path];
      setCurrentIndex(updated.length - 1);
      return updated;
    });
  }, [currentIndex]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const path = history[newIndex];
      window.location.href = path;
      return path;
    }
    return null;
  }, [history, currentIndex]);

  const goNext = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const path = history[newIndex];
      window.location.href = path;
      return path;
    }
    return null;
  }, [history, currentIndex]);

  const canGoBack = currentIndex > 0;
  const canGoNext = currentIndex < history.length - 1;

  return { push, goBack, goNext, canGoBack, canGoNext, currentPath: history[currentIndex] };
}

// Reviews data
const reviews = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Student at IIT Delhi",
    rating: 5,
    text: "Roomhy made finding my hostel so easy! Zero brokerage and the bidding feature helped me get a great deal.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "Medical Student",
    rating: 5,
    text: "The 24/7 support team helped me find a safe PG near my college. Best platform for students!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Amit Kumar",
    role: "Engineering Student",
    rating: 5,
    text: "Found a fully furnished apartment in just 2 days. The direct chat with owners saved so much time.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Sneha Gupta",
    role: "MBA Student",
    rating: 5,
    text: "Love the verified listings! No fake photos or hidden charges. Roomhy is a game changer.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Vikram Singh",
    role: "Law Student",
    rating: 4,
    text: "The ₹500 booking token is such a smart feature. It shows owners you're serious about renting.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 6,
    name: "Anjali Mehta",
    role: "CA Student",
    rating: 5,
    text: "Moved to Kota for coaching and found the perfect hostel within a day. Thank you Roomhy!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
  }
];

export default function WebsiteIndex() {
  const { push, goBack, goNext, canGoBack, canGoNext } = useNavigationHistory();
  const [currentReview, setCurrentReview] = useState(0);
  const [offerings, setOfferings] = useState([]);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  
  useHtmlPage({
    title: "Roomhy - Find Your Student Home",
    htmlAttrs: { "lang": "en", "class": "scroll-smooth" },
    metas: [
      { "charset": "UTF-8" },
      { "name": "viewport", "content": "width=device-width, initial-scale=1.0" },
      { "name": "referrer", "content": "no-referrer-when-downgrade" }
    ],
    bases: [],
    links: [
      { "rel": "preconnect", "href": "https://fonts.googleapis.com" },
      { "rel": "preconnect", "href": "https://fonts.gstatic.com", "crossorigin": true },
      { "href": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap", "rel": "stylesheet" },
      { "rel": "stylesheet", "href": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css", "crossorigin": "anonymous", "referrerpolicy": "no-referrer" },
      { "rel": "stylesheet", "href": "/website/assets/css/index.css" }
    ],
    styles: [],
    scripts: [
      { "src": "https://cdn.tailwindcss.com" },
      { "src": "https://unpkg.com/lucide@latest" },
      { "src": "/website/js/auth-utils.js" },
      { "src": "/website/assets/js/index.js" }
    ]
  });

  // Auto-slide reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch dynamic offerings
  useEffect(() => {
    const loadOfferings = async () => {
      try {
        setLoadingOfferings(true);
        const types = await fetchPropertyTypes();
        setOfferings(types);
      } catch (error) {
        console.error("Error loading offerings:", error);
      } finally {
        setLoadingOfferings(false);
      }
    };
    loadOfferings();
  }, []);

  const nextReview = () => setCurrentReview((prev) => (prev + 1) % reviews.length);
  const prevReview = () => setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);

  return (
    <div className="html-page">
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button 
                  onClick={goBack}
                  disabled={!canGoBack}
                  className={`p-2 rounded-md transition-colors ${canGoBack ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
                  title="Go Back"
                >
                  <i data-lucide="chevron-left" className="w-5 h-5"></i>
                </button>
                <button 
                  onClick={goNext}
                  disabled={!canGoNext}
                  className={`p-2 rounded-md transition-colors ${canGoNext ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
                  title="Go Forward"
                >
                  <i data-lucide="chevron-right" className="w-5 h-5"></i>
                </button>
              </div>
              <a href="#" className="flex-shrink-0">
                <img src="https://res.cloudinary.com/dpwgvcibj/image/upload/v1768990260/roomhy/website/logoroomhy.png" alt="Roomhy Logo" className="h-10 w-25" />
              </a>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-6">
              <nav className="hidden lg:flex items-center space-x-6">
                <a href="/website/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About Us</a>
                <a href="#faq" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">FAQ</a>
                <a href="/website/contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</a>
              </nav>

              <div className="relative">
                <a href="/website/fast-bidding" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base font-semibold hover:shadow-lg transition-all flex items-center gap-1">
                  <i data-lucide="zap" className="w-4 h-4"></i> <span className="hidden sm:inline">Fast Bidding</span>
                </a>
              </div>

              <a href="/website/list" className="flex-shrink-0 flex items-center justify-center px-3 sm:px-4 py-2 rounded-md text-sm font-semibold transition-colors w-10 h-10 sm:w-auto sm:h-auto sm:px-4">
                <span className="text-3xl font-bold">+</span>
              </a>
              
              <button id="menu-toggle" className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                <i data-lucide="menu" className="w-7 h-7 text-gray-800"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-20 md:py-28 text-white">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop" alt="Hero background" className="absolute inset-0 w-full h-full object-cover animate-kenburns" />
          <div className="absolute inset-0 w-full h-full bg-black/60"></div> 
        </div>

        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "#fffcf2" }}>
            SEARCH. CONNECT. SUCCEED.
          </h1>
          <div className="relative w-full max-w-2xl mx-auto">
            <input type="text" placeholder="Search for 'PG near me' or 'Hostel in Kota'" className="w-full p-4 pl-5 pr-14 rounded-md bg-white text-gray-900 border-transparent focus:ring-4 focus:ring-cyan-300/50 focus:outline-none placeholder-gray-500 shadow-lg" />
            <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
              <i data-lucide="search" className="w-5 h-5 text-white"></i>
            </button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-16">
        {/* Offerings Section */}
        <section className="light-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Our Offerings</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loadingOfferings ? (
              // Skeleton loaders
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-40"></div>
              ))
            ) : offerings.length > 0 ? (
              offerings.map((item, idx) => (
                <a 
                  key={idx} 
                  href={item.link || `/website/ourproperty?type=${item.category.toLowerCase()}`} 
                  className="group block"
                >
                  <div className="relative rounded-xl shadow-md hover:shadow-lg overflow-hidden h-40 cursor-pointer transition-shadow duration-300">
                    <img 
                      src={item.images?.[0] || item.image || `https://res.cloudinary.com/dpwgvcibj/image/upload/v1768990227/roomhy/website/${idx === 0 ? 'angels-hostel' : idx === 1 ? '401230348' : idx === 2 ? 'pg' : 'post'}.jpg`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt={item.title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white text-center text-sm sm:text-base font-bold">{item.title}</h3>
                        <p className="text-white/60 text-[10px] text-center line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">No offerings available</p>
            )}
          </div>
        </section>

        <HowRoomhyWorks />

        {/* Why Roomhy Section */}
        <section className="scroll-mt-20 light-card rounded-2xl p-6 md:p-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="text-left lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">Why Roomhy?</h2>
              <p className="text-gray-600 mb-6 text-lg mt-4">Roomhy was built by students, for students. We experienced the chaos of finding a reliable place to live and knew there had to be a better way.</p>
              <p className="text-gray-600">We're more than a platform; we're your first friend in a new city, dedicated to helping you find a space where you can thrive.</p>
            </div>
            <div className="w-full max-w-3xl mx-auto grid grid-cols-2 grid-rows-2 gap-4 mt-8 lg:mt-0 lg:order-1">
              <div className="row-span-2 col-span-1">
                <img src="https://res.cloudinary.com/dpwgvcibj/image/upload/v1768990242/roomhy/website/hostel1.png.jpg" className="h-full w-full object-cover rounded-2xl shadow-lg" alt="Student accommodation" />
              </div>
              <div className="col-span-1">
                <img src="https://res.cloudinary.com/dpwgvcibj/image/upload/v1768990244/roomhy/website/hostel2.jpg" className="h-full w-full object-cover rounded-2xl shadow-lg" alt="Common room" />
              </div>
              <div className="col-span-1">
                <img src="https://res.cloudinary.com/dpwgvcibj/image/upload/v1768990245/roomhy/website/hostel3.jpg" className="h-full w-full object-cover rounded-2xl shadow-lg" alt="Student hallway" />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="scroll-mt-20 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-lg text-gray-500 hidden lg:block">Everything you need to know about finding your perfect home with Roomhy.</p>
              </div>
              <div className="lg:col-span-8 space-y-2">
                {[
                  { q: "What is Roomhy and how does it work?", a: "Roomhy is a student accommodation platform that connects students directly with verified property owners. You search, shortlist, and book properties like PG, hostels, and apartments without paying any brokerage fees." },
                  { q: "Is Roomhy completely broker-free?", a: "Yes, absolutely. Our core promise is zero brokerage. We eliminate the middleman, ensuring you only pay the rent and a small, refundable security deposit directly to the property owner." },
                  { q: "How do I place a bid on a property?", a: "When viewing a property, you can see the owner's expected price. You can then submit a 'bid' or offer that you are willing to pay. The owner can accept, reject, or counter your offer." },
                  { q: "What types of properties are listed?", a: "We offer Hostels (shared rooms, budget-friendly), PGs (Paying Guest accommodation with meals and services), and Apartments (private flats for independent living)." }
                ].map((faq, idx) => (
                  <div key={idx} className="faq-item border border-gray-200 rounded-lg">
                    <div className="faq-question p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                      <span className="font-medium text-gray-900">{faq.q}</span>
                      <i data-lucide="chevron-down" className="w-5 h-5 text-gray-500"></i>
                    </div>
                    <div className="faq-answer px-4 pb-4 text-gray-600 hidden">
                      <p>{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2025 Roomhy. All Rights Reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="/website/terms" className="text-gray-500 hover:text-gray-700 text-sm">Terms</a>
              <a href="/website/privacy" className="text-gray-500 hover:text-gray-700 text-sm">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
