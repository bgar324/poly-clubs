"use client";

import { useState } from "react";
import { Star, Flag, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner"; // <--- NEW UI

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  return "today";
}

export function ReviewItem({ review }: { review: any }) {
  const [reported, setReported] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReport() {
    if (reported) return;

    // OPTIMISTIC UI: Show loading state immediately
    setLoading(true);

    // Call the Secure Database Function (RPC)
    const { error } = await supabase.rpc("mark_review_flagged", {
      row_id: review.id,
    });

    setLoading(false);

    if (error) {
      toast.error("Couldn't report review. Try again.");
      console.error(error); // Keep for dev debugging, but user sees Toast
    } else {
      setReported(true);
      toast.success("Review flagged for moderation.");
    }
  }

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar logic... */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-inner text-sm"
            style={{
              background: `linear-gradient(135deg, 
                hsl(${(review.id.charCodeAt(0) * 5) % 360}, 70%, 80%), 
                hsl(${(review.id.charCodeAt(1) * 5) % 360}, 70%, 60%))`,
            }}
          >
            {review.user_major ? review.user_major[0].toUpperCase() : "S"}
          </div>

          <div>
            <p className="font-bold text-gray-900 text-sm">
              {review.user_major || "Cal Poly Student"}
            </p>
            <p className="text-xs text-gray-400 font-medium">
              {timeAgo(review.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stars... */}
          <div className="flex gap-0.5 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(Number(review.rating))
                    ? "text-poly-gold fill-poly-gold"
                    : "text-gray-200 fill-gray-100"
                }`}
              />
            ))}
          </div>

          {/* THE NEW REPORT BUTTON */}
          <button
            onClick={handleReport}
            disabled={loading || reported}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-full focus:opacity-100 outline-none"
            title="Report this review"
          >
            {reported ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 animate-in zoom-in" />
            ) : (
              <Flag className="w-4 h-4 text-gray-300 hover:text-red-500 transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* BODY */}
      {review.text_content ? (
        <p className="text-gray-700 leading-relaxed text-sm">
          {review.text_content}
        </p>
      ) : (
        <p className="text-gray-300 italic text-xs">No written review.</p>
      )}

      {/* TAGS */}
      {(review.vibe_social > 75 || review.vibe_workload > 75) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
          {review.vibe_social > 75 && (
            <Badge
              variant="secondary"
              className="bg-orange-50 text-orange-700 text-[10px] uppercase tracking-wider font-bold border-none"
            >
              Party Vibe
            </Badge>
          )}
          {review.vibe_workload > 75 && (
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 text-[10px] uppercase tracking-wider font-bold border-none"
            >
              Heavy Workload
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
