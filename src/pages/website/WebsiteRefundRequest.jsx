import React, { useState } from "react";
import WebsiteNavbar from "../../components/website/WebsiteNavbar";
import WebsiteFooter from "../../components/website/WebsiteFooter";
import { RefreshCcw } from 'lucide-react';

export default function WebsiteRefundRequest() {
  const [requestType, setRequestType] = useState("refund");
  const [formData, setFormData] = useState({
    bookingId: "",
    userEmail: "",
    requestReason: "",
    paymentMethod: "bank",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    preferredArea: "",
    comments: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Refund Request Submitted:", formData);
    alert("Your refund request has been submitted. Our team will review it shortly.");
    setFormData({
      bookingId: "",
      userEmail: "",
      requestReason: "",
      paymentMethod: "bank",
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      ifscCode: "",
      upiId: "",
      preferredArea: "",
      comments: ""
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <WebsiteNavbar />

      <main className="min-h-screen">
        {/* --- COMPACT & STYLISH HEADER --- */}
        <div className="relative w-full py-10 px-6 overflow-hidden border-b border-stone-200/50" 
             style={{ background: 'linear-gradient(135deg, #FFFAF5 0%, #FDFCFB 50%, #F5F7FA 100%)' }}>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/pinstripe.png")` }}>
          </div>

          <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
            
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
              <RefreshCcw size={24} className="text-green-600" />
            </div>
            
            {/* MAIN HEADING */}
            <div className="flex items-center gap-4 mb-2">
              <div className="h-[1px] w-8 bg-[#C5A059]/40 hidden md:block"></div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight">
                Refund <span className="text-[#C5A059] font-serif italic font-medium">Request</span>
              </h1>
              <div className="h-[1px] w-8 bg-[#C5A059]/40 hidden md:block"></div>
            </div>

            {/* SUB-HEADING */}
            <p className="text-base md:text-lg text-stone-500 font-normal opacity-90 max-w-xl mx-auto">
              Submit your refund or alternative property request
            </p>

            {/* Bottom Accent Dot */}
            <div className="mt-4 w-1.5 h-1.5 rounded-full bg-[#C5A059]/30"></div>
          </div>
        </div>

        {/* Form Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="light-card rounded-2xl p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <i data-lucide="info" className="w-5 h-5"></i> Booking Details
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-semibold">Booking ID</p>
                    <p className="text-gray-400">Enter your booking reference</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Request Type</p>
                    <p className="text-gray-400">Choose between refund or alternative</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Payment Details</p>
                    <p className="text-gray-400">Required for refund processing</p>
                  </div>
                  <div className="pt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-900">⏱️ Processing Time: 5-7 business days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="light-card rounded-2xl p-6 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Request Type Selection */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">Step 1: Select Request Type</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`p-4 border-2 rounded-lg cursor-pointer transition ${requestType === "refund" ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
                        <input
                          type="radio"
                          name="requestType"
                          value="refund"
                          checked={requestType === "refund"}
                          onChange={(e) => setRequestType(e.target.value)}
                          className="mr-2"
                        />
                        <span className="font-semibold">Refund</span>
                      </label>
                      <label className={`p-4 border-2 rounded-lg cursor-pointer transition ${requestType === "alternative" ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
                        <input
                          type="radio"
                          name="requestType"
                          value="alternative"
                          checked={requestType === "alternative"}
                          onChange={(e) => setRequestType(e.target.value)}
                          className="mr-2"
                        />
                        <span className="font-semibold">Alternative Property</span>
                      </label>
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Step 2: Booking Information</h3>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Booking ID / Reference No. *</label>
                      <input
                        type="text"
                        name="bookingId"
                        value={formData.bookingId}
                        onChange={handleInputChange}
                        placeholder="e.g., BK-123456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="userEmail"
                        value={formData.userEmail}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Request *</label>
                      <select
                        name="requestReason"
                        value={formData.requestReason}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        required
                      >
                        <option value="">Select a reason...</option>
                        <option value="not-satisfied">Not Satisfied with Property</option>
                        <option value="change-plans">Change in Plans</option>
                        <option value="relocation">Relocation</option>
                        <option value="financial">Financial Constraints</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Refund Payment Details */}
                  {requestType === "refund" && (
                    <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-bold">Step 3: Refund Payment Method</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method *</label>
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="bank"
                                checked={formData.paymentMethod === "bank"}
                                onChange={handleInputChange}
                                className="mr-2"
                              />
                              <span>Bank Transfer</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="upi"
                                checked={formData.paymentMethod === "upi"}
                                onChange={handleInputChange}
                                className="mr-2"
                              />
                              <span>UPI</span>
                            </label>
                          </div>
                        </div>

                        {formData.paymentMethod === "bank" && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name *</label>
                              <input
                                type="text"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleInputChange}
                                placeholder="e.g., HDFC Bank"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Holder Name *</label>
                              <input
                                type="text"
                                name="accountHolder"
                                value={formData.accountHolder}
                                onChange={handleInputChange}
                                placeholder="Your full name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number *</label>
                              <input
                                type="text"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleInputChange}
                                placeholder="Your account number"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">IFSC Code *</label>
                              <input
                                type="text"
                                name="ifscCode"
                                value={formData.ifscCode}
                                onChange={handleInputChange}
                                placeholder="e.g., HDFC0000001"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                              />
                            </div>
                          </>
                        )}

                        {formData.paymentMethod === "upi" && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">UPI ID *</label>
                            <input
                              type="text"
                              name="upiId"
                              value={formData.upiId}
                              onChange={handleInputChange}
                              placeholder="e.g., yourname@upi"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Alternative Property Details */}
                  {requestType === "alternative" && (
                    <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-bold">Step 3: Preferred Area</h3>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Area / City *</label>
                        <select
                          name="preferredArea"
                          value={formData.preferredArea}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        >
                          <option value="">Select your preferred area...</option>
                          <option value="kota">Kota</option>
                          <option value="indore">Indore</option>
                          <option value="ahmedabad">Ahmedabad</option>
                          <option value="pune">Pune</option>
                          <option value="bangalore">Bangalore</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Comments</label>
                    <textarea
                      name="comments"
                      value={formData.comments}
                      onChange={handleInputChange}
                      placeholder="Any additional information..."
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <i data-lucide="send" className="w-5 h-5"></i> Submit Request
                    </button>
                    <button
                      type="reset"
                      className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
                    >
                      <i data-lucide="refresh-cw" className="w-5 h-5"></i> Clear
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        </section>
      </main>

      <WebsiteFooter />
    </div>
  );
}
