const fs = require('fs');
let content = fs.readFileSync('src/pages/superadmin/AddPropertyWizard.jsx', 'utf8');

// Replace SuperadminLayout with PropertyOwnerLayout
content = content.replace(
  'import { PageHeader } from "../../components/superadmin/PageHeader";',
  'import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";\nimport { PageHeader } from "../../components/superadmin/PageHeader";'
);

// Wrap the return with PropertyOwnerLayout
content = content.replace(
  'return (\n    <div className="min-h-screen bg-slate-50">',
  'return (\n    <PropertyOwnerLayout>\n    <div className="min-h-screen bg-slate-50">'
);

content = content.replace(
  '    </div>\n  );  \n}',
  '    </div>\n    </PropertyOwnerLayout>\n  );  \n}'
);

// Inject ownerLoginId to payload
content = content.replace(
  'status: "active",',
  'status: "pending_approval",\n        ownerLoginId: localStorage.getItem("propertyOwnerId") || "",'
);

fs.writeFileSync('src/pages/propertyowner/AddPropertyWizard.jsx', content);
console.log('Copied and modified AddPropertyWizard.jsx');
