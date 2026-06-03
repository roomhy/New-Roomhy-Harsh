const fs = require('fs');
const file = 'src/components/propertyowner/PropertyOwnerLayout.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add specific lucide react icons exactly at the lucide-react import
const lucideImportMatch = content.match(/import\s*\{([^}]*)\}\s*from\s*['"]lucide-react['"]/);
if (lucideImportMatch) {
  const existingImports = lucideImportMatch[1];
  const requiredIcons = ['Lock', 'ChevronRight', 'Crown', 'Check', 'Zap', 'Users', 'BookOpen', 'FileText', 'Smartphone', 'Wallet', 'PieChart', 'Shield', 'Target', 'Navigation', 'Megaphone', 'Coffee', 'Receipt', 'Sparkles', 'LinkIcon'];
  let missingIcons = [];
  
  requiredIcons.forEach(icon => {
    if (!existingImports.includes(icon)) missingIcons.push(icon);
  });
  
  if (missingIcons.length > 0) {
    const newImports = existingImports.trim() + ', ' + missingIcons.join(', ');
    content = content.replace(lucideImportMatch[0], `import { ${newImports} } from "lucide-react"`);
  }
}

// Add navConfig import
if (!content.includes('import { SILVER_NAV')) {
  content = content.replace(/import \{[\s\S]*?\} from ["']lucide-react["'];/, match => 
    match + '\nimport { SILVER_NAV, GOLD_NAV } from \'./navConfig\';'
  );
}

// Ensure useLocation and Link from react-router-dom are imported
if (!content.includes('import { Link')) {
  content = content.replace(/import React[\s\S]*?;/, match => match + '\nimport { Link, useLocation } from "react-router-dom";');
}

// Replace renderNavItem logic
const renderNavItemRegex = /const renderNavItem = \([\s\S]*?<\/Link>\r?\n\s*\);\r?\n\s*\};/;
if (content.match(renderNavItemRegex)) {
  const newRenderNav = `const renderDynamicNavItem = (item) => {
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
            {item.icon ? <item.icon size={18} className={cn(isParentActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300')} /> : <span className="w-[18px]" />}
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
  };`;
  content = content.replace(renderNavItemRegex, newRenderNav);
}

// Add state and hooks
if (!content.includes('const [subscriptionTier, setSubscriptionTier]')) {
  content = content.replace(
    /const \[notificationOpen, setNotificationOpen\] = useState\(false\);/,
    `const [notificationOpen, setNotificationOpen] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState(() => localStorage.getItem('propertyowner_subscription_tier') || 'silver');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    localStorage.setItem('propertyowner_subscription_tier', subscriptionTier);
  }, [subscriptionTier]);

  const CURRENT_NAV = subscriptionTier === 'gold' ? GOLD_NAV : SILVER_NAV;

  const handleParentClick = (e, item) => {
    if (subscriptionTier === 'silver' && item.goldOnly) {
      e.preventDefault();
      setShowUpgradeModal(true);
      return;
    }
    if (item.submenus) {
      e.preventDefault();
      setExpandedMenus(prev => ({ ...prev, [item.label]: !prev[item.label] }));
    } else {
      if (window.innerWidth < 1024) setMobileOpen(false);
    }
  };

  const handleSubLinkClick = (e, sub) => {
    if (subscriptionTier === 'silver' && sub.goldOnly) {
      e.preventDefault();
      setShowUpgradeModal(true);
      return;
    }
    if (window.innerWidth < 1024) setMobileOpen(false);
  };`
  );
}

// Replace nav mappings
content = content.replace(/navConfig\.desktopItems\.map\(\(item\) => renderNavItem\(item\)\)/g, 'CURRENT_NAV.map(renderDynamicNavItem)');
content = content.replace(/navConfig\.mobileItems\.map\(\(item\) => renderNavItem\(item, true\)\)/g, 'CURRENT_NAV.map(renderDynamicNavItem)');
content = content.replace(/navConfig\.desktopItems\.map/g, 'CURRENT_NAV.map');
content = content.replace(/navConfig\.mobileItems\.map/g, 'CURRENT_NAV.map');
content = content.replace(/\{renderNavItem\((.*?)\)\}/g, '{renderDynamicNavItem($1)}');

// Inject the Upgrade Modal and Tier Switcher
if (!content.includes('Upgrade to Gold Plan')) {
  const modalUI = `
      {/* Plan Switcher (Dev Mode) */}
      <div className="fixed bottom-6 right-6 z-50 flex bg-white rounded-full p-1 shadow-2xl border border-slate-100">
        <button
          onClick={() => setSubscriptionTier('silver')}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-bold transition-all",
            subscriptionTier === 'silver' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
          )}
        >
          Silver Tier
        </button>
        <button
          onClick={() => setSubscriptionTier('gold')}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1",
            subscriptionTier === 'gold' ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md shadow-orange-500/30" : "text-slate-500 hover:text-orange-500"
          )}
        >
          <Crown size={12} /> Gold Tier
        </button>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-opacity">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden border border-slate-100 transform transition-transform">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 -z-0" />
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl -z-0" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-6 mt-4 mx-auto">
                <Crown size={32} className="text-white" />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Upgrade to Gold Plan</h3>
                <p className="text-sm font-medium text-slate-500">Unlock this feature and get access to premium tools, AI recommendations, and priority support.</p>
              </div>

              <div className="space-y-3 mb-8">
                {['Advanced AI Recommendor', 'Instant Payment Receipts', 'Priority Support 24/7'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Check size={14} className="text-emerald-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-yellow-500/30 transition-all flex items-center justify-center gap-2 group"
              >
                <Zap size={18} className="group-hover:scale-110 transition-transform" />
                Upgrade Now - ₹59/month
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;
  content = content.replace(/<\/div>\n    <\/div>\n  \);\n\}/, modalUI + '\n}');
}

fs.writeFileSync(file, content);
console.log('Layout patched successfully!');
