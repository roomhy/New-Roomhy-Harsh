const fs = require('fs');

const layout = (name, eyebrow, title, subtitle) => `import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";

const Pill = ({ tone = "muted", children }) => {
  const t = { success: "bg-green-100 text-green-700", warning: "bg-amber-100 text-amber-700", danger: "bg-red-100 text-red-700", info: "bg-blue-100 text-blue-700", muted: "bg-gray-100 text-gray-600", primary: "bg-emerald-100 text-emerald-700" };
  return <span className={\`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium \${t[tone]||t.muted}\`}>{children}</span>;
};

export default function ${name}() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { window.location.href = "/propertyowner/ownerlogin"; return null; }
  return (
    <PropertyOwnerLayout owner={owner} title="${title}" onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">${eyebrow}</div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">${title}</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">${subtitle}</p>
        </div>
      </div>`;

const pages = {

'complaints.jsx': `import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { AlertCircle, CheckCircle2, Clock, Plus, Search } from "lucide-react";

const Pill = ({ tone="muted", children }) => {
  const t = { success:"bg-green-100 text-green-700", warning:"bg-amber-100 text-amber-700", danger:"bg-red-100 text-red-700", muted:"bg-gray-100 text-gray-600" };
  return <span className={\`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium \${t[tone]||t.muted}\`}>{children}</span>;
};

const StatCard = ({ label, value, icon:Icon, tone="muted" }) => {
  const bg = { muted:"bg-muted/40", warning:"bg-amber-50", success:"bg-green-50", danger:"bg-red-50" };
  return (
    <div className={\`rounded-2xl border border-border p-4 shadow-soft \${bg[tone]||bg.muted}\`}>
      <div className="flex items-center justify-between mb-3"><span className="text-[12.5px] text-muted-foreground font-medium">{label}</span>{Icon&&<Icon className="size-4 text-muted-foreground"/>}</div>
      <div className="font-serif text-[26px] leading-none text-foreground">{value}</div>
    </div>
  );
};

const mock = [
  { id:1, tenant:"Aarav Sharma", room:"A-101", issue:"Water leakage in bathroom", status:"open", date:"15 May", priority:"high" },
  { id:2, tenant:"Vihaan Gupta", room:"B-102", issue:"AC not cooling", status:"in-progress", date:"14 May", priority:"medium" },
  { id:3, tenant:"Aditya Iyer", room:"C-103", issue:"Light bulb replacement needed", status:"resolved", date:"12 May", priority:"low" },
  { id:4, tenant:"Rohan Mehta", room:"D-104", issue:"WiFi connectivity issues", status:"open", date:"11 May", priority:"medium" },
];

export default function Complaints() {
  const owner = getOwnerRuntimeSession();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  if (!owner?.loginId && typeof window !== "undefined") { window.location.href = "/propertyowner/ownerlogin"; return null; }
  const filtered = mock.filter(c => (tab==="all"||c.status===tab) && (!search||c.tenant.toLowerCase().includes(search.toLowerCase())||c.issue.toLowerCase().includes(search.toLowerCase())));
  return (
    <PropertyOwnerLayout owner={owner} title="Complaints" onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">Operations</div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Complaints</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Track and resolve tenant complaints from one place.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90 md:mt-2"><Plus className="size-4"/> Add Complaint</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={mock.length} icon={AlertCircle} tone="muted"/>
        <StatCard label="Open" value={mock.filter(c=>c.status==="open").length} icon={AlertCircle} tone="danger"/>
        <StatCard label="In Progress" value={mock.filter(c=>c.status==="in-progress").length} icon={Clock} tone="warning"/>
        <StatCard label="Resolved" value={mock.filter(c=>c.status==="resolved").length} icon={CheckCircle2} tone="success"/>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mb-4 border-b border-border">
        {[{k:"all",l:"All"},{k:"open",l:"Open"},{k:"in-progress",l:"In Progress"},{k:"resolved",l:"Resolved"}].map(({k,l}) => (
          <button key={k} onClick={()=>setTab(k)} className={\`px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors \${tab===k?"border-primary text-foreground":"border-transparent text-muted-foreground hover:text-foreground"}\`}>{l}</button>
        ))}
      </div>
      <div className="relative mb-4"><Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search complaints…" className="w-full h-10 pl-9 pr-3 rounded-lg bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"/></div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
              <th className="px-4 py-3 font-semibold">Tenant</th><th className="px-4 py-3 font-semibold">Room</th><th className="px-4 py-3 font-semibold">Issue</th><th className="px-4 py-3 font-semibold">Priority</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Date</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{c.tenant}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.room}</td>
                  <td className="px-4 py-3 text-foreground">{c.issue}</td>
                  <td className="px-4 py-3"><Pill tone={c.priority==="high"?"danger":c.priority==="medium"?"warning":"muted"}>{c.priority}</Pill></td>
                  <td className="px-4 py-3"><Pill tone={c.status==="resolved"?"success":c.status==="in-progress"?"warning":"danger"}>{c.status}</Pill></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}`,

'expense-tracking.jsx': `import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { Plus, Search, TrendingDown, IndianRupee } from "lucide-react";

const mock = [
  { id:1, category:"Maintenance", desc:"Plumber charges", amount:2500, date:"15 May", paid:"Cash" },
  { id:2, category:"Electricity", desc:"May electricity bill", amount:8200, date:"14 May", paid:"UPI" },
  { id:3, category:"Cleaning", desc:"Monthly housekeeping", amount:3500, date:"12 May", paid:"Bank" },
  { id:4, category:"Internet", desc:"Broadband monthly", amount:1800, date:"10 May", paid:"Auto-debit" },
  { id:5, category:"Repairs", desc:"Water motor repair", amount:4500, date:"8 May", paid:"Cash" },
];

export default function ExpenseTracking() {
  const owner = getOwnerRuntimeSession();
  const [search, setSearch] = useState("");
  if (!owner?.loginId && typeof window !== "undefined") { window.location.href = "/propertyowner/ownerlogin"; return null; }
  const filtered = mock.filter(e => !search || e.desc.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()));
  const total = mock.reduce((s,e)=>s+e.amount,0);
  return (
    <PropertyOwnerLayout owner={owner} title="Expenses" onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">Accounting</div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Expenses</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Track all property expenses in one place.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90 md:mt-2"><Plus className="size-4"/> Add Expense</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-border bg-red-50 p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3"><span className="text-[12.5px] text-muted-foreground font-medium">This Month</span><TrendingDown className="size-4 text-red-400"/></div>
          <div className="font-serif text-[26px] leading-none text-foreground">₹{total.toLocaleString("en-IN")}</div>
          <div className="text-[11.5px] text-muted-foreground mt-1.5">{mock.length} transactions</div>
        </div>
        <div className="rounded-2xl border border-border bg-muted/40 p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3"><span className="text-[12.5px] text-muted-foreground font-medium">Avg per day</span><IndianRupee className="size-4 text-muted-foreground"/></div>
          <div className="font-serif text-[26px] leading-none text-foreground">₹{Math.round(total/30).toLocaleString("en-IN")}</div>
        </div>
        <div className="rounded-2xl border border-border bg-muted/40 p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3"><span className="text-[12.5px] text-muted-foreground font-medium">Largest Expense</span><IndianRupee className="size-4 text-muted-foreground"/></div>
          <div className="font-serif text-[26px] leading-none text-foreground">₹{Math.max(...mock.map(e=>e.amount)).toLocaleString("en-IN")}</div>
        </div>
      </div>
      <div className="relative mb-4"><Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search expenses…" className="w-full h-10 pl-9 pr-3 rounded-lg bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"/></div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto"><table className="w-full text-[13px]">
          <thead><tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
            <th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Description</th><th className="px-4 py-3 font-semibold">Amount</th><th className="px-4 py-3 font-semibold">Payment</th><th className="px-4 py-3 font-semibold">Date</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(e=>(
              <tr key={e.id} className="hover:bg-muted/40 transition-colors">
                <td className="px-4 py-3"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-muted text-muted-foreground">{e.category}</span></td>
                <td className="px-4 py-3 text-foreground">{e.desc}</td>
                <td className="px-4 py-3 font-medium text-destructive">-₹{e.amount.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.paid}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </PropertyOwnerLayout>
  );
}`,

'enquiry.jsx': `import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { Search, Plus, Phone, MessageCircle, MoreHorizontal } from "lucide-react";

const Pill = ({ tone="muted", children }) => {
  const t = { success:"bg-green-100 text-green-700", warning:"bg-amber-100 text-amber-700", muted:"bg-gray-100 text-gray-600", info:"bg-blue-100 text-blue-700" };
  return <span className={\`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium \${t[tone]||t.muted}\`}>{children}</span>;
};

const leads = [
  { id:1, name:"Rahul Verma", phone:"+91 98001 11111", source:"Website", interest:"Single AC Room", status:"new", date:"Today" },
  { id:2, name:"Priya Singh", phone:"+91 98002 22222", source:"WhatsApp", interest:"Double Sharing", status:"follow-up", date:"Yesterday" },
  { id:3, name:"Amit Kumar", phone:"+91 98003 33333", source:"Referral", interest:"Triple Sharing", status:"site-visit", date:"14 May" },
  { id:4, name:"Neha Sharma", phone:"+91 98004 44444", source:"Instagram", interest:"Single Room", status:"new", date:"13 May" },
];

export default function Enquiry() {
  const owner = getOwnerRuntimeSession();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  if (!owner?.loginId && typeof window !== "undefined") { window.location.href = "/propertyowner/ownerlogin"; return null; }
  const filtered = leads.filter(l=>(tab==="all"||l.status===tab)&&(!search||l.name.toLowerCase().includes(search.toLowerCase())));
  return (
    <PropertyOwnerLayout owner={owner} title="Leads & Enquiries" onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">Leads</div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Leads &amp; Enquiries</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Track every lead and convert them to tenants.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90 md:mt-2"><Plus className="size-4"/> Add Lead</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[{l:"Total",v:leads.length},{l:"New",v:leads.filter(x=>x.status==="new").length},{l:"Follow-up",v:leads.filter(x=>x.status==="follow-up").length},{l:"Site Visit",v:leads.filter(x=>x.status==="site-visit").length}].map(({l,v})=>(
          <div key={l} className="rounded-2xl border border-border bg-card p-4 shadow-soft text-center">
            <div className="font-serif text-[28px] text-foreground">{v}</div>
            <div className="text-[12px] text-muted-foreground mt-1">{l}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mb-4 border-b border-border">
        {[{k:"all",l:"All"},{k:"new",l:"New"},{k:"follow-up",l:"Follow-up"},{k:"site-visit",l:"Site Visit"}].map(({k,l})=>(
          <button key={k} onClick={()=>setTab(k)} className={\`px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors \${tab===k?"border-primary text-foreground":"border-transparent text-muted-foreground hover:text-foreground"}\`}>{l}</button>
        ))}
      </div>
      <div className="relative mb-4"><Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search leads…" className="w-full h-10 pl-9 pr-3 rounded-lg bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"/></div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto"><table className="w-full text-[13px]">
          <thead><tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
            <th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 font-semibold">Contact</th><th className="px-4 py-3 font-semibold">Interest</th><th className="px-4 py-3 font-semibold">Source</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 w-10"></th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(l=>(
              <tr key={l.id} className="hover:bg-muted/40 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{l.name}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-1 text-muted-foreground text-[11.5px]"><Phone className="size-3"/>{l.phone}</div></td>
                <td className="px-4 py-3 text-muted-foreground">{l.interest}</td>
                <td className="px-4 py-3"><Pill tone="info">{l.source}</Pill></td>
                <td className="px-4 py-3"><Pill tone={l.status==="new"?"info":l.status==="site-visit"?"success":"warning"}>{l.status}</Pill></td>
                <td className="px-4 py-3 text-muted-foreground">{l.date}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-1"><button className="size-8 rounded-md hover:bg-muted grid place-items-center"><MessageCircle className="size-3.5 text-green-600"/></button><button className="size-8 rounded-md hover:bg-muted grid place-items-center"><MoreHorizontal className="size-4 text-muted-foreground"/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </PropertyOwnerLayout>
  );
}`,

};

// Write each page
Object.entries(pages).forEach(([filename, content]) => {
  fs.writeFileSync(`src/pages/propertyowner/${filename}`, content);
  console.log('Written:', filename);
});
console.log('Done batch 1');
