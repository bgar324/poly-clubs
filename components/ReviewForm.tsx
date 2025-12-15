"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Star,
  Users,
  BookOpen,
  Briefcase,
  Info,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ReviewForm({
  clubId,
  onSuccess,
}: {
  clubId: string;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  // State to track if the user has a valid review in the DB
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true); // New loading state

  // Form State
  const [social, setSocial] = useState(50);
  const [workload, setWorkload] = useState(50);
  const [value, setValue] = useState(50);
  const [reviewText, setReviewText] = useState("");
  const [major, setMajor] = useState("");

  // 1. SMART CHECK: Verify if the local receipt actually exists in the DB
  useEffect(() => {
    async function checkReviewStatus() {
      const localReviewId = localStorage.getItem(`reviewed_club_${clubId}`);

      if (!localReviewId) {
        setCheckingStatus(false);
        return;
      }

      // If we have a receipt, verify it still exists in the DB
      const { data } = await supabase
        .from("reviews")
        .select("id")
        .eq("id", localReviewId)
        .single();

      if (data) {
        // It exists! Block the form.
        setHasSubmitted(true);
      } else {
        // It was deleted from DB! Clear the local receipt and allow reviewing.
        localStorage.removeItem(`reviewed_club_${clubId}`);
        setHasSubmitted(false);
      }
      setCheckingStatus(false);
    }

    checkReviewStatus();
  }, [clubId]);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    starIndex: number
  ) => {
    if (hasSubmitted) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoverRating(x < rect.width / 2 ? starIndex - 0.5 : starIndex);
  };

  async function submitReview() {
    if (rating === 0) {
      toast.error("Please select a star rating!");
      return;
    }

    setLoading(true);

    // IMPORTANT: Add .select() to get the ID back
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        club_id: clubId,
        rating,
        vibe_social: social,
        vibe_workload: workload,
        vibe_value: value,
        text_content: reviewText,
        user_major: major,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error("Failed to post review. Please try again.");
      console.error(error);
    } else if (data) {
      // SUCCESS: Store the actual Review ID, not just "true"
      localStorage.setItem(`reviewed_club_${clubId}`, data.id);

      setHasSubmitted(true);
      toast.success("Review posted successfully!");

      setTimeout(() => {
        onSuccess();
      }, 1500);
    }
  }

  // Loading skeleton while we check DB status (prevents flash of content)
  if (checkingStatus) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400 text-sm">
        Loading review status...
      </div>
    );
  }

  // 3. THE "ALREADY REVIEWED" VIEW
  if (hasSubmitted) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-2 ring-1 ring-green-100 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-serif font-bold text-gray-900">
            Review Submitted
          </h3>
          <p className="text-gray-500 mt-3 max-w-xs mx-auto leading-relaxed">
            Thanks for contributing to the archive! You have already rated this
            club.
          </p>
        </div>
        <Button
          onClick={onSuccess}
          variant="outline"
          className="mt-4 border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Close Window
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. STAR RATING (Centered Top) */}
      <div className="flex flex-col items-center justify-center space-y-4 pb-6 border-b border-gray-100">
        <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <div
              key={star}
              className="relative cursor-pointer transition-transform hover:scale-110 active:scale-95 p-1"
              onMouseMove={(e) => handleMouseMove(e, star)}
              onClick={() => setRating(hoverRating || star)}
            >
              <Star
                className={cn(
                  "w-12 h-12 transition-all duration-300",
                  (hoverRating || rating) >= star
                    ? "text-poly-gold fill-poly-gold drop-shadow-md"
                    : (hoverRating || rating) >= star - 0.5
                    ? "text-poly-gold fill-transparent"
                    : "text-gray-200 fill-gray-50"
                )}
              />
              {(hoverRating || rating) === star - 0.5 && (
                <div className="absolute top-1 left-1 pointer-events-none overflow-hidden w-[50%]">
                  <Star className="w-12 h-12 text-poly-gold fill-poly-gold drop-shadow-md" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-1 h-[3rem]">
          <span className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
            {(hoverRating || rating) > 0
              ? (hoverRating || rating).toFixed(1)
              : "0.0"}
          </span>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {(hoverRating || rating) === 0
              ? "Click stars to rate"
              : (hoverRating || rating) >= 4.5
              ? "Exceptional"
              : (hoverRating || rating) >= 3.5
              ? "Great"
              : (hoverRating || rating) >= 2.5
              ? "Average"
              : (hoverRating || rating) >= 1.5
              ? "Below Average"
              : "Poor"}
          </p>
        </div>
      </div>

      {/* 2. THE LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 items-start">
        {/* LEFT COLUMN: Vibe Checks */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Info className="w-4 h-4 text-gray-400" />
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Vibe Check
            </h3>
          </div>

          <VibeSelector
            icon={<Users className="w-4 h-4" />}
            label="Social Atmosphere"
            value={social}
            onChange={setSocial}
            color="bg-orange-100"
            activeColor="bg-orange-500"
            textColor="text-orange-700"
            options={[
              { val: 0, label: "Strict" },
              { val: 25, label: "Quiet" },
              { val: 50, label: "Balanced" },
              { val: 75, label: "Active" },
              { val: 100, label: "Party" },
            ]}
          />
          <VibeSelector
            icon={<BookOpen className="w-4 h-4" />}
            label="Workload"
            value={workload}
            onChange={setWorkload}
            color="bg-blue-100"
            activeColor="bg-blue-500"
            textColor="text-blue-700"
            options={[
              { val: 0, label: "None" },
              { val: 25, label: "Light" },
              { val: 50, label: "Medium" },
              { val: 75, label: "Heavy" },
              { val: 100, label: "Intense" },
            ]}
          />
          <VibeSelector
            icon={<Briefcase className="w-4 h-4" />}
            label="Career Value"
            value={value}
            onChange={setValue}
            color="bg-emerald-100"
            activeColor="bg-emerald-500"
            textColor="text-emerald-700"
            options={[
              { val: 0, label: "None" },
              { val: 25, label: "Low" },
              { val: 50, label: "Decent" },
              { val: 75, label: "Good" },
              { val: 100, label: "High" },
            ]}
          />
        </div>

        {/* RIGHT COLUMN: Written Details */}
        <div className="space-y-6 flex flex-col h-full">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Info className="w-4 h-4 text-gray-400" />
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Details
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
              Major (Optional)
            </label>
            <Input
              placeholder="e.g. Business Administration"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="bg-white border-gray-200 h-11 text-gray-800 placeholder:text-gray-300 focus:border-poly-green focus:ring-4 focus:ring-poly-green/10 transition-all rounded-lg"
            />
          </div>

          <div className="space-y-2 flex-grow flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
              Review
            </label>
            <Textarea
              placeholder="Be honest about the people, the time commitment, and the vibes..."
              className="flex-grow resize-none bg-white border-gray-200 p-4 text-base leading-relaxed h-full min-h-[150px] text-gray-800 placeholder:text-gray-300 focus:border-poly-green focus:ring-4 focus:ring-poly-green/10 transition-all rounded-lg"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium">
          Reviews are anonymous.
        </p>
        <Button
          onClick={submitReview}
          disabled={loading}
          className="bg-gray-900 hover:bg-black text-white font-bold text-lg px-10 h-12 rounded-xl shadow-xl shadow-gray-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading ? "Posting..." : "Post Review"}
        </Button>
      </div>
    </div>
  );
}

// --- VIBE SELECTOR (Unchanged) ---
function VibeSelector({
  label,
  icon,
  value,
  onChange,
  color,
  activeColor,
  textColor,
  options,
}: any) {
  const currentLabel = options.find((o: any) => o.val === value)?.label;
  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2 text-gray-600 group-hover:text-gray-900 transition-colors">
          {icon}
          <span className="font-medium text-sm">{label}</span>
        </div>
        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md transition-colors",
            textColor
          )}
        >
          {currentLabel}
        </span>
      </div>
      <div className="flex gap-1.5 h-11 w-full">
        {options.map((option: any) => {
          const isActive = value === option.val;
          return (
            <button
              key={option.val}
              type="button"
              onClick={() => onChange(option.val)}
              className={cn(
                "flex-1 transition-all duration-200 rounded-md relative border-2",
                isActive
                  ? cn(
                      color,
                      "border-transparent ring-2 ring-offset-2 ring-gray-100 scale-100 z-10 shadow-sm"
                    )
                  : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              )}
            >
              {isActive && (
                <div
                  className={cn(
                    "absolute inset-0 m-auto w-1.5 h-1.5 rounded-full",
                    activeColor
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
