"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle, 
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ReviewForm } from "./ReviewForm";

export function ResponsiveReview({ clubId, clubName }: { clubId: string, clubName: string }) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.refresh(); // Refetch server component data
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-poly-green hover:bg-emerald-900 text-white shadow-xl shadow-poly-green/20 w-full md:w-48 h-12 text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]">
            Rate this Club
          </Button>
        </DialogTrigger>
        
        {/* ----- THE FIX IS HERE ----- */}
        {/* 1. sm:max-w-5xl makes it VERY wide. */}
        {/* 2. max-h-[90vh] ensures it never goes off-screen top/bottom. */}
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl p-0 border-none shadow-2xl ring-1 ring-black/5">
          <div className="sr-only">
             <DialogTitle>Rate {clubName}</DialogTitle>
          </div>
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
            <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">Rate {clubName}</h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">Share your experience with the community</p>
            </div>
          </div>
          
          <div className="p-8">
             <ReviewForm clubId={clubId} onSuccess={handleSuccess} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile Drawer (Unchanged, already optimized for vertical height)
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-poly-green hover:bg-emerald-900 text-white shadow-lg w-full h-12 text-lg font-semibold">
          Rate this Club
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-white/95 backdrop-blur-xl px-4 pb-8 max-h-[95vh] rounded-t-[2rem]">
        <DrawerHeader className="text-left border-b border-gray-100 mb-6 pb-6">
          <DrawerTitle className="font-serif text-2xl text-gray-900">Rate {clubName}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-2">
           <ReviewForm clubId={clubId} onSuccess={handleSuccess} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}