const fs = require('fs');
const path = 'e:/Roomhy-Website/Roohmy-Frontend/src/pages/superadmin/AddPropertyWizard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace Rent Type block
content = content.replace(/<div className="w-\[18%\]">[\s\S]*?<\/select>\s*<\/div>/, `<div>
                                    <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Rent Type</label>
                                    <select value={pricing.rentType} onChange={e => setPricing({...pricing, rentType: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-[10px] font-black outline-none hover:bg-white focus:border-blue-200 transition-all">
                                       <option>Per Bed</option><option>Per Room</option>
                                    </select>
                                 </div>`);

// Replace Discount block
content = content.replace(/<div className="w-\[15%\]">\s*<FormField label="Discount"[\s\S]*?\/>\s*<\/div>/, `<div>
                                    <FormField label="Discount" value={pricing.discountPercent} onChange={e => setPricing({...pricing, discountPercent: e.target.value})} suffix="%" placeholder="0" />
                                 </div>`);

// Replace Security Deposit block
content = content.replace(/<div className="w-\[17%\]">\s*<FormField label="Security Deposit"[\s\S]*?\/>\s*<\/div>/, `<div>
                                    <FormField label="Security Deposit" value={pricing.securityDeposit} onChange={e => setPricing({...pricing, securityDeposit: e.target.value})} prefix="₹" placeholder="10000" />
                                 </div>`);

// Replace Advance Rent block
content = content.replace(/<div className="w-\[17%\]">\s*<FormField label="Advance Rent"[\s\S]*?\/>\s*<\/div>/, `<div>
                                    <FormField label="Advance Rent" value={pricing.advanceRent} onChange={e => setPricing({...pricing, advanceRent: e.target.value})} prefix="₹" placeholder="5000" />
                                 </div>`);

// Replace Notice block
content = content.replace(/<div className="w-\[15%\]">\s*<label className="text-\[9px\] font-black text-slate-800 uppercase mb-2 block tracking-tight whitespace-nowrap">Notice<\/label>[\s\S]*?<\/div>/, `<div>
                                    <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Notice Period</label>
                                    <select value={pricing.noticePeriod} onChange={e => setPricing({...pricing, noticePeriod: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-[10px] font-black outline-none hover:bg-white focus:border-blue-200 transition-all">
                                       <option>15 Days</option><option>30 Days</option><option>45 Days</option><option>60 Days</option>
                                    </select>
                                 </div>`);

// Replace Lock-in block
content = content.replace(/<div className="flex-1">\s*<label className="text-\[9px\] font-black text-slate-800 uppercase mb-2 block tracking-tight whitespace-nowrap">Lock-in Period<\/label>[\s\S]*?<\/div>/, `<div>
                                    <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Lock-in Period</label>
                                    <select value={pricing.lockInPeriod} onChange={e => setPricing({...pricing, lockInPeriod: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-[10px] font-black outline-none hover:bg-white focus:border-blue-200 transition-all">
                                       <option>None</option><option>1 Month</option><option>3 Months</option><option>6 Months</option><option>1 Year</option>
                                    </select>
                                 </div>`);

fs.writeFileSync(path, content);
console.log('Update successful');
