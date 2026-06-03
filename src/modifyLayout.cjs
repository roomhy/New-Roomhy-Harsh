const fs = require('fs');
const file = 'e:/Roomhy-Website/Roohmy-Frontend/src/components/propertyowner/PropertyOwnerLayout.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /import \{[\s\S]*?\} from ['"]lucide-react['"];/,
  `import { 
  LayoutDashboard, BedDouble, ClipboardList, CalendarCheck, MessageCircle, 
  User, Settings, CreditCard, MapPin, MessageSquare, ChevronDown, UserCircle, 
  LogOut, Home, X, Plus, Menu, Bell, Settings2, Search, FileText, Users, Star, 
  AlertCircle, Wallet, Crown, Sparkles, Lock, Zap, ChevronRight, Check
} from 'lucide-react';
import { SILVER_NAV, GOLD_NAV } from './navConfig';`
);

content = content.replace(
  /const navConfig = useMemo[\s\S]*?\]\);/,
  `const [subscriptionTier, setSubscriptionTier] = useState(() => {
    return localStorage.getItem('propertyowner_subscription_tier') || 'gold';
  });
  const [expandedMenus, setExpandedMenus] = useState({});
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [targetUpgradeFeature, setTargetUpgradeFeature] = useState('');

  const toggleSubmenu = (label) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const CURRENT_NAV = subscriptionTier === 'gold' ? GOLD_NAV : SILVER_NAV;

  const handleParentClick = (e, item) => {
    if (subscriptionTier === 'silver' && item.goldOnly) {
      e.preventDefault();
      setTargetUpgradeFeature(item.label);
      setUpgradeModalOpen(true);
      return;
    }
    if (item.submenus) {
      e.preventDefault();
      toggleSubmenu(item.label);
    }
  };

  const handleSubLinkClick = (e, sub) => {
    if (subscriptionTier === 'silver' && sub.goldOnly) {
      e.preventDefault();
      setTargetUpgradeFeature(sub.label);
      setUpgradeModalOpen(true);
    }
  };

  const handleUpgrade = () => {
    setSubscriptionTier('gold');
    localStorage.setItem('propertyowner_subscription_tier', 'gold');
    setUpgradeModalOpen(false);
  };`
);

content = content.replace(
  /const renderNavItem = \(item, mobile = false\) => \{[\s\S]*?return \([\s\S]*?<\/Link>\n    \);\n  \};/,
  `const renderDynamicNavItem = (item) => {
    const isParentActive = isActivePath(pathname, item.href) || 
      (item.submenus && item.submenus.some(sub => isActivePath(pathname, sub.href)));
    const isParentLocked = subscriptionTier === 'silver' && item.goldOnly;
    const isExpanded = expandedMenus[item.label];

    return (
      <div key={item.label} className="space-y-1">
        <Link
          to={item.href || '#'}
          onClick={(e) => handleParentClick(e, item)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group cursor-pointer',
            isParentActive 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50',
            isParentLocked && 'opacity-60 hover:opacity-100'
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <item.icon size={18} className={cn(isParentActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300')} />
            <span className="font-bold text-sm truncate">{item.label}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {isParentLocked && <Lock size={12} className="text-yellow-500 shrink-0" />}
            {!isParentLocked && item.submenus && (
              <ChevronRight 
                size={14} 
                className={cn('text-slate-500 transition-transform duration-300', isExpanded && 'rotate-90 text-white')} 
              />
            )}
          </div>
        </Link>

        {isExpanded && item.submenus && (
          <div className="pl-6 space-y-1 mt-1 border-l-2 border-slate-700 ml-6">
            {item.submenus.map((sub) => {
              const isSubActive = isActivePath(pathname, sub.href);
              const isSubLocked = subscriptionTier === 'silver' && sub.goldOnly;

              return (
                <Link
                  key={sub.label}
                  to={sub.href}
                  onClick={(e) => handleSubLinkClick(e, sub)}
                  className={cn(
                    'flex items-center justify-between py-2 px-4 rounded-lg text-xs font-bold transition-all',
                    isSubActive 
                      ? 'bg-slate-800 text-white' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50',
                    isSubLocked && 'opacity-60 hover:opacity-100'
                  )}
                >
                  <span className="truncate">{sub.label}</span>
                  {isSubLocked && <Lock size={10} className="text-yellow-500 shrink-0" />}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };`
);

content = content.replace(
  /\{navConfig\.mobileItems\.map\(\(item\) => renderNavItem\(item, true\)\)\}/g,
  '{CURRENT_NAV.map(renderDynamicNavItem)}'
);

content = content.replace(
  /\{navConfig\.desktopItems\.map\(\(item\) => \{[\s\S]*?\}\)\}/,
  `{/* Subscription Plan Switcher */}
        <div className="px-4 mb-4 mt-2">
          <div className="bg-slate-800/50 rounded-xl p-1 flex items-center justify-between border border-slate-700/50">
            <button 
              onClick={() => {
                setSubscriptionTier('silver');
                localStorage.setItem('propertyowner_subscription_tier', 'silver');
              }}
              className={cn(
                'flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all',
                subscriptionTier === 'silver' 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              Silver
            </button>
            <button 
              onClick={() => {
                setSubscriptionTier('gold');
                localStorage.setItem('propertyowner_subscription_tier', 'gold');
              }}
              className={cn(
                'flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1',
                subscriptionTier === 'gold' 
                  ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' 
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Sparkles size={10} className="text-yellow-500" /> Gold
            </button>
          </div>
        </div>
        {CURRENT_NAV.map(renderDynamicNavItem)}`
);

content = content.replace(
  /\{\/\* Mobile Overlay \*\/\}/,
  `{/* Upgrade Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-blue-600 p-6 text-white relative">
              <button 
                onClick={() => setUpgradeModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X size={16} />
              </button>
              
              <div className="flex items-center gap-2 mb-2">
                 <div className="p-1 bg-yellow-400/20 text-yellow-300 rounded border border-yellow-400/30">
                    <Sparkles size={14} className="fill-yellow-300" />
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-300">Premium Upgrade</span>
              </div>
              <h3 className="text-xl font-bold">Unlock {targetUpgradeFeature}</h3>
              <p className="text-sm text-blue-100 mt-1">Upgrade to the Gold Plan to automate collections, analytics, and operational tasks.</p>
            </div>

            <div className="p-6">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Difference</span>
                  <span className="text-base font-bold text-slate-900 block mt-1">+₹20 / bed / month</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Fee</span>
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 inline-block mt-1">₹59 / bed</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setUpgradeModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  Maybe Later
                </button>
                <button 
                  onClick={handleUpgrade}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={16} /> Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Overlay */}`
);

fs.writeFileSync(file, content);
console.log('Successfully updated PropertyOwnerLayout.jsx');
