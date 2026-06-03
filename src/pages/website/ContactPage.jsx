import { useState } from "react";
import WebsiteNavbar from "../../components/website/WebsiteNavbar";
import WebsiteFooter from "../../components/website/WebsiteFooter";
import MobileBottomNav from "../../components/website/MobileBottomNav";
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, Headphones } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      alert('Thank you for your message! We\'ll get back to you within 24 hours.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 1500);
  };

  const contactCards = [
    { icon: Mail, title: 'Email Us', detail: 'hello@roomhy.com', sub: 'We reply within 24 hours', href: 'mailto:hello@roomhy.com', color: 'from-amber-500 to-orange-500' },
    { icon: Phone, title: 'Call Us', detail: '+91 99830 05030', sub: 'Mon-Sat, 9AM-7PM IST', href: 'tel:+919983005030', color: 'from-blue-500 to-indigo-500' },
    { icon: MapPin, title: 'Visit Us', detail: 'Vijay Nagar, Indore, MP', sub: 'Walk-ins welcome', href: '#', color: 'from-emerald-500 to-teal-500' },
  ];

  const formDetails = {
    title: 'Send us a Message',
    subtitle: 'We usually respond within 2-4 hours during business days.',
    fields: [
      { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Enter your name', required: true },
      { label: 'Email Address', name: 'email', type: 'email', placeholder: 'Enter your email', required: true },
      { label: 'Subject', name: 'subject', type: 'text', placeholder: 'How can we help?', required: true },
      { label: 'Message', name: 'message', type: 'textarea', placeholder: 'Tell us more...', required: true },
    ],
    submitText: 'Send Message'
  };

  const renderContactCards = (cards) => {
    return cards.map((card, index) => (
      <a 
        key={index}
        href={card.href}
        className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <card.icon size={24} className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h3>
        <p className="text-gray-900 font-medium">{card.detail}</p>
        <p className="text-gray-500 text-sm mt-1">{card.sub}</p>
      </a>
    ));
  };

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
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
            <Headphones size={24} className="text-blue-600" />
          </div>
          
          {/* MAIN HEADING */}
          <div className="flex items-center gap-4 mb-2">
            <div className="h-[1px] w-8 bg-[#C5A059]/40 hidden md:block"></div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Get in <span className="text-[#C5A059] font-serif italic font-medium">Touch</span>
            </h1>
            <div className="h-[1px] w-8 bg-[#C5A059]/40 hidden md:block"></div>
          </div>

          {/* SUB-HEADING */}
          <p className="text-base md:text-lg text-stone-500 font-normal opacity-90 max-w-xl mx-auto">
            Have questions? We'd love to hear from you
          </p>

          {/* Bottom Accent Dot */}
          <div className="mt-4 w-1.5 h-1.5 rounded-full bg-[#C5A059]/30"></div>
        </div>
      </div>

      {/* Contact Cards */}
      <section className="py-16 px-4 max-w-5xl mx-auto -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderContactCards(contactCards)}
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{formDetails.title}</h2>
            <p className="text-gray-500 mt-2">{formDetails.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formDetails.fields?.map((field, index) => {
              if (field.type === 'textarea') {
                return (
                  <div key={field.name}>
                    <label className="text-gray-700 text-sm font-semibold mb-1.5 block">{field.label}</label>
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      required={field.required}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-gray-800 resize-none"
                      placeholder={field.placeholder}
                    />
                  </div>
                );
              }
              
              return (
                <div key={field.name}>
                  <div>
                    <label className="text-gray-700 text-sm font-semibold mb-1.5 block">{field.label}</label>
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      required={field.required}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-gray-800"
                      placeholder={field.placeholder}
                    />
                  </div>
                </div>
              );
            })}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  {formDetails.submitText || 'Send Message'}
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      <WebsiteFooter />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
