import React, { useEffect } from "react";
import { useHtmlPage } from "../../utils/htmlPage";

export default function PlatformReports() {
  useHtmlPage({
    title: "Roomhy - Platform Reports",
    bodyClass: "text-slate-800",
    htmlAttrs: {
  "lang": "en"
},
    metas: [
  {
  "charset": "UTF-8"
},
  {
  "name": "viewport",
  "content": "width=device-width, initial-scale=1.0"
}
],
    bases: [],
    links: [
  {
  "rel": "preconnect",
  "href": "https://fonts.googleapis.com"
},
  {
  "rel": "preconnect",
  "href": "https://fonts.gstatic",
  "crossorigin": true
},
  {
  "href": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
  "rel": "stylesheet"
},
  {
  "rel": "stylesheet",
  "href": "/superadmin/assets/css/platform_reports.css"
}
],
    styles: [],
    scripts: [
  {
  "src": "https://cdn.tailwindcss.com"
},
  {
  "src": "https://unpkg.com/lucide@latest"
}
],
    inlineScripts: []
  });

  useEffect(() => {
    if (window?.lucide) window.lucide.createIcons();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Platform Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Generate comprehensive reports on revenue, occupancy, and growth.</p>
          </div>
          
          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm p-1.5 w-fit">
            <button className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all">Last 30 Days</button>
            <button className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 rounded-lg shadow-md shadow-purple-200">This Quarter</button>
            <button className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all">Last Year</button>
            <div className="w-px h-4 bg-slate-200 mx-2"></div>
            <button className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-800 flex items-center transition-all">
              <i data-lucide="calendar" className="w-3.5 h-3.5 mr-2"></i> Custom
            </button>
          </div>
        </div>

        {/* Report Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Financial Report */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <i data-lucide="banknote" className="w-6 h-6"></i>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">+12% Growth</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Financial Report</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6 font-medium uppercase tracking-tight">Revenue, Expenses, Payouts</p>
            <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center transition-all border border-slate-100">
              <i data-lucide="download" className="w-4 h-4 mr-2"></i> Download PDF
            </button>
          </div>

          {/* Occupancy Report */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <i data-lucide="home" className="w-6 h-6"></i>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">85% Occupied</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Occupancy Report</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6 font-medium uppercase tracking-tight">Vacancies, Turnover Rates</p>
            <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center transition-all border border-slate-100">
              <i data-lucide="download" className="w-4 h-4 mr-2"></i> Download CSV
            </button>
          </div>

          {/* User Growth */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <i data-lucide="users" className="w-6 h-6"></i>
              </div>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">+45 New</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">User Growth</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6 font-medium uppercase tracking-tight">New Tenants & Owners</p>
            <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center transition-all border border-slate-100">
              <i data-lucide="download" className="w-4 h-4 mr-2"></i> Download CSV
            </button>
          </div>

          {/* Property Performance */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-orange-50 rounded-xl text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <i data-lucide="star" className="w-6 h-6"></i>
              </div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-wider">4.2 Avg Rating</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Property Perf.</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6 font-medium uppercase tracking-tight">Ratings, Complaints, ROI</p>
            <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center transition-all border border-slate-100">
              <i data-lucide="download" className="w-4 h-4 mr-2"></i> Download PDF
            </button>
          </div>
        </div>

        {/* Visual Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Revenue Trend Chart */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Revenue Trend</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Platform-wide performance</p>
              </div>
              <select className="text-xs font-bold text-slate-600 border-slate-200 rounded-xl px-3 py-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all">
                <option>Monthly View</option>
                <option>Quarterly View</option>
              </select>
            </div>
            {/* Chart Representation */}
            <div className="h-64 w-full flex items-end justify-around p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 relative gap-2 sm:gap-4">
              <div className="flex-1 bg-purple-200 rounded-xl h-1/4 relative group cursor-pointer hover:bg-purple-500 transition-all">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10 whitespace-nowrap">₹20k</div>
              </div>
              <div className="flex-1 bg-purple-300 rounded-xl h-1/3 relative group cursor-pointer hover:bg-purple-500 transition-all">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10 whitespace-nowrap">₹35k</div>
              </div>
              <div className="flex-1 bg-purple-400 rounded-xl h-1/2 relative group cursor-pointer hover:bg-purple-500 transition-all shadow-md shadow-purple-100">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10 whitespace-nowrap">₹50k</div>
              </div>
              <div className="flex-1 bg-purple-500 rounded-xl h-2/3 relative group cursor-pointer hover:bg-purple-600 transition-all shadow-md shadow-purple-200">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10 whitespace-nowrap">₹75k</div>
              </div>
              <div className="flex-1 bg-purple-600 rounded-xl h-3/4 relative group cursor-pointer hover:bg-purple-700 transition-all shadow-lg shadow-purple-300">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10 whitespace-nowrap">₹90k</div>
              </div>
              <div className="flex-1 bg-indigo-600 rounded-xl h-full relative group cursor-pointer hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10 whitespace-nowrap">₹1.2L</div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-4 px-2 uppercase tracking-widest">
              <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
            </div>
          </div>

          {/* Occupancy Distribution */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Occupancy by Area</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Regional breakdown</p>
              </div>
              <button className="text-xs font-bold text-purple-600 hover:text-purple-700 uppercase tracking-widest">View Details</button>
            </div>
            
            <div className="space-y-6">
              <div className="group">
                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tight">
                  <span className="text-slate-700">Koramangala</span>
                  <span className="text-slate-400 group-hover:text-blue-600 transition-colors">92% Occupied</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                  <div className="bg-blue-600 h-2 rounded-full shadow-sm shadow-blue-200" style={{ width: "92%" }}></div>
                </div>
              </div>
              <div className="group">
                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tight">
                  <span className="text-slate-700">Indiranagar</span>
                  <span className="text-slate-400 group-hover:text-blue-500 transition-colors">78% Occupied</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                  <div className="bg-blue-500 h-2 rounded-full shadow-sm shadow-blue-100" style={{ width: "78%" }}></div>
                </div>
              </div>
              <div className="group">
                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tight">
                  <span className="text-slate-700">Whitefield</span>
                  <span className="text-slate-400 group-hover:text-blue-400 transition-colors">65% Occupied</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                  <div className="bg-blue-400 h-2 rounded-full shadow-sm shadow-blue-50" style={{ width: "65%" }}></div>
                </div>
              </div>
              <div className="group">
                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tight">
                  <span className="text-slate-700">HSR Layout</span>
                  <span className="text-slate-400 group-hover:text-blue-300 transition-colors">45% Occupied</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                  <div className="bg-blue-300 h-2 rounded-full shadow-sm shadow-blue-50" style={{ width: "45%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
