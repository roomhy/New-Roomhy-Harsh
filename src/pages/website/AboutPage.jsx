import WebsiteNavbar from "../../components/website/WebsiteNavbar";
import WebsiteFooter from "../../components/website/WebsiteFooter";
import MobileBottomNav from "../../components/website/MobileBottomNav";
import { Target, Lightbulb, Rocket, Heart, Zap, Shield, Eye, Handshake, Globe, TrendingUp, Users, Building2, Info } from 'lucide-react';

export default function AboutPage() {
  const visionItems = [
    { icon: Target, title: 'Disrupt Traditional Model', desc: 'Giving students the power to bid, book, and live without brokers, hidden charges, or negotiation stress.', gradient: 'from-teal-500 to-emerald-500' },
    { icon: Globe, title: 'Digital Transformation', desc: 'Pioneering a new way for India\'s youth to find accommodation — transparent, real-time, and entirely online.', gradient: 'from-blue-500 to-indigo-500' },
    { icon: TrendingUp, title: 'Student Empowerment', desc: 'Founded in 2024, Roomhy is building the future of student housing in India.', gradient: 'from-amber-500 to-orange-500' },
  ];

  const missionItems = [
    { icon: Handshake, title: 'Direct Connection', desc: 'Enabling direct, real-time bidding between students and property owners.', gradient: 'from-purple-500 to-pink-500' },
    { icon: Shield, title: 'Fair & Flexible', desc: 'Making room rentals fair, flexible, and broker-free for everyone.', gradient: 'from-green-500 to-teal-500' },
    { icon: Heart, title: 'Student-Centric', desc: 'India\'s first student-centric property bidding platform helping students take control.', gradient: 'from-red-500 to-rose-500' },
  ];

  const values = [
    { icon: Zap, title: 'Transparency', desc: 'No middlemen. No hidden fees.', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { icon: Heart, title: 'Empowerment', desc: 'Students and owners are in full control.', color: 'bg-red-50 text-red-600 border-red-100' },
    { icon: Rocket, title: 'Speed & Simplicity', desc: 'From listing to booking in under 5 mins.', color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { icon: Shield, title: 'Trust', desc: 'Every listing is verified. Every user is real.', color: 'bg-green-50 text-green-600 border-green-100' },
  ];

  const stats = [
    { number: '5+', label: 'Cities', icon: Globe },
    { number: '5000+', label: 'Operational Beds', icon: Building2 },
    { number: '75+', label: 'Properties', icon: Target },
    { number: '25K+', label: 'Students Served', icon: Users },
  ];

  const goals = [
    { icon: TrendingUp, title: 'Smart Bidding', desc: 'Helping students bid smart and live better with transparent pricing.', gradient: 'from-teal-500 to-cyan-500' },
    { icon: Handshake, title: 'Owner Benefits', desc: 'Helping owners earn more, without paying brokerage fees.', gradient: 'from-blue-500 to-violet-500' },
    { icon: Globe, title: 'Tech Ecosystem', desc: 'Building a transparent, tech-first ecosystem for youth mobility in India.', gradient: 'from-amber-500 to-orange-500' },
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
            <Info size={24} className="text-amber-600" />
          </div>
          
          {/* MAIN HEADING */}
          <div className="flex items-center gap-4 mb-2">
            <div className="h-[1px] w-8 bg-[#C5A059]/40 hidden md:block"></div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              About <span className="text-[#C5A059] font-serif italic font-medium">Us</span>
            </h1>
            <div className="h-[1px] w-8 bg-[#C5A059]/40 hidden md:block"></div>
          </div>

          {/* SUB-HEADING */}
          <p className="text-base md:text-lg text-stone-500 font-normal opacity-90 max-w-xl mx-auto">
            Our Story & Mission
          </p>

          {/* Bottom Accent Dot */}
          <div className="mt-4 w-1.5 h-1.5 rounded-full bg-[#C5A059]/30"></div>
        </div>
      </div>

      {/* Vision Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">Looking Ahead</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Our Vision</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visionItems.map((item, index) => (
            <div key={index} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform`}>
                <item.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">Our Purpose</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Our Mission</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {missionItems.map((item, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">What Drives Us</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Our Values</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div key={index} className={`rounded-3xl p-6 border ${value.color} text-center hover:shadow-lg transition-all`}>
              <value.icon size={32} className="mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-gray-500 text-sm">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ number, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon size={24} className="text-amber-500 mx-auto mb-3" />
              <p className="text-3xl sm:text-4xl font-extrabold text-white">{number}</p>
              <p className="text-gray-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">The Minds Behind Roohmy</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Our Leadership</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* CEO 1 */}
            <div className="flex flex-col items-center group">
              <div className="relative w-48 h-48 mb-6">
                <div className="absolute inset-0 bg-amber-500 rounded-3xl rotate-6 transition-transform group-hover:rotate-12 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gray-900 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                  <img src="/website/images/ceo1.png" alt="Founder" className="w-full h-full object-cover transition-all duration-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Resham Singh</h3>
              <p className="text-amber-600 font-semibold mb-3">Founder & CEO</p>
              <p className="text-gray-500 text-center text-sm max-w-xs">
                With a vision to transform India's student housing sector into a transparent, tech-driven ecosystem.
              </p>
            </div>

            {/* CEO 2 */}
            <div className="flex flex-col items-center group">
              <div className="relative w-48 h-48 mb-6">
                <div className="absolute inset-0 bg-teal-500 rounded-3xl -rotate-6 transition-transform group-hover:-rotate-12 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gray-900 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                  <img src="/website/images/ceo2.png" alt="Co-Founder" className="w-full h-full object-cover transition-all duration-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Resham Singh</h3>
              <p className="text-teal-600 font-semibold mb-3">Founder & CEO</p>
              <p className="text-gray-500 text-center text-sm max-w-xs">
                Dedicated to making room rentals fair, affordable, and accessible for students across the nation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <WebsiteFooter />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
