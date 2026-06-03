import React from 'react';
import { Gift, Star, Shield, Clock, Heart, Zap, Crown, Diamond } from 'lucide-react';

const ExclusiveBenefitsSection = ({ exclusiveBenefits = [] }) => {
  const getIcon = (iconName) => {
    const iconMap = {
      gift: Gift, star: Star, shield: Shield, clock: Clock,
      heart: Heart, zap: Zap, crown: Crown, diamond: Diamond
    };
    return iconMap[iconName] || Gift;
  };

  if (!exclusiveBenefits || exclusiveBenefits.length === 0) {
    return null;
  }

  return (
    <div className="py-5 md:py-6" style={{ borderBottom: '1px solid #e8e8e8' }}>
      <h2 className="text-[22px] font-bold text-[#222] mb-4">Exclusive Direct Benefits</h2>
      
      <div className="space-y-3">
        {exclusiveBenefits.map((benefit, index) => {
          const Icon = getIcon(benefit.icon);
          return (
            <div 
              key={index} 
              className="flex items-center gap-3 py-2"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#eef7ee' }}>
                <Icon className="w-5 h-5 text-[#1ab64f]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#222] text-[15px]">{benefit.title}</h3>
                {benefit.description && (
                  <p className="text-sm text-[#6d787d]">{benefit.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Badge — OYO style simple text */}
      <div className="mt-4 flex items-center gap-2 text-sm text-[#1ab64f]">
        <Shield className="w-4 h-4" />
        <span className="font-medium">Book Direct & Get Exclusive Benefits</span>
      </div>
    </div>
  );
};

export default ExclusiveBenefitsSection;
