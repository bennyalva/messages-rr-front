'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Reaction } from '@/lib/store/features/chatSlice';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/lib/store/hooks';

interface ReactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reactions: Reaction[];
  initialTab?: string;
}

export default function ReactionDetailsModal({ isOpen, onClose, reactions, initialTab }: ReactionDetailsModalProps) {
  const { users } = useAppSelector(state => state.chat);

  // Group reactions by emoji
  const reactionsByEmoji = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  const emojis = Object.keys(reactionsByEmoji);
  
  // Use initialTab if provided and valid, otherwise fallback to first emoji
  const [activeTab, setActiveTab] = useState(initialTab || emojis[0] || '');

  // Reset/Update tab when modal opens
  useEffect(() => {
     if (isOpen) {
         if (initialTab && emojis.includes(initialTab)) {
             setActiveTab(initialTab);
         } else if (emojis.length > 0) {
             // Fallback to first emoji if initialTab not found or not provided
             // We only do this on OPEN. 
             // Note: If activeTab is already set from previous open, this overrides it, which is desired.
             setActiveTab(emojis[0]);
         }
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ height: '400px' }} 
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <h3 className="text-foreground font-bold">Reacciones</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto p-2 gap-2 border-b border-border scrollbar-hide flex-shrink-0">
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => setActiveTab(emoji)}
                className={cn(
                  "px-4 py-2 rounded-full text-lg transition-colors relative flex items-center gap-2 flex-shrink-0 select-none cursor-pointer",
                  activeTab === emoji 
                    ? "bg-primary/20 text-primary" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span>{emoji}</span>
                <span className="text-xs font-bold text-gray-500">{reactionsByEmoji[emoji].length}</span>
                {activeTab === emoji && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full mx-4"
                  />
                )}
              </button>
            ))}
          </div>

          {/* List - Auto scroll after approx 4 items */}
          <div className="overflow-y-auto p-2 flex-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {activeTab && reactionsByEmoji[activeTab]?.map((reaction, idx) => {
              const userDetail = users[reaction.userId];
              const displayName = userDetail?.alias || `Usuario ${reaction.userId}`;
              const avatar = userDetail?.avatar;

              return (
                  <div key={idx} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-xl transition-colors">
                     {/* Avatar */}
                     <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 overflow-hidden border border-border">
                        {avatar ? (
                            <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-[10px]">
                                {reaction.userId.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-foreground text-sm font-medium">{displayName}</span>
                     </div>
                  </div>
              );
            })}
            {emojis.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No hay reacciones todavía
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
