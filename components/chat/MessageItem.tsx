import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Message, Reaction } from '@/lib/store/features/chatSlice';
import { useAppDispatch } from '@/lib/store/hooks';
import { addReaction, deleteMessage, editMessage } from '@/lib/store/features/chatSlice';
import { cn } from '@/lib/utils';
import { Trash2, Reply, CheckCircle2, Smile, Pencil, X, Check } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import ReactionDetailsModal from './ReactionDetailsModal';
import { Input } from '@/components/ui/input';

interface MessageItemProps {
  message: Message;
  messages: Message[];
  isOwn: boolean;
  showAvatar: boolean;
  onReply: (message: Message) => void;
  isUserOnline: boolean;
  activeReactionMenuId: string | null;
  setActiveReactionMenuId: (id: string | null) => void;
  currentUserId?: string;
  isNew?: boolean;  // For entrance animation on new messages
}

const REACTIONS = ['🔥', '💃', '🕺', '🍺', '🔊', '❤️', '🎵'];
const SWIPE_THRESHOLD = 60;
const LONG_PRESS_DURATION = 500;
const CURRENT_USER_ID = 'me';

// Helper to group reactions by emoji and count them
const groupReactions = (reactions: Reaction[]) => {
  const groups: { [emoji: string]: number } = {};
  reactions.forEach(r => {
    groups[r.emoji] = (groups[r.emoji] || 0) + 1;
  });
  return Object.entries(groups).map(([emoji, count]) => ({ emoji, count }));
};

// Helper to format relative time
const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const msgDate = new Date(timestamp);
  const diffMs = now.getTime() - msgDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'hace un momento';
  if (diffMins < 60) return `hace ${diffMins} minutos`;
  if (diffHours < 24) return `hace alrededor de ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
};

export default function MessageItem({ 
  message, 
  messages,
  isOwn, 
  showAvatar, 
  onReply, 
  isUserOnline,
  activeReactionMenuId,
  setActiveReactionMenuId,
  currentUserId = CURRENT_USER_ID,
  isNew = false
}: MessageItemProps) {
  const dispatch = useAppDispatch();
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const [initialReactionTab, setInitialReactionTab] = useState<string>(''); // Selected tab state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [hasReachedThreshold, setHasReachedThreshold] = useState(false);
  const controls = useAnimation();
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isHighlighted, setIsHighlighted] = useState(false);  // Track when message is being highlighted
  
  const showReactions = activeReactionMenuId === message.id;

  // Check if current user has already reacted to this message
  const hasUserReacted = message.reactions.some(r => r.userId === currentUserId);

  // Find the original message if this is a reply
  const replyToMessage = message.replyToId 
    ? messages.find(m => m.id === message.replyToId)
    : null;

  // Handle click outside to close menu
  useEffect(() => {
    if (!showReactions) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveReactionMenuId(null);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 150);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showReactions, setActiveReactionMenuId]);

  // Scroll-based visibility detection for subtle fade effect
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,  // Trigger when 10% of the element is visible
        rootMargin: '-10% 0px -10% 0px'  // Add some margin for smoother transition
      }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Detect when this message is being highlighted (reply navigation)
  useEffect(() => {
    const handleHighlight = (e: CustomEvent<{ messageId: string }>) => {
      if (e.detail.messageId === message.id) {
        setIsHighlighted(true);
        // Reset after 3 seconds
        setTimeout(() => setIsHighlighted(false), 3000);
      }
    };

    window.addEventListener('highlightMessage', handleHighlight as EventListener);
    return () => window.removeEventListener('highlightMessage', handleHighlight as EventListener);
  }, [message.id]);

  // Long Press on Icon
  const handleIconPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    longPressTimer.current = setTimeout(() => {
      setActiveReactionMenuId(message.id);
      if (navigator.vibrate) navigator.vibrate(50);
    }, LONG_PRESS_DURATION);
  };

  const handleIconRelease = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Swipe to Reply - Only on others' messages
  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const progress = Math.min(offset / SWIPE_THRESHOLD, 1);
    setSwipeProgress(Math.max(0, progress));
    
    if (offset >= SWIPE_THRESHOLD && !hasReachedThreshold) {
      setHasReachedThreshold(true);
      if (navigator.vibrate) navigator.vibrate(30);
    } else if (offset < SWIPE_THRESHOLD && hasReachedThreshold) {
      setHasReachedThreshold(false);
    }
  };

  const handleSwipe = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x >= SWIPE_THRESHOLD) {
      onReply(message);
    }
    await controls.start({ x: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } });
    setSwipeProgress(0);
    setHasReachedThreshold(false);
  };

  const handleDelete = () => {
    dispatch(deleteMessage(message.id));
    setShowDeleteConfirm(false);
    setActiveReactionMenuId(null);
  };

  const handleReaction = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(addReaction({ messageId: message.id, reaction: { emoji, userId: currentUserId } }));
    setActiveReactionMenuId(null);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
        editInputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditContent(message.content);
    setActiveReactionMenuId(null);
  };

  const handleEditSave = () => {
    if (editContent.trim() !== message.content) {
        dispatch(editMessage({ id: message.id, content: editContent.trim() }));
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };
  
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') handleEditCancel();
  };

  const groupedReactions = groupReactions(message.reactions);

  // Avatar component with online badge
  const AvatarWithBadge = ({ className }: { className?: string }) => {
    if (!showAvatar) return null; // Don't render spacer, handle width in parent

    return (
      <div className={cn("relative flex-shrink-0 group-avatar", className)}>
         <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
            <img 
            src={message.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userId}`} 
            alt="Avatar" 
            className="w-full h-full object-cover" 
            />
        </div>
        {isUserOnline && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>
    );
  };

  // Action Icon Button - Shows Smile or Reply based on swipe state
  const ActionIconButton = () => {
    const isReplying = !isOwn && swipeProgress > 0;
    
    return (
      <div className="flex items-start h-full pt-1">
        <button
          onTouchStart={handleIconPress}
          onTouchEnd={handleIconRelease}
          onMouseDown={handleIconPress}
          onMouseUp={handleIconRelease}
          onMouseLeave={handleIconRelease}
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200",
            isReplying 
              ? "bg-primary/20 border-primary/40" 
              : "bg-gradient-to-br from-white/10 to-white/5 border border-white/20",
            "hover:from-primary/20 hover:to-primary/10 hover:border-primary/40",
            "active:scale-95 backdrop-blur-sm",
            "shadow-sm hover:shadow-md"
          )}
          title={isReplying ? "Arrastrando para replicar" : "Mantén presionado para reaccionar"}
        >
          {isReplying ? (
            <Reply className="w-4 h-4 text-primary transition-colors" />
          ) : (
            <Smile className="w-4 h-4 text-white/70 hover:text-primary/90 transition-colors" />
          )}
        </button>
      </div>
    );
  };

  // Reply preview component
  const ReplyPreview = () => {
    if (!message.replyToId) return null;

    const originalAuthor = replyToMessage?.isDeleted 
      ? 'Desconocido'
      : replyToMessage?.userAlias || 'Desconocido';
    
    const originalContent = replyToMessage?.isDeleted 
      ? 'Mensaje borrado'
      : (replyToMessage?.image ? 'Imagen enviada' : (replyToMessage?.content || 'Mensaje no disponible'));

    return (
      <div 
        onClick={(e) => {
            e.stopPropagation();
            if (message.replyToId) {
                const el = document.getElementById(`msg-${message.replyToId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Dispatch custom event to highlight the message (React state handles the visual effect)
                    window.dispatchEvent(new CustomEvent('highlightMessage', { 
                      detail: { messageId: message.replyToId } 
                    }));
                }
            }
        }}
        className={cn(
        "mb-2 p-2 rounded-lg text-xs border-l-2 cursor-pointer transition-opacity hover:opacity-80 active:scale-95",
        isOwn 
          ? "bg-black/20 border-white/50" 
          : "bg-black/10 border-primary"
      )}>
        <span className={cn(
          "font-bold block mb-0.5",
          isOwn ? "text-white/90" : "text-primary"
        )}>
          {originalAuthor}
        </span>
        <span className={cn(
          "line-clamp-1 opacity-80",
          isOwn ? "text-white/70" : "text-gray-600"
        )}>
          {originalContent}
        </span>
      </div>
    );
  };

  return (
    <div 
        id={`msg-${message.id}`}
        ref={messageContainerRef}
        className={cn(
            "relative flex w-full gap-1 rounded-xl p-1 transition-all duration-300", 
            showAvatar ? "mt-4 mb-1" : "my-0.5",
            isOwn ? "justify-end" : "justify-start",
            // Entrance animation for new messages
            isNew && "animate-in fade-in zoom-in-95 duration-300",
            // HIGHLIGHT EFFECT: Scale up + frosted glass background
            isHighlighted && "scale-[1.02] bg-white/30 backdrop-blur-md opacity-100",
            // Scroll-based visibility fade (only when not new and not highlighted)
            !isNew && !isHighlighted && (isVisible 
              ? "opacity-100" 
              : "opacity-40")
        )}
    >

        {/* Left side: Avatar + Action Icon (for others' messages) */}
        {!isOwn && (
          <div className={cn(
            "flex flex-col items-center w-10", // Fixed width w-10 (40px)
            showAvatar ? "justify-start gap-1" : "justify-center h-auto self-stretch" 
            // If showAvatar -> Top align, gap for avatar+icon
            // If grouped -> Center align, no gap (only icon), stretch to bubble height
          )}>
            <AvatarWithBadge />
            {!message.isDeleted && <ActionIconButton />}
          </div>
        )}

        {/* Message Content with Swipe - ONLY for others' messages */}
        <motion.div
            drag={!isOwn ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.3 }}
            onDrag={!isOwn ? handleDrag : undefined}
            onDragEnd={!isOwn ? handleSwipe : undefined}
            animate={controls}
            className={cn("max-w-[75%] relative")}
            style={{ x: 0 }}
        >
             {/* Username & Gang Badge - Show only if showAvatar is true (first msg of group) */}
             {!isOwn && !message.isDeleted && showAvatar && (
                 <div className="flex items-center gap-2 mb-1">
                     <span className="font-bold text-primary text-sm">{message.userAlias}</span>
                     {message.userGang && (
                         <span className="text-[10px] text-white bg-gradient-to-r from-primary/80 to-secondary/80 px-2 py-0.5 rounded-full">
                             {message.userGang}
                         </span>
                     )}
                 </div>
             )}

             {/* Own message header - Show only if showAvatar is true (first msg of group) */}
             {isOwn && !message.isDeleted && showAvatar && (
                 <div className="flex items-center justify-end gap-2 mb-1">
                     {message.userGang && (
                         <span className="text-[10px] text-white bg-gradient-to-r from-primary/80 to-secondary/80 px-2 py-0.5 rounded-full">
                             {message.userGang}
                         </span>
                     )}
                     <span className="font-bold text-primary text-sm">{message.userAlias}</span>
                 </div>
             )}

             {/* Message Bubble */}
             <div 
               ref={bubbleRef}
               className={cn(
                 "p-3 rounded-2xl relative shadow-md text-sm break-words",
                 isOwn 
                   ? "bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-tr-sm" 
                   : "bg-white/90 backdrop-blur-sm text-gray-800 rounded-tl-sm border border-gray-200/50",
                 message.isDeleted && "italic opacity-50 bg-muted text-muted-foreground"
               )}
             >
                 {/* Reply To Preview */}
                 {!message.isDeleted && <ReplyPreview />}

                 {/* Image Content */}
                 {message.image && !message.isDeleted && (
                    <div className="mb-2 rounded-lg overflow-hidden max-h-60 border border-white/10">
                        <img src={message.image} alt="Imagen enviada" className="w-full h-full object-cover" />
                    </div>
                 )}

                 {/* Text Content */}
                 {isEditing ? (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                        <Input 
                            ref={editInputRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="bg-black/20 border-white/20 text-white h-8 text-sm"
                        />
                        <div className="flex justify-end gap-2">
                             <button onClick={handleEditCancel} className="p-1 hover:bg-white/10 rounded-full" title="Cancelar">
                                <X className="w-4 h-4 text-white/70" />
                             </button>
                             <button onClick={handleEditSave} className="p-1 hover:bg-green-500/20 rounded-full" title="Guardar">
                                <Check className="w-4 h-4 text-green-400" />
                             </button>
                        </div>
                    </div>
                 ) : (
                    <p className="leading-relaxed">{message.content}</p>
                 )}
             </div>

             {/* Timestamp */}
             <div className={cn(
                 "text-[11px] text-gray-500 mt-1",
                 isOwn ? "text-right" : "text-left"
             )}>
                 {formatRelativeTime(message.timestamp)}
                 {message.isDeleted && <span className="ml-1">(eliminado)</span>}
             </div>

             {/* Reactions Display */}
             {groupedReactions.length > 0 && !message.isDeleted && (
                 <div className={cn(
                     "flex flex-wrap gap-1 mt-2",
                     isOwn ? "justify-end" : "justify-start"
                 )}>
                     {groupedReactions.map((r, i) => (
                         <button 
                             key={i}
                             onClick={() => {
                                 setInitialReactionTab(r.emoji); // Select the emoji tab
                                 setShowReactionDetails(true);
                             }}
                             className="flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-2 py-0.5 text-sm shadow-sm hover:scale-105 transition-transform"
                         >
                             <span>{r.emoji}</span>
                             <span className="text-xs text-gray-600 font-medium">{r.count}</span>
                         </button>
                     ))}
                 </div>
             )}

        </motion.div>

        {/* Right side: Action Icon + Avatar (for own messages) */}
        {isOwn && (
          <div className="flex flex-col gap-1 items-center">
            <AvatarWithBadge />
            {!message.isDeleted && !isEditing && <ActionIconButton />}
          </div>
        )}

         {/* Reaction Details Modal */}
         <ReactionDetailsModal 
            isOpen={showReactionDetails} 
            onClose={() => setShowReactionDetails(false)} 
            reactions={message.reactions} 
            initialTab={initialReactionTab}
         />

         {/* Delete Confirmation Dialog */}
         <ConfirmDialog
           open={showDeleteConfirm}
           onOpenChange={setShowDeleteConfirm}
           title="¿Eliminar mensaje?"
           description="Esta acción no se puede deshacer. El mensaje será marcado como eliminado."
           confirmLabel="Eliminar"
           cancelLabel="Cancelar"
           onConfirm={handleDelete}
           variant="destructive"
         />

         {/* Reaction Menu Overlay ... */}
         {showReactions && !isEditing && (
           <div 
             ref={menuRef}
             className={cn(
               "absolute z-50 top-1/2 -translate-y-1/2 shadow-xl",
               isOwn ? "right-12" : "left-12"
             )}
             onClick={(e) => e.stopPropagation()}
           >
               {hasUserReacted ? (
                 <div className="px-5 py-3 bg-gradient-to-br from-black/95 to-gray-900/95 border border-primary/60 rounded-2xl shadow-[0_0_25px_theme(colors.primary.DEFAULT)] animate-in zoom-in-90 duration-200 backdrop-blur-sm">
                   <div className="flex items-center gap-2.5 text-white/90">
                     <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 text-green-400" />
                     </div>
                     <span className="text-sm font-medium whitespace-nowrap">
                       Ya reaccionaste
                     </span>
                   </div>
                 </div>
               ) : (
                 <div className="bg-gradient-to-br from-black/95 to-gray-900/95 border border-primary rounded-2xl shadow-[0_0_25px_theme(colors.primary.DEFAULT)] animate-in zoom-in-90 duration-200 overflow-hidden backdrop-blur-sm">
                   <div className="px-3 py-2 flex items-center gap-1">
                     {REACTIONS.map(emoji => (
                       <button 
                         key={emoji}
                         onClick={(e) => handleReaction(emoji, e)}
                         className="text-2xl hover:scale-125 active:scale-110 transition-transform p-1"
                       >
                         {emoji}
                       </button>
                     ))}
                   </div>
                   {isOwn && !message.isDeleted && (
                     <>
                       <div className="border-t border-gray-700/50" />
                       <button 
                         onClick={handleEditStart}
                         className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm w-full justify-center py-2 hover:bg-blue-500/10 transition-colors"
                       >
                         <Pencil className="w-4 h-4" />
                         <span className="font-medium">Editar mensaje</span>
                       </button>
                       <div className="border-t border-gray-700/50" />
                       <button 
                         onClick={handleDeleteClick}
                         className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm w-full justify-center py-2 hover:bg-red-500/20 transition-colors"
                       >
                         <Trash2 className="w-4 h-4" />
                         <span className="font-medium">Eliminar mensaje</span>
                       </button>
                     </>
                   )}
                 </div>
               )}
           </div>
         )}
    </div>
  );
}
