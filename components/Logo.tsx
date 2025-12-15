import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        // Base styles matching your icon.tsx
        "relative flex items-center justify-center bg-[#154734] text-white font-serif font-black rounded-lg shadow-sm select-none shrink-0",
        // Default size if none provided (matches icon.tsx 32x32)
        "w-8 h-8 text-xl",
        className
      )}
    >
      {/* The Letter P */}
      <span className="relative top-[-1px] leading-none">P</span>

      {/* The Gold Dot (Responsive positioning) */}
      <div className="absolute bottom-[18%] right-[18%] w-[18%] h-[18%] bg-[#C69214] rounded-full" />
    </div>
  );
}
