import WebsiteNavbar from "../../components/website/WebsiteNavbar";
import WebsiteFooter from "../../components/website/WebsiteFooter";
import { RefreshCcw, CreditCard, Calendar, GraduationCap, AlertCircle, Clock, Mail, Phone } from 'lucide-react';

export default function WebsiteRefund() {
  const sections = [
    {
      icon: CreditCard,
      title: "Setup Fee Refund",
      content: [
        "Non-Refundable: The setup fee charged for listing a property or using premium features is non-refundable once deducted from your account.",
        "Exception: If the service was not provided or technical issues prevented access, contact our support team for a full refund within 7 days of transaction."
      ]
    },
    {
      icon: Calendar,
      title: "Booking Cancellation Refunds",
      content: [
        "Cancellation by Tenant (before check-in): Refund 80% of the booking amount. 20% is retained as a cancellation fee.",
        "Cancellation by Owner: If a property is cancelled by the owner after a confirmed booking, the tenant receives a full refund plus compensation.",
        "No-show: If a tenant fails to check-in without notice, the property owner keeps the full booking amount."
      ]
    },
    {
      icon: GraduationCap,
      title: "Special Cases for Student Users",
      content: [
        "Students registered on the platform may be eligible for extended refund periods (up to 30 days) under specific conditions.",
        "Valid student ID verification is required for this benefit."
      ]
    },
    {
      icon: AlertCircle,
      title: "Exceptional Circumstances",
      content: [
        "Medical emergencies, natural disasters, or force majeure events may make the user eligible for a full refund regardless of policy timelines.",
        "Proof of such circumstances is required."
      ]
    },
    {
      icon: Clock,
      title: "Processing Refunds",
      content: [
        "All refunds are processed within 5-7 business days.",
        "Bank transfers typically appear within 7-10 business days.",
        "Refunds to credit cards may take up to 15 business days depending on your financial institution."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <WebsiteNavbar />

      <main className="min-h-screen">
        {/* --- COMPACT & STYLISH HEADER --- */}
        <div className="relative w-full py-10 px-6 overflow-hidden border-b border-stone-200/50" 
             style={{ background: 'linear-gradient(135deg, #FFFAF5 0%, #FDFCFB 50%, #F5F7FA 100%)' }}>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/pinstripe.png")` }}>
          </div>

          <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
            
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
              <RefreshCcw size={24} className="text-green-600" />
            </div>
            
            {/* MAIN HEADING */}
            <div className="flex items-center gap-4 mb-2">
              <div className="h-[1px] w-8 bg-[#C5A059]/40 hidden md:block"></div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight">
                Refund <span className="text-[#C5A059] font-serif italic font-medium">Policy</span>
              </h1>
              <div className="h-[1px] w-8 bg-[#C5A059]/40 hidden md:block"></div>
            </div>

            {/* SUB-HEADING */}
            <p className="text-base md:text-lg text-stone-500 font-normal opacity-90 max-w-xl mx-auto">
              Effective Date: 1st Aug 2025 — Understanding your refund rights.
            </p>

            {/* Bottom Accent Dot */}
            <div className="mt-4 w-1.5 h-1.5 rounded-full bg-[#C5A059]/30"></div>
          </div>
        </div>

        {/* Content Section */}
        <section className="py-16 px-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
            <p className="text-gray-600 leading-relaxed mb-8">
              This policy outlines the refund terms for the various services and transactions made through the Roomhy platform.
            </p>

            <div className="space-y-8">
              {sections.map((section, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-all">
                      <section.icon size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                  <ul className="space-y-3 pl-13">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                        <p className="text-gray-600 leading-relaxed">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Us for Refund Requests</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:hello@roomhy.com" className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
                  <Mail size={16} /> hello@roomhy.com
                </a>
                <a href="tel:+919983005030" className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
                  <Phone size={16} /> +91-9983005030
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </div>
  );
}
