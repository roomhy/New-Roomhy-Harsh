const fs = require('fs');
let content = fs.readFileSync('src/pages/superadmin/AddPropertyWizard.jsx', 'utf8');

// Add PropertyOwnerLayout import
content = content.replace(
  'import { PageHeader } from "../../components/superadmin/PageHeader";',
  'import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";\nimport { PageHeader } from "../../components/superadmin/PageHeader";'
);

// Wrap main return with PropertyOwnerLayout
content = content.replace(
  'return (\n    <div className="min-h-full bg-white">',
  'return (\n    <PropertyOwnerLayout>\n    <div className="min-h-full bg-white">'
);

// Close PropertyOwnerLayout at the very end
content = content.replace(
  '    </div>\n  );  \n}',
  '    </div>\n    </PropertyOwnerLayout>\n  );  \n}'
);

// Wrap submitted return with PropertyOwnerLayout
content = content.replace(
  'return (\n      <div className="min-h-full bg-white flex items-center justify-center p-8">',
  'return (\n      <PropertyOwnerLayout>\n      <div className="min-h-full bg-white flex items-center justify-center p-8">'
);

content = content.replace(
  '      </div>\n    );\n  }',
  '      </div>\n      </PropertyOwnerLayout>\n    );\n  }'
);

// Inject ownerLoginId to payload
content = content.replace(
  'status: "active",',
  'status: "pending_approval",\n        ownerLoginId: localStorage.getItem("propertyOwnerId") || "",'
);

// Change the navigate on success to owner properties
content = content.replace(
  'navigate("/superadmin/total-properties")',
  'navigate("/propertyowner/properties")'
);

fs.writeFileSync('src/pages/propertyowner/AddPropertyWizard.jsx', content);
console.log('Successfully copied and modified AddPropertyWizard.jsx');
