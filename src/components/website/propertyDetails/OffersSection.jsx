import { CheckCircle2, Gift } from "lucide-react";

export default function OffersSection({ offers = [], benefits = [] }) {
  // Only show if there are actual offers or benefits
  const displayOffers = offers && offers.length > 0 ? offers : [];
  const displayBenefits = benefits && benefits.length > 0 ? benefits : [];

  // Don't render section if no data
  if (displayOffers.length === 0 && displayBenefits.length === 0) {
    return null;
  }

  return (
    <div className="px-4 md:px-0 py-3 md:py-5 border-b border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
          <Gift size={16} className="text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Exclusive Direct Benefits</h2>
      </div>

      <div className="space-y-3">
        {displayOffers.map((offer, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 group"
          >
            <div className="mt-0.5 flex-shrink-0">
              <CheckCircle2 size={18} className="text-green-500" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
              {typeof offer === "object" ? offer.text : offer}
            </p>
          </div>
        ))}
      </div>

      {benefits && benefits.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">Additional Benefits</p>
          <div className="flex flex-wrap gap-2">
            {benefits.map((benefit, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100"
              >
                {typeof benefit === "object" ? benefit.text : benefit}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
