import { getAllClubs, getClubById } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  Globe,
  MapPin,
  Users,
  Calendar,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResponsiveReview } from "@/components/ResponsiveReview";
import { ReviewItem } from "@/components/ReviewItem";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next"; // <-- Import Metadata type

// Force dynamic rendering to show reviews immediately
export const dynamic = 'force-dynamic';

// 1. GENERATE STATIC PARAMS
export async function generateStaticParams() {
  const clubs = getAllClubs();
  return clubs.map((club) => ({
    id: String(club.Id),
  }));
}

// 2. DYNAMIC METADATA GENERATOR (The core SEO enhancement)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const club = getClubById(id);

  if (!club) {
    return {
      title: "Club Not Found | Poly Clubs",
      description: "The requested club page does not exist.",
    };
  }

  // --- Construct Dynamic Values ---
  const clubTitle = `${club.Name} | Poly Clubs`;

  // Fetch review count for the description
  const { count } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("club_id", String(club.Id));

  const reviewCount = count || 0;

  const clubDescription =
    reviewCount > 0
      ? `Check ${reviewCount} anonymous student reviews and ratings for ${club.Name} (ID: ${club.Id}).`
      : `Explore information and be the first to review ${club.Name}.`;

  const imageUrl = club.ProfilePicture
    ? `https://se-images.campuslabs.com/clink/images/${club.ProfilePicture}?preset=large-sq`
    : "/icon"; // Fallback to Next.js generated icon

  return {
    title: clubTitle,
    description: clubDescription,
    openGraph: {
      title: clubTitle,
      description: clubDescription,
      url: `https://poly-clubs.vercel.app/club/${id}`, // IMPORTANT: Use your actual deployed URL
      images: [
        {
          url: imageUrl,
          alt: `${club.Name} Profile Image`,
        },
      ],
    },
    // Optional: Add Twitter card data for optimal sharing
    twitter: {
      card: "summary",
      site: "@PolyClubs",
      title: clubTitle,
      description: clubDescription,
      images: [imageUrl],
    },
  };
}

// Helper for relative time (e.g. "2 days ago")
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
}

// 3. THE PAGE COMPONENT
export default async function ClubPage({
  params,
}: {
  params: Promise<{ id: string }>; // params are now a Promise in Next.js 15
}) {
  const { id } = await params;
  const club = getClubById(id);

  if (!club) {
    return notFound();
  }

  const clubIdStr = String(club.Id);

  // --- REAL DATA FETCHING ---
  // Fetch ALL fields and order by newest, excluding flagged reviews
  const { data: reviews, error: reviewError } = await supabase
    .from("reviews")
    .select("*")
    .eq("club_id", clubIdStr)
    .eq("flagged", false)
    .order("created_at", { ascending: false });

  // Log error but still render page (reviews will be empty)
  if (reviewError) {
    console.error("Failed to fetch reviews:", reviewError);
  }

  // --- REAL MATH CALCULATION ---
  const reviewCount = reviews?.length || 0;
  let stats = null;

  if (reviewCount > 0 && reviews) {
    const totalRating = reviews.reduce((sum, r) => sum + Number(r.rating), 0);
    const totalSocial = reviews.reduce(
      (sum, r) => sum + (r.vibe_social || 50),
      0
    );
    const totalWorkload = reviews.reduce(
      (sum, r) => sum + (r.vibe_workload || 50),
      0
    );
    const totalValue = reviews.reduce(
      (sum, r) => sum + (r.vibe_value || 50),
      0
    );

    stats = {
      rating: (totalRating / reviewCount).toFixed(1),
      social: Math.round(totalSocial / reviewCount),
      workload: Math.round(totalWorkload / reviewCount),
      value: Math.round(totalValue / reviewCount),
    };
  }

  const imageUrl = club.ProfilePicture
    ? `https://se-images.campuslabs.com/clink/images/${club.ProfilePicture}?preset=large-sq`
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <div className="relative bg-[#FAFAF9] border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-400 hover:text-poly-green mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* LOGO */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-white shadow-xl border border-gray-100 flex-shrink-0">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={club.Name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-poly-green text-white text-4xl font-serif font-bold">
                  {club.Name.charAt(0)}
                </div>
              )}
            </div>

            {/* TITLE */}
            <div className="flex-grow space-y-4">
              <div>
                <h1 className="font-serif text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                  {club.Name}
                </h1>
                {club.ShortName && (
                  <p className="text-xl text-gray-400 font-medium mt-1">
                    {club.ShortName}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {club.CategoryNames?.map((cat) => (
                  <Badge
                    key={cat}
                    variant="secondary"
                    className="bg-white border border-gray-200 text-gray-600 hover:border-poly-green hover:text-poly-green"
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
              <ResponsiveReview clubId={clubIdStr} clubName={club.Name} />
              {club.WebsiteKey && (
                <a
                  href={`https://now.calpoly.edu/organization/${club.WebsiteKey}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full md:w-48 h-12 border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <Globe className="w-4 h-4 mr-2" /> Official Page
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* LEFT COLUMN: About & Reviews */}
        <div className="lg:col-span-2 space-y-16">
          {/* ABOUT SECTION */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              About
            </h2>
            <div
              className="prose prose-lg prose-green text-gray-600 leading-relaxed max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  club.Description ||
                  club.Summary ||
                  "No description available.",
              }}
            />
          </section>

          {/* --- REVIEWS LIST SECTION --- */}
          <section id="reviews" className="scroll-mt-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
                Student Reviews{" "}
                <span className="text-gray-300 text-lg font-normal">
                  ({reviewCount})
                </span>
              </h2>
            </div>

            <div className="space-y-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No reviews yet.</p>
                  <p className="text-sm text-gray-400">
                    Be the first to share your experience!
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Stats Sticky */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8 sticky top-8">
            {stats ? (
              <>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-6xl font-serif font-bold text-gray-900 tracking-tight">
                    {stats.rating}
                  </span>
                  <div className="pb-3 flex flex-col">
                    <span className="text-gray-400 font-medium text-sm">
                      OUT OF 5.0
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(Number(stats.rating))
                          ? "text-poly-gold fill-poly-gold"
                          : "text-gray-200 fill-gray-100"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-bold text-gray-500 ml-2">
                    {reviewCount} reviews
                  </span>
                </div>

                <div className="space-y-6">
                  <VibeBar
                    label="Social Atmosphere"
                    percent={stats.social}
                    color="bg-orange-500"
                    bg="bg-orange-100"
                  />
                  <VibeBar
                    label="Workload Intensity"
                    percent={stats.workload}
                    color="bg-blue-500"
                    bg="bg-blue-100"
                  />
                  <VibeBar
                    label="Career Value"
                    percent={stats.value}
                    color="bg-emerald-500"
                    bg="bg-emerald-100"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">No Ratings Yet</h3>
                <p className="text-sm text-gray-500 mb-4 px-4">
                  This club is waiting for its first pioneer.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Improved Vibe Bar with Background Track Color
function VibeBar({
  label,
  percent,
  color,
  bg,
}: {
  label: string;
  percent: number;
  color: string;
  bg: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
        <span>{label}</span>
        <span className="text-gray-900">{percent}%</span>
      </div>
      <div className={`w-full ${bg} rounded-full h-2.5 overflow-hidden`}>
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}
