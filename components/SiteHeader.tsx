"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getClubById } from "@/lib/data"; 
import { useMemo } from "react";

export function SiteHeader() {
  const params = useParams();
  const id = params?.id as string;

  // Real-time lookup of the club name based on URL
  const clubName = useMemo(() => {
    if (!id) return null;
    const club = getClubById(id);
    return club ? club.Name : null;
  }, [id]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left Side: Logo + Dynamic Breadcrumb */}
        <Link href="/" className="flex items-center gap-3 group">
          <Logo className="w-8 h-8 transition-transform group-hover:scale-105" />
          <div className="flex items-center gap-2 font-serif text-lg font-bold text-gray-900">
            <span className="group-hover:text-gray-600 transition-colors">Poly Clubs</span>
            
            {/* The Dynamic Club Name appears here if you are on a club page */}
            {clubName && (
               <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                 <span className="text-gray-300 font-light text-xl">/</span>
                 <span className="text-poly-green truncate max-w-[200px] md:max-w-md">
                   {clubName}
                 </span>
               </div>
            )}
          </div>
        </Link>
        
        {/* Right Side: Empty (Clean look) */}
        <div />
      </div>
    </header>
  );
}