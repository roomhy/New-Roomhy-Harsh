const fs = require('fs');
const path = require('path');

const layoutPath = path.resolve(__dirname, 'src', 'components', 'propertyowner', 'PropertyOwnerLayout.jsx');
let content = fs.readFileSync(layoutPath, 'utf-8');

const target = `  useEffect(() => {
    setMobileOpen(false);
    setNotificationOpen(false);
    setProfileOpen(false);
  }, [pathname]);`;

const replacement = `  useEffect(() => {
    setMobileOpen(false);
    setNotificationOpen(false);
    setProfileOpen(false);
    
    // Auto-expand the active section's menu so it doesn't collapse
    const activeParent = CURRENT_NAV.find(item => 
      item.href === pathname || 
      (item.submenus && item.submenus.some(sub => sub.href === pathname))
    );
    if (activeParent) {
      setExpandedMenus(prev => ({ ...prev, [activeParent.label]: true }));
    }
  }, [pathname, CURRENT_NAV]);`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
} else {
  // Try CRLF replacement
  const targetCRLF = target.replace(/\n/g, '\r\n');
  const replacementCRLF = replacement.replace(/\n/g, '\r\n');
  content = content.replace(targetCRLF, replacementCRLF);
}

fs.writeFileSync(layoutPath, content, 'utf-8');
console.log('PropertyOwnerLayout.jsx updated successfully!');
