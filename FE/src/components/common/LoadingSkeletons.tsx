import { cn } from "@/utils/cn";

export function Sk({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-gray-200 rounded-xl", className)} />;
}

export function BottomSheetSkeleton() {
  return (
    <div className="px-5 pt-2 pb-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <Sk className="h-5 w-20 rounded-full" />
          <Sk className="h-6 w-48" />
          <Sk className="h-4 w-24" />
        </div>
        <Sk className="w-8 h-8 rounded-full flex-shrink-0" />
      </div>
      <Sk className="h-16 w-full" />
      <div className="flex gap-2">
        <Sk className="h-10 flex-1 rounded-2xl" />
        <Sk className="h-10 flex-1 rounded-2xl" />
        <Sk className="h-10 w-24 rounded-2xl" />
      </div>
    </div>
  );
}
