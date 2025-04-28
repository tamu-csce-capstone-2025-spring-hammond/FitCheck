// components/platform-tracker.tsx
import { useState } from "react";
import { Button } from "@/components/imported-ui/button";
import { ChevronDown, ExternalLink } from "lucide-react";

type PlatformStatusProps = {
  platforms: {
    platform: string;
    status: string;
    offerDetails?: {
      price: number;
      buyer: string;
      message?: string;
    };
    analytics?: {
      likes: number;
      watchlistAdds: number;
      views?: number;
    };
    platformUrl: string;
  }[];
};

export default function PlatformTracker({ platforms }: PlatformStatusProps) {
  return (
    <div className="my-12">
      <h2 className="mb-4">Platform Status Tracker</h2>
      <div className="space-y-4">
        {platforms.map((p, idx) => (
          <PlatformCard key={idx} {...p} />
        ))}
      </div>
    </div>
  );
}

function PlatformCard({
  platform,
  status,
  offerDetails,
  analytics,
  platformUrl,
}: PlatformStatusProps["platforms"][0]) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border p-4 rounded-xl shadow-sm bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="">{platform}</h3>
        <span className="px-4 py-1 bg-accent text-white rounded">
          {status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {status === "offer_received" && (
        <div className="text-gray-700 mb-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            View Offer Details <ChevronDown size={16} />
          </button>
          {expanded && offerDetails && (
            <div className="mt-2 ml-4">
              <p>💰 Offer: ${offerDetails.price}</p>
              <p>👤 Buyer: {offerDetails.buyer}</p>
              {offerDetails.message && (
                <p>📝 Message: &quot;{offerDetails.message}&quot;</p>
              )}
              <Button className="mt-2" variant="default" size="sm">
                Accept Offer
              </Button>
            </div>
          )}
        </div>
      )}
      {analytics && (
        <div className="text-gray-600 space-y-1">
          <p>❤️ Likes: {analytics.likes}</p>
          <p>🔖 Watchlist: {analytics.watchlistAdds}</p>
          {analytics.views && <p>👀 Views: {analytics.views}</p>}
        </div>
      )}

      <div className="flex justify-between mt-4">
        <a
          href={platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          View on Platform <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
