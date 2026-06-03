import WebsiteNavbar from "../../components/website/WebsiteNavbar";
import WebsiteFooter from "../../components/website/WebsiteFooter";
import { FileText, Shield, Users, Building2, AlertCircle, Mail, Phone } from 'lucide-react';

export default function WebsiteTerms() {
  const sections = [
    {
      icon: Users,
      title: "Definitions",
      content: [
        '"Roomhy", "We", "Us", or "Our" refers to Roomhy Technologies and its associated services.',
        '"User", "You", or "Your" refers to any individual or entity using the platform, including students, tenants, and property owners.',
        '"Platform" refers to Roomhy\'s website, mobile application, and related services.'
      ]
    },
    {
      icon: Building2,
      title: "Scope of Services",
      content: [
        "Roomhy provides an online platform that connects students seeking accommodation with property owners through a transparent, broker-free, and real-time bidding process.",
        "We do not own, manage, or operate the properties listed on our platform."
      ]
    },
    {
      icon: Shield,
      title: "User Eligibility",
      content: [
        "You must be at least 18 years old or have parental/guardian consent to use our platform.",
        "You agree to provide accurate, complete, and current information during registration and property listing."
      ]
    },
    {
      icon: AlertCircle,
      title: "Property Listings",
      content: [
        "Property owners must ensure all listings are truthful, with accurate descriptions, real photographs, and correct pricing.",
        "Roomhy reserves the right to verify, edit, reject, or remove any listing that violates our guidelines or is reported as fraudulent."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <WebsiteNavbar />

      {/* --- COMPACT & STYLISH HEADER --- */}
      <div className="relative w-full py-10 px-6 overflow-hidden border-b border-stone-200/50" 
           style={{ background: 'linear-gradient(135deg, #FFFAF5 0%, #FDFCFB 50%, #F5F7FA 100%)' }}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/pinstripe.png")` }}>
        </div>

        <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
          
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
            <FileText size={24} className="text-amber-600" />
          </div>
          
          {/* MAIN HEADING */}
          <div className="flex items-center gap-4 mb-2">
            <div className="h-[1px] w-8 bg-[#C5A059]/40 hidden md:block"></div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Terms & <span className="text-[#C5A059] font-serif italic font-medium">Conditions</span>
            </h1>
            <div className="h-[1px] w-8 bg-[#C5A059]/40 hidden md:block"></div>
          </div>

          {/* SUB-HEADING */}
          <p className="text-base md:text-lg text-stone-500 font-normal opacity-90 max-w-xl mx-auto">
            Effective Date: 1st Aug 2025
          </p>

          {/* Bottom Accent Dot */}
          <div className="mt-4 w-1.5 h-1.5 rounded-full bg-[#C5A059]/30"></div>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
          <p className="text-gray-600 leading-relaxed mb-8">
            Welcome to Roomhy. By using our platform (website or mobile app), you agree to comply with and be bound by these Terms & Conditions. Please read them carefully.
          </p>

          <div className="space-y-10">
            {sections.map((section, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <section.icon size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <ul className="space-y-3 pl-13">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <p className="text-gray-600 leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Us</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="mailto:hello@roomhy.com" className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium">
                <Mail size={16} /> hello@roomhy.com
              </a>
              <a href="tel:+919983005030" className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium">
                <Phone size={16} /> +91-9983005030
              </a>
            </div>
          </div>
        </div>
      </section>

      <WebsiteFooter />
    </div>
  );
}
