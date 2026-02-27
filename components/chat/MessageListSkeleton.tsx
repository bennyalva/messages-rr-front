import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function MessageListSkeleton() {
  return (
    <div className="flex-1 p-4 pb-20 space-y-6 overflow-hidden">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        const isOwn = i % 2 === 0;
        // Vary heights/widths for a more organic feel
        const bubbleWidth = i % 3 === 0 ? "w-[85%]" : i % 3 === 1 ? "w-[70%]" : "w-[95%]";
        
        return (
          <div 
            key={i} 
            className={cn(
              "flex w-full gap-3 items-end animate-pulse",
              isOwn ? "justify-end" : "justify-start"
            )}
          >
            {/* Left Avatar for others */}
            {!isOwn && <Skeleton className="w-10 h-10 rounded-full flex-shrink-0 bg-muted border border-border/50" />}
            
            <div className={cn("flex flex-col gap-1.5 max-w-[75%]", isOwn ? "items-end" : "items-start")}>
              {/* Username skeleton */}
              <Skeleton className="h-3 w-20 bg-accent/20 rounded-full mb-1" />
              
              {/* Message Bubble Skeleton */}
              <Skeleton 
                className={cn(
                  "h-14 rounded-2xl shadow-sm",
                  bubbleWidth,
                  isOwn 
                    ? "bg-primary/20 rounded-tr-sm" 
                    : "bg-muted rounded-tl-sm border border-border/50"
                )} 
              />
              
              {/* Timestamp skeleton */}
              <Skeleton className="h-2 w-12 bg-muted rounded-full mt-1" />
            </div>

            {/* Right Avatar for own */}
            {isOwn && <Skeleton className="w-10 h-10 rounded-full flex-shrink-0 bg-muted border border-border/50" />}
          </div>
        );
      })}
    </div>
  );
}
