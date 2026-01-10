import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function MessageListSkeleton() {
  return (
    <div className="flex-1 p-4 pb-20 space-y-6 overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map((i) => {
        const isOwn = i % 2 === 0;
        return (
          <div 
            key={i} 
            className={cn(
              "flex w-full gap-2 items-end",
              isOwn ? "justify-end" : "justify-start"
            )}
          >
            {/* Left Avatar for others */}
            {!isOwn && <Skeleton className="w-10 h-10 rounded-full flex-shrink-0 bg-white/20" />}
            
            <div className={cn("flex flex-col gap-1 max-w-[70%]", isOwn ? "items-end" : "items-start")}>
              {/* Username skeleton */}
              <Skeleton className="h-3 w-24 bg-white/20 rounded mb-1" />
              
              {/* Message Bubble Skeleton */}
              <Skeleton 
                className={cn(
                  "h-16 w-full rounded-2xl",
                  isOwn ? "bg-white/20 rounded-tr-sm" : "bg-white/30 rounded-tl-sm"
                )} 
              />
              
              {/* Timestamp skeleton */}
              <Skeleton className="h-2 w-16 bg-white/10 rounded mt-1" />
            </div>

            {/* Right Avatar for own */}
            {isOwn && <Skeleton className="w-10 h-10 rounded-full flex-shrink-0 bg-white/20" />}
          </div>
        );
      })}
    </div>
  );
}
