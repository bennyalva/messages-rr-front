import { motion, MotionProps } from 'framer-motion';
import { Disc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedLogoProps extends MotionProps {
  logoUrl?: string;
  className?: string;
  imageClassName?: string;
  glowClassName?: string;
  discClassName?: string;
}

export function AnimatedLogo({ 
  logoUrl, 
  className, 
  imageClassName, 
  glowClassName, 
  discClassName, 
  ...props 
}: AnimatedLogoProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "relative flex items-center justify-center", 
        className
      )}
      {...props}
    >
       {/* Subtle glow effect behind the logo */}
       <div className={cn("absolute inset-0 bg-primary/20 blur-2xl rounded-full", glowClassName)} />
       
       {logoUrl ? (
         <img 
           src={logoUrl} 
           alt="Logo" 
           className={cn("object-contain relative z-10 drop-shadow-lg", imageClassName)}
         />
       ) : (
         <Disc className={cn("text-primary relative z-10 animate-[spin_3s_linear_infinite]", discClassName)} />
       )}
    </motion.div>
  );
}
