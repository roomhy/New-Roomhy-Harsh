import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { fetchFeaturedReviews } from '../../utils/api';

const chooseUsPoints = [
  {
    title: "Zero Brokerage",
    description: "Save your money for what matters. We connect you directly with property owners, with no hidden fees.",
    image: "https://images.unsplash.com/photo-1554224154-6726b3a85810?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Fully Furnished",
    description: "Move in with just your suitcase. Our properties come with all the essential furniture and amenities.",
    image: "https://images.unsplash.com/photo-1502005229766-52835d3e76d0?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "24/7 Support",
    description: "From booking to move-out, our dedicated support team is always here to help you.",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Verified Listings",
    description: "Every property is verified by our team. No fake photos, no scams.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Flexible Booking",
    description: "Book for any duration - short term or long term. Cancel anytime with refund.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Student Community",
    description: "Join a community of thousands of students. Make friends and share experiences.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
  },
];

const fallbackReviews = [
  {
    _id: '1',
    name: 'Rahul Sharma',
    rating: 5,
    review: 'Roomhy made finding a PG so easy! Found a great place near my coaching center.',
    designation: 'IIT Aspirant',
    location: 'Kota',
    isVerified: true
  },
  {
    _id: '2',
    name: 'Priya Patel',
    rating: 5,
    review: 'Best platform for students! No brokerage and amazing support team.',
    designation: 'NEET Student',
    location: 'Indore',
    isVerified: true
  }
];

export default function WhyStudentsChooseUs() {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoadingReviews(true);
        const data = await fetchFeaturedReviews(10);
        setReviews(data?.length > 0 ? data : fallbackReviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
        setReviews(fallbackReviews);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviews();
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const nextReview = () => setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  const prevReview = () => setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
  ));

  return (
    <section className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-lg md:text-4xl font-bold text-gray-900 mb-1 md:mb-4">Why Students Choose Us</h2>
          <p className="text-xs md:text-lg text-gray-600 mt-1 md:mt-2 max-w-2xl mx-auto">Here's what makes us the preferred choice for students.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {chooseUsPoints.map((point, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-5 border border-gray-100">
              <div className="relative mb-4">
                <img src={point.image} alt={point.title} className="rounded-lg h-40 w-full object-cover" />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-white">{index + 1}</div>
              </div>
              <h3 className="font-bold text-lg text-gray-900 text-center">{point.title}</h3>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed text-center">{point.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-4 md:mb-8">
            <h2 className="text-lg md:text-4xl font-bold text-white mb-1 md:mb-3">What Our Students Say</h2>
            <p className="text-white/80 text-xs md:text-lg max-w-2xl mx-auto">Real experiences from real students who found their perfect stay</p>
          </div>

          {loadingReviews ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex-shrink-0">
                    {reviews[currentReviewIndex].avatar ? (
                      <img src={reviews[currentReviewIndex].avatar} alt={reviews[currentReviewIndex].name} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-teal-100" />
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-teal-100">
                        {reviews[currentReviewIndex].name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Quote className="w-8 h-8 text-teal-200 mb-2" />
                    <p className="text-gray-700 text-lg leading-relaxed mb-4 italic">"{reviews[currentReviewIndex].review}"</p>
                    <div className="flex items-center gap-1 mb-3">{renderStars(reviews[currentReviewIndex].rating)}</div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-bold text-gray-900">{reviews[currentReviewIndex].name}</h4>
                      {reviews[currentReviewIndex].isVerified && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Verified Student</span>}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{reviews[currentReviewIndex].designation}{reviews[currentReviewIndex].location && <span className="text-teal-600"> • {reviews[currentReviewIndex].location}</span>}</p>
                  </div>
                </div>
              </div>

              <button onClick={prevReview} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white text-teal-600 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg hover:shadow-xl hover:bg-teal-50 transition-all flex items-center justify-center"><ChevronLeft className="w-5 h-5 md:w-6 md:h-6" /></button>
              <button onClick={nextReview} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white text-teal-600 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg hover:shadow-xl hover:bg-teal-50 transition-all flex items-center justify-center"><ChevronRight className="w-5 h-5 md:w-6 md:h-6" /></button>

              <div className="flex justify-center gap-2 mt-6">
                {reviews.map((_, index) => (
                  <button key={index} onClick={() => setCurrentReviewIndex(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentReviewIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-white"><p className="text-lg">No reviews available yet.</p></div>
          )}
        </div>

        <div className="mt-6 md:mt-12 text-center">
          <div className="bg-green-500 rounded-xl p-3 md:p-6 max-w-2xl mx-auto">
            <p className="text-white text-sm md:text-lg font-semibold">Join 50,000+ happy students across India</p>
          </div>
        </div>
      </div>
    </section>
  );
}
