"use client";

import { Club } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// 1. Extend the type to include the stats passed from the parent
interface ClubCardProps {
  club: Club & { rating?: string; reviewCount?: number }; 
}

export function ClubCard({ club }: ClubCardProps) {
  
  // 2. TRUTHFUL LOGIC: No math, no hashes. 
  // If stats exist, use them. If not, it's 0.
  const rating = club.rating ? Number(club.rating).toFixed(1) : null;
  const reviewCount = club.reviewCount || 0;
  const hasReviews = reviewCount > 0;

  // Use 'medium-sq' for grid optimization
  const imageUrl = club.ProfilePicture
    ? `https://se-images.campuslabs.com/clink/images/${club.ProfilePicture}?preset=large-sq`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={`/club/${club.Id}`}>
        <Card className="h-full flex flex-col border-none shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 cursor-pointer group bg-white overflow-hidden rounded-2xl relative">
          
          {/* HEADER */}
          <div className="p-5 pb-3 flex items-start gap-4">
            {/* Logo or Initials */}
            <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={club.Name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xl font-serif font-bold">
                  {club.ShortName?.charAt(0) || club.Name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-serif text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-poly-green transition-colors">
                  {club.Name}
                </h3>
                
                {/* RATING BADGE: Only render if we actually have data */}
                {hasReviews && rating && (
                  <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100 flex-shrink-0">
                    <Star className="w-3 h-3 text-poly-gold fill-poly-gold" />
                    <span className="text-xs font-bold text-gray-700">
                      {rating}
                    </span>
                  </div>
                )}
              </div>

              {/* META TEXT */}
              <p className="text-xs text-gray-400 mt-1.5 font-medium">
                {hasReviews 
                  ? `${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}` 
                  : "No reviews yet"}
              </p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <CardContent className="px-5 py-0 pb-4 flex-grow">
            <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed font-normal">
              {club.Summary ||
               club.Description?.replace(/<[^>]*>?/gm, "") ||
               "No description available."}
            </p>
          </CardContent>

          {/* TAGS: Only render if they truly exist. No fake "General" tag. */}
          {club.CategoryNames && club.CategoryNames.length > 0 && (
            <CardFooter className="px-5 py-4 pt-0 flex flex-wrap gap-2 mt-auto">
              {club.CategoryNames.slice(0, 3).map((cat) => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="bg-gray-50 text-gray-600 hover:bg-gray-100 text-[10px] font-medium border border-gray-100"
                >
                  {cat}
                </Badge>
              ))}
            </CardFooter>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}