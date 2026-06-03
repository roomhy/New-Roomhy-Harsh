import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    // Navigation
    home: 'Home',
    properties: 'Properties',
    about: 'About',
    contact: 'Contact',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    profile: 'Profile',
    settings: 'Settings',
    favourites: 'Favourites',
    myStays: 'My Stays',

    // Home Page
    findYourStay: 'Find Your Perfect Student Stay',
    searchPlaceholder: 'Search by city, property type...',
    popularCities: 'Popular Cities',
    exploreCities: 'Explore top cities for student accommodation',
    whatWeOffer: 'What We Offer',
    accommodationTypes: 'Choose from a variety of accommodation types tailored for students',
    trendingStays: 'Trending Stays This Week',
    popularProperties: 'Most popular properties among students',
    howItWorks: 'How Roomhy Works',
    findCompareBook: 'Find, compare, and book your perfect stay in just a few steps',
    watchDemo: 'Watch Demo',

    // Property Types
    pg: 'PG',
    hostel: 'Hostel',
    flat: 'Flat',
    coliving: 'Co-Living',
    apartment: 'Apartment',

    // Actions
    bookNow: 'Book Now',
    viewDetails: 'View Details',
    viewAll: 'View All',
    browseProperties: 'Browse Properties',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    update: 'Update',
    submit: 'Submit',
    confirm: 'Confirm',

    // Property Details
    rent: 'Rent',
    deposit: 'Deposit',
    amenities: 'Amenities',
    description: 'Description',
    location: 'Location',
    reviews: 'Reviews',
    writeReview: 'Write a Review',
    verified: 'Verified',
    properties_count: 'Properties',

    // Settings
    notifications: 'Notifications',
    privacy: 'Privacy',
    preferences: 'Preferences',
    darkMode: 'Dark Mode',
    language: 'Language',
    changePassword: 'Change Password',
    deleteAccount: 'Delete Account',
    deleteAccountConfirm: 'Once you delete your account, there is no going back. Please be certain.',
    emailNotifications: 'Email Notifications',
    smsNotifications: 'SMS Notifications',
    pushNotifications: 'Push Notifications',
    marketingEmails: 'Marketing Emails',
    publicProfile: 'Public Profile',
    showPhone: 'Show Phone Number',
    showEmail: 'Show Email',

    // Auth
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Name',
    phone: 'Phone',
    firstName: 'First Name',
    lastName: 'Last Name',
    forgotPassword: 'Forgot Password?',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    enterPassword: 'Enter your password',
    enterEmail: 'Enter your email',
    enterName: 'Enter your name',

    // Messages
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    loading: 'Loading...',
    noResults: 'No results found',
    tryAgain: 'Try Again',
    comingSoon: 'Coming Soon',

    // Footer
    quickLinks: 'Quick Links',
    support: 'Support',
    legal: 'Legal',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    contactUs: 'Contact Us',
    allRightsReserved: 'All rights reserved',

    // Reviews
    yourReviews: 'Your Reviews',
    noReviewsYet: 'You haven\'t written any reviews yet',
    editReview: 'Edit Review',
    deleteReview: 'Delete Review',
    rating: 'Rating',
    writeYourReview: 'Write your review...',
    postReview: 'Post Review',
    updateReview: 'Update Review',
  },
  hi: {
    // Navigation
    home: 'होम',
    properties: 'प्रॉपर्टीज',
    about: 'हमारे बारे में',
    contact: 'संपर्क करें',
    login: 'लॉग इन',
    signup: 'साइन अप',
    logout: 'लॉग आउट',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्स',
    favourites: 'पसंदीदा',
    myStays: 'मेरे स्टे',

    // Home Page
    findYourStay: 'अपना परफेक्ट स्टूडेंट स्टे खोजें',
    searchPlaceholder: 'शहर, प्रॉपर्टी टाइप से खोजें...',
    popularCities: 'लोकप्रिय शहर',
    exploreCities: 'स्टूडेंट एक्स्टेंशन के लिए टॉप शहर एक्स्प्लोर करें',
    whatWeOffer: 'हम क्या ऑफर करते हैं',
    accommodationTypes: 'स्टूडेंट्स के लिए विभिन्न प्रकार की एक्स्टेंशन चुनें',
    trendingStays: 'इस हफ्ते ट्रेंडिंग स्टे',
    popularProperties: 'स्टूडेंट्स में सबसे लोकप्रिय प्रॉपर्टीज',
    howItWorks: 'रूमी कैसे काम करता है',
    findCompareBook: 'कुछ ही स्टेप्स में अपना परफेक्ट स्टे खोजें, तुलना करें और बुक करें',
    watchDemo: 'डेमो देखें',

    // Property Types
    pg: 'पीजी',
    hostel: 'हॉस्टल',
    flat: 'फ्लैट',
    coliving: 'को-लिविंग',
    apartment: 'अपार्टमेंट',

    // Actions
    bookNow: 'अभी बुक करें',
    viewDetails: 'डिटेल्स देखें',
    viewAll: 'सभी देखें',
    browseProperties: 'प्रॉपर्टीज ब्राउज करें',
    search: 'खोजें',
    filter: 'फिल्टर',
    sort: 'सॉर्ट',
    save: 'सेव करें',
    cancel: 'कैंसल',
    delete: 'डिलीट',
    edit: 'एडिट',
    update: 'अपडेट',
    submit: 'सबमिट',
    confirm: 'कन्फर्म',

    // Property Details
    rent: 'किराया',
    deposit: 'सिक्योरिटी डिपॉजिट',
    amenities: 'सुविधाएं',
    description: 'विवरण',
    location: 'लोकेशन',
    reviews: 'रिव्यूज',
    writeReview: 'रिव्यू लिखें',
    verified: 'वेरिफाइड',
    properties_count: 'प्रॉपर्टीज',

    // Settings
    notifications: 'नोटिफिकेशन्स',
    privacy: 'प्राइवेसी',
    preferences: 'प्रेफरेंसेज',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    changePassword: 'पासवर्ड बदलें',
    deleteAccount: 'अकाउंट डिलीट करें',
    deleteAccountConfirm: 'एक बार अकाउंट डिलीट होने के बाद, वापसी नहीं हो सकती। कृपया सुनिश्चित करें।',
    emailNotifications: 'ईमेल नोटिफिकेशन्स',
    smsNotifications: 'एसएमएस नोटिफिकेशन्स',
    pushNotifications: 'पुश नोटिफिकेशन्स',
    marketingEmails: 'मार्केटिंग ईमेल',
    publicProfile: 'पब्लिक प्रोफाइल',
    showPhone: 'फोन नंबर दिखाएं',
    showEmail: 'ईमेल दिखाएं',

    // Auth
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड कन्फर्म करें',
    name: 'नाम',
    phone: 'फोन',
    firstName: 'पहला नाम',
    lastName: 'उपनाम',
    forgotPassword: 'पासवर्ड भूल गए?',
    alreadyHaveAccount: 'पहले से अकाउंट है?',
    dontHaveAccount: 'अकाउंट नहीं है?',
    enterPassword: 'अपना पासवर्ड दर्ज करें',
    enterEmail: 'अपना ईमेल दर्ज करें',
    enterName: 'अपना नाम दर्ज करें',

    // Messages
    success: 'सफल',
    error: 'एरर',
    warning: 'चेतावनी',
    loading: 'लोडिंग...',
    noResults: 'कोई रिजल्ट नहीं मिला',
    tryAgain: 'फिर से कोशिश करें',
    comingSoon: 'जल्द आ रहा है',

    // Footer
    quickLinks: 'क्विक लिंक्स',
    support: 'सपोर्ट',
    legal: 'लीगल',
    termsOfService: 'सेवा की शर्तें',
    privacyPolicy: 'प्राइवेसी पॉलिसी',
    contactUs: 'हमसे संपर्क करें',
    allRightsReserved: 'सर्वाधिकार सुरक्षित',

    // Reviews
    yourReviews: 'आपके रिव्यूज',
    noReviewsYet: 'आपने अभी तक कोई रिव्यू नहीं लिखा है',
    editReview: 'रिव्यू एडिट करें',
    deleteReview: 'रिव्यू डिलीट करें',
    rating: 'रेटिंग',
    writeYourReview: 'अपना रिव्यू लिखें...',
    postReview: 'रिव्यू पोस्ट करें',
    updateReview: 'रिव्यू अपडेट करें',
  }
};

const TranslationContext = createContext();

export function TranslationProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const t = useCallback((key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  }, [currentLanguage]);

  const changeLanguage = useCallback((lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('roomhy_language', lang);
  }, []);

  const value = {
    t,
    currentLanguage,
    changeLanguage,
    languages: [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'हिन्दी (Hindi)' },
    ]
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
