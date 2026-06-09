import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { apiFetch } from "../../services/api";
import { 
  FileSpreadsheet, FileText, CheckCircle2, 
  Search, Loader2, AlertCircle, Calendar, Download
} from "lucide-react";

export default function ReportsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [busyReport, setBusyReport] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const reportsList = [
    { name: "All tenant ledger report", category: "Financial", format: "Excel", fields: ["Tenant, Room No & DOJ", "Monthly Rent Amount", "Invoice Amount", "Invoice Collected", "Total unpaid", "Total paid"] },
    { name: "Detailed Tenant Report", category: "Tenant", format: "Excel", fields: ["List of Tenant & Rooms", "Tenant KYC Details", "Unpaid Dues", "Collected Amount", "Remarks & Descriptions"] },
    { name: "All Bookings Report", category: "Occupancy", format: "Excel", fields: ["List of Tenant & Rooms", "Tenant KYC Details", "Unpaid Dues", "Collected Amount", "Remarks & Descriptions"] },
    { name: "Tenant Report", category: "Tenant", format: "Excel", fields: ["List of Tenant & Rooms", "Tenant KYC Details", "Unpaid Dues", "Collected Amount", "Remarks & Descriptions"] },
    { name: "Dues PDF", category: "Financial", format: "PDF", fields: ["Tenant & Room No.", "Unpaid Dues Amount", "Dues Category", "Descriptions"] },
    { name: "Dues Report", category: "Financial", format: "Excel", fields: ["Tenant & Room No.", "Unpaid Dues Amount", "Active Discounts", "Dues Category", "Remarks & Descriptions"] },
    { name: "Collection PDF", category: "Financial", format: "PDF", fields: ["Tenant & Room No.", "Date & Time", "Collection Amount", "Payment Mode", "Received By", "UTR No."] },
    { name: "Collection Report", category: "Financial", format: "Excel", fields: ["Collection Amount", "Date & Time", "Tenant & Room No.", "Payment Mode", "UTR No.", "Received By"] },
    { name: "Bank Settlement Report", category: "Financial", format: "Excel", fields: ["Tenant & Room No.", "Collected Amount", "Date & Time", "Dues Category", "UTR No.", "Bank Account"] },
    { name: "Monthly Financial Statement", category: "Financial", format: "Excel", fields: ["Tenant & Room No.", "All Transactions", "Transaction Details", "Remarks & Descriptions"] },
    { name: "Expense Report", category: "Financial", format: "Excel", fields: ["All Expenses", "Date & Time", "Payer Name", "Vendor Name", "Remarks & Descriptions"] },
    { name: "Bed Occupancy Report", category: "Occupancy", format: "Excel", fields: ["Tenant & Room No.", "Occupany Status", "DOJ & DOL", "Unpaid Dues", "Remarks & Descriptions"] },
    { name: "Room Occupancy Report", category: "Occupancy", format: "Excel", fields: ["Tenant & Room No.", "Occupany Status", "Unpaid Dues", "Projected Rent", "Remarks & Descriptions"] },
    { name: "Lead Report", category: "Lead", format: "Excel", fields: ["Lead Name", "Contact Details", "Latest Status", "Requirements", "Token Amount"] },
    { name: "Old Tenant Report", category: "Tenant", format: "Excel", fields: ["Tenant Details", "Eviction Date", "Unpaid Dues & Loss", "Reason of Eviction"] },
    { name: "Complaint Report", category: "Complaint", format: "Excel", fields: ["Complaint Details", "Complaint image", "Latest Status", "Tenant & Room No."] },
    { name: "Invited Guests Report", category: "Tenant", format: "Excel", fields: ["Tenant & Room No.", "Guest Name", "Guest Contact", "Stay Date and Timings"] },
    { name: "Late Check-in Report (PDF & Excel)", category: "Attendance", format: "Excel", fields: ["Tenant & Room No.", "Tenant Contact", "Late Check-in Date & Time", "Late Check-in reason"] },
    { name: "Rent Generation Report", category: "Financial", format: "Excel", fields: ["Tenant, Room No & DOJ", "Monthly Rent Amount", "Rent Addition Status", "Rent Addition Date", "Rent Review Remarks", "Total unpaid dues"] },
    { name: "All Property Monthly Summary Report", category: "Financial", format: "Excel", fields: ["Rooms & Tenants Count", "Bookings & Leads Count", "Current Month Dues", "Dues Breakup", "Current Month Collections"] },
    { name: "All Property Summary Report", category: "Financial", format: "Excel", fields: ["Rooms & Tenants Count", "Bookings & Leads Count", "Total Potential Collection", "Dues Breakup", "Total Collection Till Now", "Total Dues Till Now"] },
    { name: "FlexiPe Report", category: "Financial", format: "Excel", fields: ["Transaction Date", "Credit Amount", "Debit Amount", "Status", "Destination of funds", "Payee Details", "Payer Details", "UTR & Bank Details"] },
    { name: "Kyc Credits Report", category: "Tenant", format: "Excel", fields: ["Property Name", "Available Credits", "Consumed Credits", "Used By Tenants", "Unverified Tenants"] },
    { name: "Tenant Monthly Ledger Report", category: "Financial", format: "Excel", fields: ["Tenant Name", "Tenant's phone", "Tenant's Status", "Room", "Fixed Rent", "Total Available Deposit", "Total Unpaid Amount", "Total Paid Amount", "Unpaid Dues (by type)", "Due Dates (by type)", "Paid Dues (by type)", "Paid Dates (by type)"] },
    { name: "Notice Report", category: "Tenant", format: "Excel", fields: ["Tenant Name", "Room No.", "Notice Period", "Notice Date", "Notice Raised By", "Notice Approved By", "Move-out On", "Notice Raised On", "Eviction Due On"] },
    { name: "Cashflow Report", category: "Financial", format: "Excel", fields: ["Date", "Collection (+)", "Refunds (-)", "Expenses (-)", "Gross Profit"] },
    { name: "Agreement Renewal Report", category: "Tenant", format: "Excel", fields: ["Property", "Tenant Name", "Agreement Status", "Current Agreement Start Date", "Agreement Duration", "Current Agreement End Date", "Agreement Link", "Current Fixed Rent"] },
    { name: "Activity Log Report", category: "Tenant", format: "Excel", fields: ["Date", "RentOk ID", "Activity Content", "Performed By", "Activity Category", "Activity Type", "Activity on Entity"] },
    { name: "Historical Booking Report", category: "Occupancy", format: "Excel", fields: ["Tenant Name", "Room", "Bed", "Status", "Date of Joining", "Date of Eviction", "Total Pending Dues", "Total Collection", "Loss"] },
    { name: "Food Attendance Report", category: "Attendance", format: "Excel", fields: ["Date", "Tenant Name", "Phone", "Room", "Breakfast Confirmed", "Breakfast Attended", "Breakfast Attended Time"] },
    { name: "Attendance Report", category: "Attendance", format: "Excel", fields: ["Tenant Name", "Attendance Status", "Face Score", "Recorded By"] }
  ];

  const [expandedCategories, setExpandedCategories] = useState({
    "Financial": true, "Occupancy": false, "Tenant": false, "Lead": false, "Complaint": false, "Attendance": false
  });

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredReports = reportsList.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedReports = {};
  filteredReports.forEach(r => {
    const cat = r.category || "Other";
    if (!groupedReports[cat]) groupedReports[cat] = [];
    groupedReports[cat].push(r);
  });


  const handleGenerate = async (r) => {
    setBusyReport(r.name);
    setSuccessMsg("");
    try {
      const res = await apiFetch("/api/reports/generate", {
        method: "POST",
        body: JSON.stringify({
          ownerLoginId: owner.loginId,
          reportName: r.name,
          format: r.format,
          fields: r.fields
        })
      });
      if (res && res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(""), 4000);
        
        // Trigger download
        if (res.fileContent) {
          const blob = new Blob([res.fileContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `${r.name.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate report.");
    } finally {
      setBusyReport(null);
    }
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Reports" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 hidden md:flex">
        <div>
          <h1 className="text-[20px] md:text-[44px] font-bold md:font-serif leading-[1.05] text-foreground">Reports</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Generate and download comprehensive analytics, ledgers, and operational reports.</p>
        </div>
      </div>


      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-800">
          <CheckCircle2 className="size-5" />
          <p className="font-semibold text-sm">{successMsg}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Grouped Reports Accordion */}
      <div className="space-y-4">
        {Object.entries(groupedReports).map(([category, reports], cIdx) => (
          <div key={cIdx} className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
            <button 
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-[16px] font-black text-slate-800">{category} Reports</h2>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{reports.length} Reports</p>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition-transform duration-300 ${expandedCategories[category] ? "rotate-180 bg-slate-100" : ""}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </button>

            {expandedCategories[category] && (
              <div className="p-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white">
                {reports.map((r, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between h-full group">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                          {r.format === "PDF" ? (
                            <FileText className="size-4 text-rose-500" />
                          ) : (
                            <FileSpreadsheet className="size-4 text-emerald-600" />
                          )}
                        </div>
                        <h3 className="text-[16px] font-bold text-slate-800 leading-tight">
                          {r.name}
                        </h3>
                      </div>

                      <div className="space-y-1.5 mb-6 pl-1">
                        {r.fields.slice(0, 3).map((field, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5"></div>
                            <span className="text-[12px] text-slate-600 font-medium leading-tight">{field}</span>
                          </div>
                        ))}
                        {r.fields.length > 3 && (
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-3 mt-2">
                            + {r.fields.length - 3} more fields
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto pt-3 border-t border-slate-50">
                      <button 
                        onClick={() => handleGenerate(r)}
                        disabled={busyReport !== null}
                        className="flex-[2] h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {busyReport === r.name ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                        Generate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredReports.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No reports match your search query.
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
