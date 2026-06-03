const fs = require('fs');
const path = require('path');

const dir = 'src/pages/propertyowner';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const replacements = [
  { regex: /\bbg-white\b/g, replace: 'bg-card' },
  { regex: /\bbg-slate-50\/50\b/g, replace: 'bg-muted/30' },
  { regex: /\bbg-slate-50\b/g, replace: 'bg-muted/50' },
  { regex: /\bbg-slate-100\b/g, replace: 'bg-muted' },
  { regex: /\bborder-slate-50\b/g, replace: 'border-border/50' },
  { regex: /\bborder-slate-100\b/g, replace: 'border-border' },
  { regex: /\bborder-slate-200\b/g, replace: 'border-border' },
  { regex: /\bborder-dashed\b/g, replace: 'border-dashed border-border' }, // Add border-border if dashed
  { regex: /\btext-slate-900\b/g, replace: 'text-foreground' },
  { regex: /\btext-slate-800\b/g, replace: 'text-foreground' },
  { regex: /\btext-slate-700\b/g, replace: 'text-foreground' },
  { regex: /\btext-slate-600\b/g, replace: 'text-foreground/80' },
  { regex: /\btext-slate-500\b/g, replace: 'text-muted-foreground' },
  { regex: /\btext-slate-400\b/g, replace: 'text-muted-foreground' },
  { regex: /\btext-slate-300\b/g, replace: 'text-muted-foreground/60' },
  { regex: /\btext-blue-600\b/g, replace: 'text-primary' },
  { regex: /\btext-blue-500\b/g, replace: 'text-primary/80' },
  { regex: /\bbg-blue-600\b/g, replace: 'bg-primary' },
  { regex: /\bbg-blue-50\b/g, replace: 'bg-primary/10' },
  { regex: /\bborder-blue-100\b/g, replace: 'border-primary/20' },
  { regex: /\btext-rose-600\b/g, replace: 'text-destructive' },
  { regex: /\bbg-rose-50\b/g, replace: 'bg-destructive/10' },
  { regex: /\bborder-rose-100\b/g, replace: 'border-destructive/20' },
  { regex: /\btext-emerald-600\b/g, replace: 'text-success' },
  { regex: /\bbg-emerald-50\b/g, replace: 'bg-success/10' },
  { regex: /\bborder-emerald-100\b/g, replace: 'border-success/20' },
  { regex: /\bg-emerald-500\b/g, replace: 'bg-success' },
  { regex: /\bshadow-xl\b/g, replace: 'shadow-soft' },
  { regex: /\btext-3xl font-black\b/g, replace: 'font-serif text-[34px] md:text-[40px] leading-[1.05]' },
  { regex: /\btext-xl font-black\b/g, replace: 'text-[18px] font-semibold tracking-tight' },
  { regex: /\btext-lg font-semibold\b/g, replace: 'text-[16px] font-medium' },
  { regex: /\btext-sm font-bold\b/g, replace: 'text-[14px] font-medium' },
  { regex: /\btext-xs font-black uppercase tracking-widest\b/g, replace: 'text-[12px] font-medium uppercase tracking-wider' },
  { regex: /\btext-\[10px\] font-black uppercase tracking-widest\b/g, replace: 'text-[11px] font-medium uppercase tracking-wider' },
  { regex: /\brounded-\[32px\]\b/g, replace: 'rounded-2xl' },
  { regex: /\brounded-2xl\b/g, replace: 'rounded-xl' }
];

for (const file of files) {
  // Don't touch admin.jsx and properties.jsx as they were manually perfected
  if (file === 'admin.jsx' || file === 'properties.jsx') continue;
  
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Apply all regex replacements
  for (const { regex, replace } of replacements) {
    content = content.replace(regex, replace);
  }
  
  fs.writeFileSync(filePath, content);
  console.log('Restyled ' + file);
}
