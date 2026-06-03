import { PageHeader } from "../../components/dashboard/PageHeader";
import { StatCard } from "../../components/dashboard/StatCard";
import { DataTable, TableToolbar, StatusBadge } from "../../components/dashboard/DataTable";
import { RotateCcw, Clock, CheckCircle2, XCircle, Plus, Eye } from "lucide-react";

const refunds = [
  { id: "RF-485", txn: "TXN-125482", customer: "Karan Mehta", reason: "Cancelled subscription", amount: "₹8,999", date: "24 May 2025", status: "Refunded" },
  { id: "RF-484", txn: "TXN-125470", customer: "Anjali Roy", reason: "Duplicate payment", amount: "₹2,500", date: "23 May 2025", status: "Refunded" },
  { id: "RF-483", txn: "TXN-125465", customer: "Rajesh Verma", reason: "Service not delivered", amount: "₹15,000", date: "22 May 2025", status: "Processing" },
  { id: "RF-482", txn: "TXN-125455", customer: "Pooja Gupta", reason: "Billing error", amount: "₹999", date: "22 May 2025", status: "Pending" },
  { id: "RF-481", txn: "TXN-125440", customer: "Suresh Kumar", reason: "Customer request", amount: "₹4,500", date: "21 May 2025", status: "Rejected" },
  { id: "RF-480", txn: "TXN-125425", customer: "Meera Iyer", reason: "Cancelled booking", amount: "₹7,999", date: "20 May 2025", status: "Refunded" },
];

export default function Refunds() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <PageHeader
        title="Refunds"
        subtitle="Process and track refund requests."
        actions={<button className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90"><Plus className="h-4 w-4" /> Add Refund</button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Refunds" value="₹45,250" delta="-3.2%" trend="down" icon={RotateCcw} iconColor="red" />
        <StatCard label="Processed" value="42" delta="This month" icon={CheckCircle2} iconColor="green" />
        <StatCard label="Pending" value="6" delta="₹12,400" icon={Clock} iconColor="yellow" />
        <StatCard label="Rejected" value="3" delta="-1 vs last" trend="down" icon={XCircle} iconColor="purple" />
      </div>

      <div className="panel">
        <TableToolbar searchPlaceholder="Search refunds..." filters={[{ label: "Status", value: "All" }]} />
        <DataTable data={refunds} columns={[
          { key: "id", header: "Refund ID", render: (r) => <span className="font-medium">{r.id}</span> },
          { key: "txn", header: "Transaction", render: (r) => <span className="text-muted-foreground">{r.txn}</span> },
          { key: "customer", header: "Customer" },
          { key: "reason", header: "Reason" },
          { key: "amount", header: "Amount", render: (r) => <span className="font-bold text-destructive">{r.amount}</span> },
          { key: "date", header: "Date", render: (r) => <span className="text-muted-foreground text-xs">{r.date}</span> },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "actions", header: "", render: () => <button className="p-1.5 rounded hover:bg-muted"><Eye className="h-4 w-4 text-muted-foreground" /></button>, className: "text-right" },
        ]} />
      </div>
    </div>
  );
}
