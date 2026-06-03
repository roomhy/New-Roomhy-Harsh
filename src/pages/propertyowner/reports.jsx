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
    { name: "All tenant ledger report", format: "Excel", fields: ["Tenant, Room No & DOJ", "Monthly Rent Amount", "Invoice Amount", "Invoice Collected", "Total unpaid", "Total paid"] },
    { name: "Detailed Tenant Report", format: "Excel", fields: ["List of Tenant & Rooms", "Tenant KYC Details", "Unpaid Dues", "Collected Amount", "Remarks & Descriptions"] },
    { name: "All Bookings Report", format: "Excel", fields: ["List of Tenant & Rooms", "Tenant KYC Details", "Unpaid Dues", "Collected Amount", "Remarks & Descriptions"] },
    { name: "Tenant Report", format: "Excel", fields: ["List of Tenant & Rooms", "Tenant KYC Details", "Unpaid Dues", "Collected Amount", "Remarks & Descriptions"] },
    { name: "Dues PDF", format: "PDF", fields: ["Tenant & Room No.", "Unpaid Dues Amount", "Dues Category", "Descriptions"] },
    { name: "Dues Report", format: "Excel", fields: ["Tenant & Room No.", "Unpaid Dues Amount", "Active Discounts", "Dues Category", "Remarks & Descriptions"] },
    { name: "Collection PDF", format: "PDF", fields: ["Tenant & Room No.", "Date & Time", "Collection Amount", "Payment Mode", "Received By", "UTR No."] },
    { name: "Collection Report", format: "Excel", fields: ["Collection Amount", "Date & Time", "Tenant & Room No.", "Payment Mode", "UTR No.", "Received By"] },
    { name: "Bank Settlement Report", format: "Excel", fields: ["Tenant & Room No.", "Collected Amount", "Date & Time", "Dues Category", "UTR No.", "Bank Account"] },
    { name: "Monthly Financial Statement", format: "Excel", fields: ["Tenant & Room No.", "All Transactions", "Transaction Details", "Remarks & Descriptions"] },
    { name: "Expense Report", format: "Excel", fields: ["All Expenses", "Date & Time", "Payer Name", "Vendor Name", "Remarks & Descriptions"] },
    { name: "Bed Occupancy Report", format: "Excel", fields: ["Tenant & Room No.", "Occupany Status", "DOJ & DOL", "Unpaid Dues", "Remarks & Descriptions"] },
    { name: "Room Occupancy Report", format: "Excel", fields: ["Tenant & Room No.", "Occupany Status", "Unpaid Dues", "Projected Rent", "Remarks & Descriptions"] },
    { name: "Lead Report", format: "Excel", fields: ["Lead Name", "Contact Details", "Latest Status", "Requirements", "Token Amount"] },
    { name: "Old Tenant Report", format: "Excel", fields: ["Tenant Details", "Eviction Date", "Unpaid Dues & Loss", "Reason of Eviction"] },
    { name: "Complaint Report", format: "Excel", fields: ["Complaint Details", "Complaint image", "Latest Status", "Tenant & Room No."] },
    { name: "Invited Guests Report", format: "Excel", fields: ["Tenant & Room No.", "Guest Name", "Guest Contact", "Stay Date and Timings"] },
    { name: "Late Check-in Report (PDF & Excel)", format: "Excel", fields: ["Tenant & Room No.", "Tenant Contact", "Late Check-in Date & Time", "Late Check-in reason"] },
    { name: "Rent Generation Report", format: "Excel", fields: ["Tenant, Room No & DOJ", "Monthly Rent Amount", "Rent Addition Status", "Rent Addition Date", "Rent Review Remarks", "Total unpaid dues"] },
    { name: "All Property Monthly Summary Report", format: "Excel", fields: ["Rooms & Tenants Count", "Bookings & Leads Count", "Current Month Dues", "Dues Breakup", "Current Month Collections"] },
    { name: "All Property Summary Report", format: "Excel", fields: ["Rooms & Tenants Count", "Bookings & Leads Count", "Total Potential Collection", "Dues Breakup", "Total Collection Till Now", "Total Dues Till Now"] },
    { name: "FlexiPe Report", format: "Excel", fields: ["Transaction Date", "Credit Amount", "Debit Amount", "Status", "Destination of funds", "Payee Details", "Payer Details", "UTR & Bank Details"] },
    { name: "Kyc Credits Report", format: "Excel", fields: ["Property Name", "Available Credits", "Consumed Credits", "Used By Tenants", "Unverified Tenants"] },
    { name: "Tenant Monthly Ledger Report", format: "Excel", fields: ["Tenant Name", "Tenant's phone", "Tenant's Status", "Room", "Fixed Rent", "Total Available Deposit", "Total Unpaid Amount", "Total Paid Amount", "Unpaid Dues (by type)", "Due Dates (by type)", "Paid Dues (by type)", "Paid Dates (by type)"] },
    { name: "Notice Report", format: "Excel", fields: ["Tenant Name", "Room No.", "Notice Period", "Notice Date", "Notice Raised By", "Notice Approved By", "Move-out On", "Notice Raised On", "Eviction Due On"] },
    { name: "Cashflow Report", format: "Excel", fields: ["Date", "Collection (+)", "Refunds (-)", "Expenses (-)", "Gross Profit"] },
    { name: "Agreement Renewal Report", format: "Excel", fields: ["Property", "Tenant Name", "Agreement Status", "Current Agreement Start Date", "Agreement Duration", "Current Agreement End Date", "Agreement Link", "Current Fixed Rent"] },
    { name: "Activity Log Report", format: "Excel", fields: ["Date", "RentOk ID", "Activity Content", "Performed By", "Activity Category", "Activity Type", "Activity on Entity"] },
    { name: "Historical Booking Report", format: "Excel", fields: ["Tenant Name", "Room", "Bed", "Status", "Date of Joining", "Date of Eviction", "Total Pending Dues", "Total Collection", "Loss"] },
    { name: "Food Attendance Report", format: "Excel", fields: ["Date", "Tenant Name", "Phone", "Room", "Breakfast Confirmed", "Breakfast Attended", "Breakfast Attended Time"] },
    { name: "Attendance Report", format: "Excel", fields: ["Tenant Name", "Attendance Status", "Face Score", "Recorded By"] }
  ];

  const filteredReports = reportsList.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Reports</h1>
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

      {/* Grid of Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((r, idx) => (
          <div key={idx} className="rounded-2xl border border-border bg-white p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {r.format === "PDF" ? (
                  <FileText className="size-6 text-rose-500" />
                ) : (
                  <FileSpreadsheet className="size-6 text-emerald-600" />
                )}
                <h3 className="font-serif text-[20px] font-bold text-slate-800 leading-tight">
                  {r.name}
                </h3>
              </div>

              <div className="space-y-2 mb-6">
                {r.fields.map((field, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-slate-600">{field}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
              <button 
                onClick={() => handleGenerate(r)}
                disabled={busyReport !== null}
                className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {busyReport === r.name ? <Loader2 className="size-4 animate-spin" /> : "Generate Report"}
              </button>
              <button className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all">
                Past Reports
              </button>
            </div>
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
