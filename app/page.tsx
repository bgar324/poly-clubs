"use client";

import { useState, useMemo, useEffect } from "react";
import { getAllClubs } from "@/lib/data";
import { ClubCard } from "@/components/ClubCard";
import {
  Search,
  X,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Star,
  ArrowDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Club } from "@/lib/types";

const INITIAL_LOAD = 24;
const LOAD_MORE_STEP = 24;

// --- UTILITY HOOK: DEBOUNCE ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [stats, setStats] = useState<
    Record<string, { rating: number; count: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [activeCategory, setActiveCategory] = useState("All");

  const rawClubs = useMemo(() => getAllClubs(), []);

  // --- DYNAMIC CATEGORY GENERATOR ---
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    rawClubs.forEach((club) => {
      club.CategoryNames?.forEach((cat) => {
        const cleanCat = cat.trim();
        map.set(cleanCat, (map.get(cleanCat) || 0) + 1);
      });
    });
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0])
      .slice(0, 10);
    return ["All", ...sorted];
  }, [rawClubs]);

  // 1. Fetch Real Stats (optimized with database aggregation)
  useEffect(() => {
    async function fetchStats(retries = 3) {
      try {
        const { data, error } = await supabase.rpc("get_review_stats");

        if (error) {
          throw error;
        }

        if (data) {
          const finalStats: Record<string, { rating: number; count: number }> = {};
          data.forEach((stat: { club_id: string; avg_rating: number; review_count: number }) => {
            finalStats[stat.club_id] = {
              rating: Number(stat.avg_rating),
              count: Number(stat.review_count),
            };
          });
          setStats(finalStats);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch review stats:", err);
        if (retries > 0) {
          // Retry after 1 second
          setTimeout(() => fetchStats(retries - 1), 1000);
          return;
        }
        setError("Unable to load review stats. Clubs are shown without ratings.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // 2. Filter & Sort Logic (THE FIX: SEARCH + CATEGORY AND LOGIC)
  const processedClubs = useMemo(() => {
    const merged = rawClubs.map((c) => ({
      ...c,
      rating: stats[String(c.Id)]?.rating.toFixed(1) || undefined,
      reviewCount: stats[String(c.Id)]?.count || 0,
    }));

    let filtered = merged;

    // STEP 1: Apply Category Filter
    if (activeCategory !== "All") {
      filtered = filtered.filter(
        (club) =>
          club.CategoryNames && club.CategoryNames.includes(activeCategory)
      );
    }

    // STEP 2: Apply Search Filter (ON TOP of Category)
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (club) =>
          club.Name.toLowerCase().includes(lowerSearch) ||
          (club.ShortName && club.ShortName.toLowerCase().includes(lowerSearch))
      );
    }

    // Sort: Review Count > Alphabetical
    return filtered.sort((a, b) => {
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
      return a.Name.localeCompare(b.Name);
    });
  }, [debouncedSearch, rawClubs, stats, activeCategory]);

  useEffect(() => {
    setVisibleCount(INITIAL_LOAD);
  }, [debouncedSearch, activeCategory]);

  const visibleClubs = processedClubs.slice(0, visibleCount);
  const hasMore = visibleCount < processedClubs.length;

  const featuredClubs = useMemo(() => {
    if (debouncedSearch || activeCategory !== "All") return [];
    return processedClubs.slice(0, 3);
  }, [processedClubs, debouncedSearch, activeCategory]);

  return (
    <main className="min-h-screen bg-[#FAFAF9] selection:bg-poly-green/20">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-white to-transparent pointer-events-none" />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-poly-green/5 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-poly-gold/5 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm px-4 py-1.5 rounded-full text-xs font-bold text-poly-green mb-8 uppercase tracking-wider ring-1 ring-gray-100">
              <Sparkles className="w-3 h-3 text-poly-gold fill-poly-gold" />
              <span>The Unofficial Archive</span>
            </div>

            <h1 className="font-serif text-5xl md:text-8xl font-bold tracking-tighter text-gray-900 mb-6 leading-[0.9]">
              Find your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-poly-green to-emerald-600 italic pr-1">
                people.
              </span>
            </h1>

            <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover and explore {rawClubs.length}{" "}
              organizations. <br className="hidden md:block" />
              Ranked by unfiltered and anonymous student reviews.
            </p>
          </motion.div>

          {/* SEARCH BAR */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl mx-auto mb-16"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-poly-green/20 to-poly-gold/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <div className="relative bg-white shadow-2xl shadow-gray-200/40 rounded-2xl flex items-center p-2 border border-gray-100 ring-1 ring-gray-50/50">
                <div className="pl-4 pr-3 text-gray-400 group-focus-within:text-poly-green transition-colors">
                  <Search className="w-6 h-6" />
                </div>
                <input
                  type="text"
                  placeholder={
                    activeCategory === "All"
                      ? "Search clubs..."
                      : `Search in ${activeCategory}...`
                  }
                  className="w-full py-4 bg-transparent text-lg text-gray-800 placeholder:text-gray-300 focus:outline-none font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors mr-1"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURED SECTION --- */}
      {!debouncedSearch &&
        activeCategory === "All" &&
        featuredClubs.length > 0 && (
          <section className="max-w-[1600px] mx-auto px-6 mb-20">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-poly-gold fill-poly-gold" />
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Trending Now
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredClubs.map((club, i) => (
                <FeaturedCard key={club.Id} club={club} index={i} />
              ))}
            </div>
          </section>
        )}

      {/* --- MAIN CONTENT --- */}
      <section className="max-w-[1600px] mx-auto px-6 pb-40">
        {/* STICKY FILTER BAR */}
        {/* FILTER BAR - FIXED: Removed 'sticky top-4' so it scrolls away naturally */}
        <div className="z-10 py-4 mb-8 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          {/* CATEGORY PILLS */}
          <div className="relative flex-1 min-w-0">
            {/* Left Fade */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#FAFAF9] to-transparent z-10 pointer-events-none" />

            {/* Right Fade */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FAFAF9] to-transparent z-10 pointer-events-none" />

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 px-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                    activeCategory === cat
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-gray-400 whitespace-nowrap px-4 md:px-0">
            {loading ? "Syncing..." : error ? (
              <span className="text-orange-500">{error}</span>
            ) : `${processedClubs.length} results`}
          </div>
        </div>

        {/* GRID */}
        {visibleClubs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {visibleClubs.map((club) => (
                <ClubCard key={club.Id} club={club} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-20">
                <button
                  onClick={() =>
                    setVisibleCount((prev) => prev + LOAD_MORE_STEP)
                  }
                  className="group relative px-8 py-4 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 font-bold text-gray-700 group-hover:text-gray-900 flex items-center gap-2">
                    Show More <ArrowDownIcon className="w-4 h-4" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* EMPTY STATE - FIXED: Smarter message based on context */
          <div className="text-center py-32 border-2 border-dashed border-gray-100 rounded-3xl">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {activeCategory !== "All"
                ? `We couldn't find "${search}" in the ${activeCategory} category.`
                : `We couldn't find anything matching "${search}".`}
            </p>

            {activeCategory !== "All" && (
              <button
                onClick={() => setActiveCategory("All")}
                className="text-poly-green font-bold hover:underline mr-4"
              >
                Search in All Categories
              </button>
            )}

            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="text-gray-400 hover:text-gray-600 font-bold hover:underline"
            >
              Clear Everything
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

// --- SPECIAL "FEATURED" CARD VARIANT ---
function FeaturedCard({
  club,
  index,
}: {
  club: Club & { rating?: string; reviewCount?: number };
  index: number;
}) {
  const imageUrl = club.ProfilePicture
    ? `https://se-images.campuslabs.com/clink/images/${club.ProfilePicture}?preset=large-sq`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative group cursor-pointer"
    >
      <a href={`/club/${club.Id}`} className="block h-full">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10 rounded-3xl" />
        <div className="h-64 w-full rounded-3xl overflow-hidden relative shadow-lg">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={club.Name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <span className="text-4xl font-serif text-white/20 font-bold">
                {club.Name.charAt(0)}
              </span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
            <div className="flex justify-between items-end">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-poly-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    #{index + 1} Trending
                  </span>
                </div>
                <h3 className="text-white font-serif text-2xl font-bold leading-tight line-clamp-1">
                  {club.Name}
                </h3>
                <p className="text-white/80 text-sm mt-1 font-medium">
                  {club.reviewCount} reviews • {club.rating} Stars
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-2 rounded-full group-hover:bg-white group-hover:text-black transition-all text-white">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}
