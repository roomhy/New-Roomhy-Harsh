import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { fetchJson } from "../../utils/api";
import { 
  ShieldCheck, CreditCard, Loader2, CheckCircle, Check, 
  Key, Building, Home, Undo2, Info, ArrowLeft, Shield, Upload
} from "lucide-react";

const emptyBooking = {
  bookingId: "",
  userId: "",
  propertyId: "",
  propertyName: "",
  ownerId: "",
  ownerName: "",
  tenantName: "",
  tenantEmail: "",
  area: "",
  propertyType: "",
  rentAmount: 0,
  totalAmount: 500,
  razorpayKey: "",
  razorpayOrderId: "",
  razorpayPaymentId: "",
  fullName: "",
  email: "",
  phone: "",
  guardianName: "",
  guardianPhone: "",
  streetAddress: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  addressProof: null
};

const createWebsiteUserId = () => `roomhyweb${String(Math.floor(Math.random() * 900000) + 100000)}`;

const postWithFallback = async (primaryPath, secondaryPath, payload) => {
  try {
    return await fetchJson(primaryPath, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  } catch (err) {
    if (secondaryPath) {
      try {
        return await fetchJson(secondaryPath, {
          method: "POST",
          body: JSON.stringify(payload)
        });
      } catch (innerErr) {
        throw innerErr;
      }
    }
    throw err;
  }
};

const ensureRazorpayLoaded = () =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not available."));
      return;
    }
    if (typeof window.Razorpay !== "undefined") {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[data-roomhy-razorpay="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.roomhyRazorpay = "1";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay."));
    document.body.appendChild(script);
  });

export default function BookingForm() {
  const owner = getOwnerRuntimeSession();
  
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [booking, setBooking] = useState(emptyBooking);
  const [loadingKey, setLoadingKey] = useState(true);
  const [paymentReady, setPaymentReady] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [showRefund, setShowRefund] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundDetails, setRefundDetails] = useState("");
  const [refundOption, setRefundOption] = useState("refund");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const messageRef = useRef(null);

  useEffect(() => {
    if (message && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [message]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stored = sessionStorage.getItem("bookingRequestData");
    let data = null;
    try {
      data = stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.warn("Failed to parse bookingRequestData:", err);
    }

    const tenantName = data?.tenantName || data?.tenant_name || data?.userName || params.get("tenantName") || "";
    const tenantEmail = data?.tenantEmail || data?.tenant_email || data?.userEmail || params.get("tenantEmail") || "";
    const userId = data?.userId || data?.user_id || data?.signup_user_id || params.get("userId") || createWebsiteUserId();

    setBooking((prev) => ({
      ...prev,
      bookingId: data?.bookingId || data?.booking_id || params.get("bookingId") || prev.bookingId,
      userId,
      propertyId: data?.propertyId || data?.property_id || params.get("propertyId") || prev.propertyId,
      propertyName: data?.propertyName || data?.property_name || params.get("propertyName") || prev.propertyName,
      ownerId: data?.ownerId || data?.owner_id || params.get("ownerId") || prev.ownerId || owner.loginId,
      ownerName: data?.ownerName || data?.owner_name || params.get("ownerName") || prev.ownerName || owner.name || "Owner",
      tenantName,
      tenantEmail,
      area: data?.area || params.get("area") || prev.area,
      propertyType: data?.propertyType || data?.property_type || params.get("propertyType") || prev.propertyType,
      rentAmount: 500,
      totalAmount: 500,
      fullName: tenantName || prev.fullName,
      email: tenantEmail || prev.email,
      phone: data?.tenantPhone || data?.tenant_phone || data?.userPhone || params.get("prefillPhone") || prev.phone
    }));
  }, [owner.loginId, owner.name]);

  useEffect(() => {
    const loadBookingContext = async () => {
      if (booking.propertyName && booking.ownerName && booking.area) return;
      if (!booking.bookingId && !booking.propertyId) return;

      const idsToTry = [booking.bookingId, booking.propertyId].filter(Boolean);
      for (const id of idsToTry) {
        try {
          const res = await fetchJson(`/api/booking/${id}`);
          const data = res?.data || res || {};
          setBooking((prev) => ({
            ...prev,
            propertyName: prev.propertyName || data.property_name || data.propertyName || data.property_id || prev.propertyId,
            ownerName: prev.ownerName || data.owner_name || data.ownerName || data.owner_id || prev.ownerId,
            ownerId: prev.ownerId || data.owner_id || data.ownerId || prev.ownerId,
            area: prev.area || data.area || "N/A",
            propertyType: prev.propertyType || data.property_type || data.propertyType || "N/A",
            rentAmount: prev.rentAmount || data.rent_amount || data.rentAmount || prev.totalAmount
          }));
          return;
        } catch {
          // try next
        }

        try {
          const res = await fetchJson(`/api/bookings/${id}`);
          const data = res?.data || res || {};
          setBooking((prev) => ({
            ...prev,
            propertyName: prev.propertyName || data.property_name || data.propertyName || data.property_id || prev.propertyId,
            ownerName: prev.ownerName || data.owner_name || data.ownerName || data.owner_id || prev.ownerId,
            ownerId: prev.ownerId || data.owner_id || data.ownerId || prev.ownerId,
            area: prev.area || data.area || "N/A",
            propertyType: prev.propertyType || data.property_type || data.propertyType || "N/A",
            rentAmount: prev.rentAmount || data.rent_amount || data.rentAmount || prev.totalAmount
          }));
          return;
        } catch {
          // continue
        }
      }
    };

    loadBookingContext();
  }, [booking.area, booking.bookingId, booking.ownerId, booking.ownerName, booking.propertyId, booking.propertyName, booking.propertyType, booking.rentAmount, booking.totalAmount]);

  useEffect(() => {
    const loadKey = async () => {
      setLoadingKey(true);
      try {
        const res = await fetchJson("/api/booking/config/razorpay-key");
        setBooking((prev) => ({ ...prev, razorpayKey: res?.razorpayKey || res?.key || res?.keyId || "" }));
      } catch {
        try {
          const res = await fetchJson("/api/bookings/config/razorpay-key");
          setBooking((prev) => ({ ...prev, razorpayKey: res?.razorpayKey || res?.key || res?.keyId || "" }));
        } catch (err) {
          console.error("Failed to load Razorpay key:", err);
        }
      } finally {
        setLoadingKey(false);
      }
    };
    loadKey();
  }, []);

  const updateField = useCallback((field, value) => {
    setBooking((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback(() => {
    const required = [
      "fullName",
      "email",
      "phone",
      "guardianName",
      "guardianPhone",
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "country"
    ];
    const missing = required.filter((field) => !String(booking[field] || "").trim());
    if (missing.length) {
      setMessage("Please fill all required fields.");
      return false;
    }
    if (!booking.addressProof) {
      setMessage("Please upload address proof.");
      return false;
    }
    if (!termsAccepted) {
      setMessage("Please agree to the terms and conditions.");
      return false;
    }
    return true;
  }, [booking, termsAccepted]);

  const handleAddressProof = useCallback((file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage("File size must be less than 5MB.");
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setMessage("Only PDF, JPG, and PNG files are allowed.");
      return;
    }
    setMessage("");
    updateField("addressProof", file);
  }, [updateField]);

  const handlePayment = useCallback(async () => {
    setMessage("");
    if (!validateForm()) return;
    if (!booking.razorpayKey) {
      setMessage("Payment system not configured.");
      return;
    }

    setPaymentReady(true);
    try {
      const orderResponse = await postWithFallback(
        "/api/booking/create-order",
        "/api/bookings/create-order",
        {
          amount: booking.totalAmount,
          currency: "INR",
          receipt: `booking_${booking.userId || "guest"}_${Date.now()}`,
          notes: {
            userId: booking.userId,
            propertyId: booking.propertyId,
            propertyName: booking.propertyName
          }
        }
      );

      const orderId = orderResponse?.orderId || orderResponse?.id || "";
      if (!orderId) {
        throw new Error("Unable to start payment.");
      }

      await ensureRazorpayLoaded();

      const razorpay = new window.Razorpay({
        key: booking.razorpayKey,
        order_id: orderId,
        amount: booking.totalAmount * 100,
        currency: "INR",
        name: "Roomhy",
        description: `Booking Payment for ${booking.propertyName || "Property"}`,
        handler: (response) => {
          setBooking((prev) => ({
            ...prev,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id
          }));
          setPaymentCompleted(true);
          setMessage("Payment successful! Click Complete Booking to finish.");
        },
        prefill: {
          name: booking.fullName,
          email: booking.email,
          contact: booking.phone
        },
        theme: { color: "#2563eb" }
      });

      razorpay.open();
    } catch (err) {
      setMessage(err?.message || "Failed to initiate payment.");
    } finally {
      setPaymentReady(false);
    }
  }, [booking, validateForm]);

  const handleConfirm = useCallback(async () => {
    if (!booking.razorpayPaymentId) {
      setMessage("Please complete payment first.");
      return;
    }
    setConfirming(true);
    setMessage("");
    try {
      const propertyName = booking.propertyName || booking.propertyId || "Property";
      const ownerName = booking.ownerName || booking.ownerId || "Unknown Owner";
      const payload = {
        user_id: booking.userId,
        property_id: booking.propertyId,
        property_name: propertyName,
        owner_id: booking.ownerId || "owner_unknown",
        owner_name: ownerName,
        name: booking.fullName,
        phone: booking.phone,
        email: booking.email,
        area: booking.area || "N/A",
        property_type: booking.propertyType || "N/A",
        rent_amount: booking.rentAmount || booking.totalAmount,
        guardian_name: booking.guardianName,
        guardian_phone: booking.guardianPhone,
        address_street: booking.streetAddress,
        address_city: booking.city,
        address_state: booking.state,
        address_postal_code: booking.postalCode,
        address_country: booking.country,
        payment_id: booking.razorpayPaymentId,
        payment_amount: booking.totalAmount,
        payment_status: "completed",
        payment_method: "razorpay",
        total_amount: booking.totalAmount,
        totalAmount: booking.totalAmount,
        request_type: "request",
        booking_status: "confirmed",
        bookingStatus: "confirmed",
        status: "confirmed"
      };

      const result = await postWithFallback(
        "/api/booking/confirm",
        "/api/bookings/confirm",
        payload
      );

      const confirmed = result?.data || result || {};
      const bookingId = confirmed._id || confirmed.booking_id || booking.bookingId;
      const normalized = {
        ...confirmed,
        booking_id: bookingId,
        user_id: booking.userId,
        property_id: booking.propertyId,
        property_name: propertyName,
        owner_id: booking.ownerId,
        owner_name: ownerName,
        property_location: booking.area,
        property_type: booking.propertyType,
        total_amount: booking.totalAmount,
        payment_id: booking.razorpayPaymentId,
        user_name: booking.fullName,
        user_phone: booking.phone,
        user_email: booking.email,
        booking_status: confirmed.booking_status || confirmed.status || "confirmed"
      };

      sessionStorage.setItem("bookingConfirmation", JSON.stringify(normalized));
      localStorage.setItem("lastBooking", JSON.stringify(normalized));
      
      const confirmedBookings = JSON.parse(localStorage.getItem("confirmedBookings") || "[]");
      const bookingKey = normalized.booking_id || normalized.bookingId || normalized.payment_id;
      const deduped = confirmedBookings.filter((item) => {
        const itemKey = item?.booking_id || item?.bookingId || item?.payment_id;
        return String(itemKey || "") !== String(bookingKey || "");
      });
      deduped.unshift({ ...normalized, created_at: new Date().toISOString() });
      localStorage.setItem("confirmedBookings", JSON.stringify(deduped));
      
      if (normalized.user_id) {
        localStorage.setItem("userId", normalized.user_id);
        sessionStorage.setItem("userId", normalized.user_id);
      }
      if (booking.email) {
        localStorage.setItem("userEmail", booking.email);
        sessionStorage.setItem("userEmail", booking.email);
      }

      setBooking((prev) => ({ ...prev, bookingId }));
      setSuccessData({
        userId: result?.userId || booking.userId || "-",
        password: result?.password || "N/A"
      });
      setMessage("Booking confirmed! Credentials generated successfully.");
    } catch (err) {
      const text = err?.message || err?.body || "Booking confirmation failed.";
      setMessage(text);
    } finally {
      setConfirming(false);
    }
  }, [booking]);

  const submitRefund = useCallback(async () => {
    if (!refundReason || !refundDetails) {
      setMessage("Please fill refund details.");
      return;
    }
    try {
      const payload = {
        booking_id: booking.bookingId || booking.propertyId || "",
        user_id: booking.userId || "",
        payment_id: booking.razorpayPaymentId || booking.bookingId || booking.propertyId || "",
        user_name: booking.fullName || "",
        user_phone: booking.phone || "",
        user_email: booking.email || "",
        request_type: refundOption === "alternative" ? "alternative_property" : "refund",
        refund_amount: booking.totalAmount || 500,
        refund_method: refundOption === "refund" ? "other" : null,
        other_details: `Reason: ${refundReason}. Details: ${refundDetails}`,
        preferred_area: refundOption === "alternative" ? booking.area || null : null,
        property_requirements: refundOption === "alternative" ? refundDetails : null
      };

      await postWithFallback(
        "/api/booking/refund-request",
        "/api/bookings/refund-request",
        payload
      );
      setShowRefund(false);
      setMessage("Refund request submitted successfully.");
    } catch (err) {
      setMessage(err?.message || "Refund request failed.");
    }
  }, [booking, refundDetails, refundOption, refundReason]);

  const inputClass = "w-full h-11 px-4 border border-border bg-card rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 outline-none transition";
  const readOnlyInputClass = `${inputClass} bg-muted/50 text-muted-foreground cursor-not-allowed`;
  const textAreaClass = "w-full p-4 border border-border bg-card rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 outline-none transition min-h-[120px]";
  const fileInputClass = "block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer border border-dashed border-border rounded-xl p-3 bg-card";

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Complete Booking" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">New Booking Form</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Complete the booking registration process securely.</p>
        </div>

        {message && (
          <div ref={messageRef} className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5 text-primary text-sm flex items-start gap-3">
            <Info size={18} className="shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {!successData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Property Name</label>
                <input type="text" className={readOnlyInputClass} value={booking.propertyName} readOnly />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Property ID</label>
                <input type="text" className={readOnlyInputClass} value={booking.propertyId} readOnly />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Owner Name</label>
                <input type="text" className={readOnlyInputClass} value={booking.ownerName} readOnly />
              </div>
            </div>

            <div className="border border-border bg-card rounded-2xl p-6 shadow-soft space-y-6">
              <div>
                <h3 className="font-serif text-[18px] text-foreground mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Full Name *</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={booking.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Address *</label>
                    <input
                      type="email"
                      className={inputClass}
                      value={booking.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      className={inputClass}
                      value={booking.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">User ID</label>
                    <input type="text" className={readOnlyInputClass} value={booking.userId} readOnly />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-serif text-[18px] text-foreground mb-4">Guardian/Parent Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Guardian Name *</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={booking.guardianName}
                      onChange={(e) => updateField("guardianName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Guardian Phone *</label>
                    <input
                      type="tel"
                      className={inputClass}
                      value={booking.guardianPhone}
                      onChange={(e) => updateField("guardianPhone", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-serif text-[18px] text-foreground mb-4">Address Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Street Address *</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={booking.streetAddress}
                      onChange={(e) => updateField("streetAddress", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">City *</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={booking.city}
                        onChange={(e) => updateField("city", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">State *</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={booking.state}
                        onChange={(e) => updateField("state", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Postal Code *</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={booking.postalCode}
                        onChange={(e) => updateField("postalCode", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Country *</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={booking.country}
                      onChange={(e) => updateField("country", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-serif text-[18px] text-foreground mb-4">Document Verification</h3>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Upload Address Proof (Aadhar/Utility Bill) *</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleAddressProof(e.target.files?.[0] || null)}
                  className={fileInputClass}
                />
                {booking.addressProof && (
                  <div className="text-xs text-emerald-600 mt-2 flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span>{booking.addressProof.name}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-6 bg-muted/20 p-6 rounded-2xl">
                <h3 className="font-serif text-[16px] text-foreground mb-4">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Monthly Rent</span>
                    <span className="font-semibold text-foreground">₹{(booking.rentAmount || booking.totalAmount).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-foreground">
                    <span className="font-semibold text-sm">Total Amount to Pay</span>
                    <span className="font-bold text-lg text-primary">₹{booking.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 size-4 rounded accent-primary border-border focus:ring-0 cursor-pointer" 
                  checked={termsAccepted} 
                  id="termsCheck"
                  onChange={(e) => setTermsAccepted(e.target.checked)} 
                />
                <label htmlFor="termsCheck" className="text-xs text-muted-foreground cursor-pointer select-none">
                  I agree to the terms and conditions and confirm that I have read the refund policy.
                </label>
              </div>

              <div className="flex gap-3 pt-6 border-t border-border">
                <button
                  type="button"
                  className="flex-1 h-12 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                  onClick={() =>
                    setBooking((prev) => ({
                      ...emptyBooking,
                      razorpayKey: prev.razorpayKey,
                      propertyId: prev.propertyId,
                      propertyName: prev.propertyName,
                      ownerId: prev.ownerId,
                      ownerName: prev.ownerName,
                      userId: prev.userId,
                      tenantName: prev.tenantName,
                      tenantEmail: prev.tenantEmail,
                      fullName: prev.tenantName,
                      email: prev.tenantEmail,
                      totalAmount: 500,
                      rentAmount: 500
                    }))
                  }
                >
                  Clear Form
                </button>
                
                <button
                  type="button"
                  className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-sm"
                  onClick={handlePayment}
                  disabled={paymentReady || loadingKey || !termsAccepted || paymentCompleted || !booking.razorpayKey}
                  style={{ display: paymentCompleted ? "none" : "flex" }}
                  title={!booking.razorpayKey ? "Razorpay key not loaded yet" : ""}
                >
                  {paymentReady ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Payment
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-sm"
                  onClick={handleConfirm}
                  disabled={!paymentCompleted || confirming}
                  style={{ display: paymentCompleted ? "flex" : "none" }}
                >
                  {confirming ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Complete Booking
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {successData && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-soft max-w-lg mx-auto">
            <div className="w-[72px] h-[72px] rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-5">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
            <p className="text-sm text-muted-foreground mb-6">Your credentials have been generated and sent to email.</p>
            
            <div className="bg-muted/30 border border-border rounded-xl p-5 text-left mb-6">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                <Key className="w-4 h-4 text-primary" />
                Login Credentials
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono font-semibold text-foreground bg-card px-2.5 py-1.5 rounded border border-border">{successData.userId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Password:</span>
                  <span className="font-mono font-semibold text-foreground bg-card px-2.5 py-1.5 rounded border border-border">{successData.password}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground">Login URL:</span>
                  <a href="/website/login" className="text-primary hover:underline font-medium">Login Page →</a>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button 
                type="button" 
                onClick={() => { window.location.href = "/website/mystays"; }} 
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-sm"
              >
                Go to My Stays
              </button>
              <button 
                type="button" 
                onClick={() => { window.location.href = "/website/index"; }} 
                className="w-full h-11 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
              >
                Go to Home
              </button>
              <button 
                type="button" 
                onClick={() => setShowRefund(true)} 
                className="w-full h-11 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-50 font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
              >
                <Undo2 className="w-4 h-4" />
                Request Refund / Alternative Property
              </button>
            </div>
          </div>
        )}

        {showRefund && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
                <h3 className="text-lg font-bold text-foreground">Request Refund / Alternative</h3>
                <button type="button" className="text-muted-foreground hover:text-foreground text-lg" onClick={() => setShowRefund(false)}>✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Reason *</label>
                  <select
                    className={inputClass}
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                  >
                    <option value="">Select a reason</option>
                    <option value="did_not_like_property">Didn't like the property</option>
                    <option value="found_better">Found a better property elsewhere</option>
                    <option value="personal_emergency">Personal emergency</option>
                    <option value="change_plans">Changed my plans</option>
                    <option value="financial_issues">Financial issues</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Details *</label>
                  <textarea
                    className={textAreaClass}
                    rows={4}
                    placeholder="Provide details about your request..."
                    value={refundDetails}
                    onChange={(e) => setRefundDetails(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Would you like alternatives?</label>
                  <div className="flex gap-6 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                      <input
                        type="radio"
                        name="refundOption"
                        value="alternative"
                        checked={refundOption === "alternative"}
                        onChange={() => setRefundOption("alternative")}
                        className="accent-primary size-4"
                      />
                      <span>Show alternatives</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                      <input
                        type="radio"
                        name="refundOption"
                        value="refund"
                        checked={refundOption === "refund"}
                        onChange={() => setRefundOption("refund")}
                        className="accent-primary size-4"
                      />
                      <span>Just refund</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button type="button" className="flex-1 h-11 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-sm font-semibold transition-all" onClick={() => setShowRefund(false)}>
                    Cancel
                  </button>
                  <button type="button" className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all" onClick={submitRefund}>
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PropertyOwnerLayout>
  );
}
