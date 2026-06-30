import WebsiteNavbar from "../../components/website/WebsiteNavbar";
import WebsiteFooter from "../../components/website/WebsiteFooter";
import { Shield, Eye, Lock, Database, UserCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function WebsitePrivacy() {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      items: [
        "Personal Information: Name, email address, phone number, date of birth, profile picture, and identity verification details.",
        "Property Information: Contact details, property location, rental prices, photos, and ownership documents (for property owners).",
        "Usage Information: IP address, device type, browser type, pages visited, and browsing patterns.",
        "Payment Information: Payment method, transaction history, and billing addresses (processed through secure payment gateways)."
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      items: [
        "To facilitate property listings and bookings",
        "To process payments and refunds",
        "To verify identity and prevent fraud",
        "To send notifications, updates, and promotional content",
        "To improve our platform and services",
        "To comply with legal obligations"
      ]
    },
    {
      icon: Lock,
      title: "Data Security",
      items: [
        "We implement industry-standard security measures including encryption, firewalls, and secure servers to protect your personal information from unauthorized access, alteration, disclosure, or destruction."
      ]
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      items: [
        "Right to access your personal information",
        "Right to request data deletion (subject to legal obligations)",
        "Right to opt out of marketing communications",
        "Right to data portability"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      <WebsiteNavbar />

      {/* --- COMPACT & STYLISH HEADER --- */}
      <div className="relative w-full py-5 md:py-10 px-4 md:px-6 overflow-hidden border-b border-stone-200/50" 
           style={{ background: 'linear-gradient(135deg, #FFFAF5 0%, #FDFCFB 50%, #F5F7FA 100%)' }}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/pinstripe.png")` }}>
        </div>

        <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
          
          {/* Icon */}
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-2 md:mb-4">
            <Shield size={18} className="text-blue-600 md:w-6 md:h-6" />
          </div>
          
          {/* MAIN HEADING */}
          <div className="flex items-center gap-2 md:gap-4 mb-1 md:mb-2">
            <div className="h-[1px] w-6 md:w-8 bg-[#C5A059]/40 hidden md:block"></div>
            <h1 className="text-lg md:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Privacy <span className="text-[#C5A059] font-serif italic font-medium">Policy</span>
            </h1>
            <div className="h-[1px] w-6 md:w-8 bg-[#C5A059]/40 hidden md:block"></div>
          </div>

          {/* SUB-HEADING */}
          <p className="text-xs md:text-lg text-stone-500 font-normal opacity-90 max-w-xl mx-auto">
            Effective Date: 1st Aug 2025 — We take your privacy seriously.
          </p>

          {/* Bottom Accent Dot */}
          <div className="mt-2 md:mt-4 w-1.5 h-1.5 rounded-full bg-[#C5A059]/30"></div>
        </div>
      </div>

      {/* Content */}
      <section className="py-6 md:py-16 px-4 max-w-4xl mx-auto">
        <div className="bg-white md:rounded-3xl p-0 md:p-12 md:shadow-sm md:border md:border-gray-100">
          <p className="text-gray-600 leading-relaxed mb-6 md:mb-8 text-sm md:text-base">
            Roomhy is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our platform of <strong>ROOMHY TECHNOLOGY PRIVATE LIMITED</strong>.
          </p>

          <div className="space-y-5 md:space-y-8">
            {sections.map((section, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <section.icon size={18} />
                  </div>
                  <h2 className="text-base md:text-xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <ul className="space-y-2.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <p className="text-gray-600 text-xs md:text-base leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Corporate & Contact Information</h3>
            <div className="space-y-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">ROOMHY TECHNOLOGY PRIVATE LIMITED</p>
              
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <span>22, Krishna Nagar, Rangbari Road, Kota, Rajasthan - 324005</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a href="mailto:hello@roomhy.com" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                  <Mail size={16} /> hello@roomhy.com
                </a>
                <a href="tel:+919983005030" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                  <Phone size={16} /> +91-9983005030
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WebsiteFooter />
    </div>
  );
}
