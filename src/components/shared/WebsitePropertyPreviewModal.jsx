/**
 * WebsitePropertyPreviewModal
 * 
 * Renders the EXACT same UI as /website/property-details/:id
 * inside a modal overlay — no redirect, same components.
 * 
 * Property data from Admin/Owner DB is normalized into the same
 * `formatted` shape used by PropertyDetailsPage before passing
 * to the shared components.
 */

import { useState, useEffect } from "react";
import { X, Eye, Loader2 } from "lucide-react";
import {
  PropertyHeader,
  HighlightsSection,
  DescriptionSection,
  OffersSection,
  ReviewsSection,
  NearbySection,
  StickyCTA,
  PricingBreakdown,
  RoomTypesSection,
} from "../website/propertyDetails";
import PropertyViewsGallery from "../website/propertyDetails/PropertyViewsGallery";
import AmenitiesSection from "../website/propertyDetails/AmenitiesSection";
import ExclusiveBenefitsSection from "../website/propertyDetails/ExclusiveBenefitsSection";

// ─── Data Normalizer ───────────────────────────────────────────────────────────
// Converts raw admin/owner DB property object → same shape as PropertyDetailsPage

function normalizeProperty(raw) {
  if (!raw) return null;

  // Helper to try multiple field paths
  const pick = (...paths) => {
    for (const p of paths) {
      const val = p.split(".").reduce((o, k) => (o != null ? o[k] : undefined), raw);
      if (val !== undefined && val !== null && val !== "") return val;
    }
    return undefined;
  };

  const name =
    pick("name", "title", "propertyName", "property_name", "propertyInfo.name") || "Property";

  const amenities = (() => {
    const raw_am =
      pick("amenities") ||
      pick("propertyInfo.amenities") ||
      [];
    return raw_am.map((a) => {
      if (typeof a === "string") {
        try { return JSON.parse(a); } catch { return { name: a, icon: "check", category: "basic" }; }
      }
      return a;
    });
  })();

  const price =
    Number(pick("monthlyRent", "rent", "price", "propertyInfo.rent")) || 0;

  const formatted = {
    id:           pick("_id", "id", "visitId") || "",
    name,
    location:     pick("city", "propertyInfo.city") || pick("address", "") || "",
    area:         pick("locality", "propertyInfo.area", "area") || "",
    type:         pick("propertyType", "type", "propertyInfo.propertyType") || "",
    price,
    monthlyRent:  price,
    beds:         pick("totalBeds", "bedCount", "beds") || 0,
    gender:       pick("gender", "propertyInfo.genderSuitability") || "Any",
    owner:        pick("ownerName", "contact.name", "generatedCredentials.ownerName", "propertyInfo.ownerName") || "Owner",
    owner_id:     pick("ownerLoginId", "owner_id") || "",
    ownerPhone:   pick("ownerPhone", "contact.number", "propertyInfo.ownerPhone") || "",
    ownerEmail:   pick("ownerEmail", "contact.email", "propertyInfo.ownerEmail") || "",
    address:      pick("address", "propertyAddress") || "",
    description:  pick("description") || "No description provided",
    verified:     pick("isVerified", "verified") || false,
    rating:       Number(pick("rating")) || 0,
    latitude:     Number(pick("latitude", "propertyInfo.latitude")) || null,
    longitude:    Number(pick("longitude", "propertyInfo.longitude")) || null,
    nearbyColleges: pick("nearbyColleges") || [],
    discountPercent: Number(pick("pricing.discountPercent", "discountPercent")) || 0,
    originalPrice: pick("originalPrice") || null,
    securityDeposit: pick("pricing.securityDeposit") || 0,
    advanceRent:  pick("pricing.advanceRent") || 0,
    pricing:      pick("pricing") || {},
    // Images
    image:
      pick("featuredImage") ||
      (Array.isArray(raw.images) && raw.images[0]) ||
      null,
    images:
      Array.isArray(raw.images) && raw.images.length > 0
        ? raw.images
        : Array.isArray(raw.propertyInfo?.photos) && raw.propertyInfo.photos.length > 0
        ? raw.propertyInfo.photos
        : [],
    propertyViews: pick("propertyViews") || [],
    // Details
    amenities,
    exclusiveBenefits: pick("exclusiveBenefits", "benefits") || [],
    facilities: pick("facilities", "propertyInfo.facilities") || {},
    roomTypes: (() => {
      const rt =
        (Array.isArray(raw.roomTypes) && raw.roomTypes.length > 0 && raw.roomTypes) ||
        (Array.isArray(raw.propertyInfo?.roomTypes) && raw.propertyInfo.roomTypes.length > 0 && raw.propertyInfo.roomTypes) ||
        raw.roomVariants ||
        [];
      return rt;
    })(),
    totalRooms: (() => {
      const fromRT = (raw.roomTypes || raw.propertyInfo?.roomTypes || []).reduce(
        (s, rt) => s + parseInt(rt.totalRooms || 0),
        0
      );
      return fromRT || Number(pick("totalRooms")) || 0;
    })(),
    bedsPerRoom: pick("bedsPerRoom") || 1,
    propertyDetails: pick("propertyDetails") || {},
    policies: pick("policies") || {},
    highlights: pick("highlights") || [],
    offers: pick("offers") || [],
    benefits: pick("benefits", "exclusiveBenefits") || [],
    pricingDetails: pick("pricingDetails") || null,
    status: pick("status") || "active",
    isPublished: pick("isPublished") !== undefined ? raw.isPublished : true,
    tenantDescription: pick("tenantDescription") || "",
    propertyType: pick("propertyType", "type", "propertyInfo.propertyType") || "pg",
  };

  return formatted;
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function WebsitePropertyPreviewModal({ property: rawProperty, onClose }) {
  const [property, setProperty] = useState(null);

  useEffect(() => {
    if (rawProperty) {
      setProperty(normalizeProperty(rawProperty));
    }
  }, [rawProperty]);

  // Close on Escape
  useEffect(() => {
    const handle = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  if (!rawProperty) return null;

  return (
    <div
      className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-screen h-screen overflow-hidden flex flex-col">

        {/* ── Chrome Header ── */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-full">
              <Eye size={12} className="text-teal-600" />
              <span className="text-[11px] font-bold text-teal-600 uppercase tracking-widest">
                Website Preview
              </span>
            </div>
            <span className="text-xs text-gray-400 hidden sm:block">
              Exactly how tenants see this on Roomhy.com
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1">
          {!property ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
          ) : (
            /* ── Exact same structure as PropertyDetailsPage render ── */
            <div className="min-h-screen bg-white">
              {/* Two-column layout */}
              <div className="max-w-none w-full mx-auto px-4 md:px-8 lg:px-12 md:py-6">
                <div className="md:grid md:grid-cols-3 md:gap-8">

                  {/* ── LEFT / MAIN CONTENT ── */}
                  <div className="md:col-span-2">

                    {/* 1. Property Views Gallery */}
                    <div className="md:rounded-2xl md:overflow-hidden">
                      <GalleryWrapper
                        propertyViews={property.propertyViews}
                        images={property.images}
                        onBack={onClose}
                      />
                    </div>

                    {/* Content Sections */}
                    <div className="md:px-0 px-0">

                      {/* 2. Property Header */}
                      <div className="pt-5 pb-5" style={{ borderBottom: "1px solid #e8e8e8" }}>
                        <PropertyHeader property={property} reviewStats={{ avgRating: property.rating, totalReviews: 0 }} />
                      </div>

                      {/* 3. Highlights */}
                      <HighlightsSection property={property} />

                      {/* 4. Description + Features */}
                      <DescriptionSection
                        description={property.description}
                        amenities={property.amenities}
                        beds={property.totalRooms}
                        gender={property.gender}
                        price={property.price}
                      />

                      {/* 5. Amenities Section */}
                      <div className="px-4 md:px-0">
                        <AmenitiesSection
                          amenities={property.amenities}
                          facilities={property.facilities}
                        />
                      </div>

                      {/* 5.5. Choose Your Room */}
                      <div className="px-4 md:px-0">
                        <RoomTypesSection roomTypes={property.roomTypes} />
                      </div>

                      {/* 6. Exclusive Benefits */}
                      <div className="px-4 md:px-0">
                        <ExclusiveBenefitsSection exclusiveBenefits={property.exclusiveBenefits} />
                      </div>

                      {/* 7. Offers (Legacy) */}
                      <OffersSection
                        offers={property.exclusiveBenefits?.map((b) => b.title)}
                        benefits={property.benefits}
                      />

                      {/* 8. Nearby Places — skipped in preview (no live map API call needed) */}
                      <NearbySection
                        nearbyInstitutes={[]}
                        loading={false}
                        hasCoordinates={!!(property.latitude && property.longitude)}
                      />

                      {/* 9. Map (if coords available) */}
                      {property.latitude && property.longitude && (
                        <div className="md:hidden px-4 py-5" style={{ borderBottom: "1px solid #e8e8e8" }}>
                          <h2 className="text-lg font-bold text-[#222] mb-3 flex items-center gap-2">
                            Property Location
                          </h2>
                          <div className="rounded-lg overflow-hidden" style={{ height: 200, border: "1px solid #e8e8e8" }}>
                            <iframe
                              src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=14&output=embed`}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                              title="Property Location"
                            />
                          </div>
                        </div>
                      )}

                      {/* 10. Pricing Breakdown (Mobile) */}
                      <PricingBreakdown property={property} />

                      {/* 11. Reviews — empty in preview */}
                      <ReviewsSection
                        reviews={[]}
                        reviewStats={{ avgRating: property.rating, totalReviews: 0, ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }}
                        hasReviewed={false}
                        userReview={null}
                        showReviewForm={false}
                        setShowReviewForm={() => {}}
                        newRating={5}
                        setNewRating={() => {}}
                        newReviewText=""
                        setNewReviewText={() => {}}
                        submittingReview={false}
                        handleSubmitReview={(e) => e.preventDefault()}
                      />

                    </div>
                  </div>

                  {/* ── RIGHT SIDEBAR (Desktop) ── */}
                  <div className="hidden md:block md:col-span-1">
                    <StickyCTA
                      property={property}
                      onBookNow={() => {/* preview — no action */}}
                    />
                  </div>

                </div>
              </div>

              {/* Mobile pricing — show PricingBreakdown only, no fixed CTA */}
              <div className="pb-20" />
            </div>
          )}
        </div>

        {/* ── Footer note ── */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 shrink-0 text-center">
          <p className="text-[10px] text-gray-400">
            👁 Preview mode — booking buttons &amp; calls are disabled
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Gallery Wrapper ───────────────────────────────────────────────────────────

function GalleryWrapper({ propertyViews, images, onBack }) {
  return (
    <GalleryErrorBoundary images={images}>
      <PropertyViewsGallery
        propertyViews={propertyViews}
        images={images}
        onBack={onBack}
      />
    </GalleryErrorBoundary>
  );
}

// ─── Error Boundary for Gallery ───────────────────────────────────────────────

import React from "react";

class GalleryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      // Fallback: simple image strip
      return (
        <FallbackGallery images={this.props.images || []} />
      );
    }
    return this.props.children;
  }
}

function FallbackGallery({ images }) {
  const [idx, setIdx] = useState(0);
  const imgs = images.length > 0 ? images : ["https://picsum.photos/800/500?random=42"];
  return (
    <div className="relative w-full bg-gray-900 aspect-video overflow-hidden">
      <img
        src={imgs[idx]}
        alt="property"
        className="w-full h-full object-cover"
        onError={(e) => { e.target.src = "https://picsum.photos/800/500?random=99"; }}
      />
      {imgs.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button onClick={() => setIdx((i) => (i - 1 + imgs.length) % imgs.length)}
            className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-800 hover:bg-white">‹</button>
          <button onClick={() => setIdx((i) => (i + 1) % imgs.length)}
            className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-800 hover:bg-white">›</button>
        </div>
      )}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
        {idx + 1}/{imgs.length}
      </div>
    </div>
  );
}
