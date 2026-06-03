const fs=require('fs');
const P=(n,ey,ti,sub)=>`import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
export default function ${n}() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { window.location.href = "/propertyowner/ownerlogin"; return null; }
  return (
    <PropertyOwnerLayout owner={owner} title="${ti}" onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}>
      <div className="mb-8"><div className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">${ey}</div>
      <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">${ti}</h1>
      <p className="mt-1.5 text-[13.5px] text-muted-foreground">${sub}</p></div>
      <div className="rounded-2xl border border-border bg-card p-12 shadow-soft flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-muted/60 rounded-full flex items-center justify-center mb-3"><span className="text-2xl">📋</span></div>
        <h3 className="font-serif text-[22px] text-foreground mb-1">Coming Soon</h3>
        <p className="text-[13.5px] text-muted-foreground">This module is under development.</p>
      </div>
    </PropertyOwnerLayout>);
}`;
const skip=['admin.jsx','properties.jsx','rooms.jsx','tenants.jsx','payment.jsx','complaints.jsx','expense-tracking.jsx','enquiry.jsx','ownerlogin.jsx','index.jsx','AddPropertyWizard.jsx','PropertyDetails.jsx'];
const map={
'agreement.jsx':['Agreement','Documents','Agreements','Manage rental agreements.'],
'announcements.jsx':['Announcements','Communication','Announcements','Send notices to tenants.'],
'booking-form.jsx':['BookingForm','Bookings','New Booking','Create a new booking.'],
'booking.jsx':['Booking','Bookings','Bookings','Track all bed bookings.'],
'booking_request.jsx':['BookingRequest','Bookings','Booking Requests','Review pending requests.'],
'collection-report.jsx':['CollectionReport','Reports','Collection Report','Monthly rent collection summary.'],
'documents.jsx':['Documents','Documents','Documents','Manage property documents.'],
'dues-report.jsx':['DuesReport','Reports','Dues Report','Outstanding dues overview.'],
'hra-gst.jsx':['HraGst','Accounting','HRA & GST','Tax reports and receipts.'],
'late-fine.jsx':['LateFine','Payments','Late Fine','Configure late payment penalties.'],
'listing.jsx':['Listing','Properties','Listing','Manage property listings.'],
'location.jsx':['Location','Properties','Location','Property location details.'],
'occupancy-report.jsx':['OccupancyReport','Reports','Occupancy Report','Bed occupancy analytics.'],
'ownerchat.jsx':['OwnerChat','Communication','Messages','Chat with tenants and staff.'],
'ownerprofile.jsx':['OwnerProfile','Account','Profile','Manage your account details.'],
'payment-dashboard.jsx':['PaymentDashboard','Payments','Payment Dashboard','Payment analytics overview.'],
'payment-received.jsx':['PaymentReceived','Payments','Payments Received','All received payments.'],
'receipts.jsx':['Receipts','Payments','Receipts','Generate and view receipts.'],
'revenue-analytics.jsx':['RevenueAnalytics','Reports','Revenue Analytics','Revenue trends and insights.'],
'review.jsx':['Review','Feedback','Reviews','Tenant feedback and ratings.'],
'room-photos.jsx':['RoomPhotos','Properties','Room Photos','Upload and manage photos.'],
'schedulevisit.jsx':['ScheduleVisit','Leads','Schedule Visit','Manage site visit bookings.'],
'settings.jsx':['Settings','Account','Settings','App preferences and config.'],
'tenant-docs.jsx':['TenantDocs','Documents','Tenant Documents','KYC and ID documents.'],
'tenantrec.jsx':['TenantRec','People','Add Tenant','Register a new tenant.'],
'whatsapp.jsx':['WhatsApp','Communication','WhatsApp','Send messages via WhatsApp.'],
};
Object.entries(map).forEach(([f,[n,ey,ti,sub]])=>{
  fs.writeFileSync(`src/pages/propertyowner/${f}`,P(n,ey,ti,sub));
  console.log('Done:',f);
});
console.log('All pages done!');
