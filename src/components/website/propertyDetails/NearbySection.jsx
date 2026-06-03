import { useState } from "react";
import { MapPin, GraduationCap, ExternalLink, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const TYPE_CONFIG = {
  university: { emoji: "🏛️", label: "University" },
  college: { emoji: "🎓", label: "College" },
  school: { emoji: "🏫", label: "School" },
};

export default function NearbySection({ nearbyInstitutes = [], loading = false, hasCoordinates = false }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? nearbyInstitutes : nearbyInstitutes.slice(0, 5);

  if (!hasCoordinates && nearbyInstitutes.length === 0) return null;

  return (
    <div className="px-4 md:px-0 py-5 md:py-6" style={{ borderBottom: '1px solid #e8e8e8' }}>
      <h2 className="text-[22px] font-bold text-[#222] mb-1">What's nearby?</h2>
      <p className="text-[#6d787d] text-xs mb-4">Stay close to top institutions & landmarks</p>

      {!hasCoordinates ? (
        <p className="text-[#6d787d] text-sm py-4 text-center">Location coordinates not available.</p>
      ) : loading ? (
        <div className="flex items-center gap-3 py-6 justify-center">
          <div className="w-5 h-5 border-2 border-[#EE4266] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#6d787d] text-sm">Finding nearby places…</span>
        </div>
      ) : nearbyInstitutes.length === 0 ? (
        <p className="text-[#6d787d] text-sm py-4 text-center">No institutions found within 2.5 km.</p>
      ) : (
        <>
          <div className="space-y-0">
            {displayed.map((inst, idx) => {
              const config = TYPE_CONFIG[inst.type] || TYPE_CONFIG.college;
              return (
                <Link
                  key={inst.id}
                  to={`/website/ourproperty?lat=${inst.lat}&lng=${inst.lng}&radius=2.5&near=${encodeURIComponent(inst.name)}`}
                  className="flex items-center gap-3 py-3 group"
                  style={{ borderBottom: idx < displayed.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                >
                  <span className="text-lg flex-shrink-0">{config.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#222] group-hover:text-[#EE4266] transition-colors truncate">
                      {inst.name}
                    </p>
                    <p className="text-[11px] text-[#6d787d]">
                      {inst.distance > 0 ? `${inst.distance.toFixed(1)} km` : ""} • {config.label}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-[#ccc] group-hover:text-[#EE4266] transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>

          {nearbyInstitutes.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-1 mt-3 text-[#EE4266] text-sm font-semibold hover:underline"
            >
              {showAll ? "Show less" : `+${nearbyInstitutes.length - 5} more places`}
              <ChevronDown size={14} className={`transition-transform ${showAll ? "rotate-180" : ""}`} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
