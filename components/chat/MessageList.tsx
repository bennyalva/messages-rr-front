import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { setReplyingTo, fetchMessages, fetchUsers, Message } from '@/lib/store/features/chatSlice';
import MessageItem from './MessageItem';
import MessageListSkeleton from './MessageListSkeleton';
import { ChevronsDown } from 'lucide-react';

// Background gradient for message list area
const MESSAGE_LIST_BACKGROUND = 'linear-gradient(135deg, rgba(255,182,193,0.3) 0%, rgba(173,216,230,0.3) 50%, rgba(255,218,185,0.3) 100%)';

export default function MessageList() {
    const { messages, user, activeUsers, replyingTo } = useAppSelector(state => ({ 
        messages: state.chat.messages, 
        user: state.auth.user,
        activeUsers: state.chat.activeUsers,
        replyingTo: state.chat.replyingTo
    }));
    const containerRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const [activeReactionMenuId, setActiveReactionMenuId] = useState<string | null>(null);
    const [initialLoad, setInitialLoad] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [canShowScrollButton, setCanShowScrollButton] = useState(false);  // Delay showing button after load
    
    // Track initial scroll to force instant positioning
    const hasInitialScrolled = useRef(false);

    // Track new messages for entrance animation
    const prevMessageCountRef = useRef(0);
    const [newMessageId, setNewMessageId] = useState<string | null>(null);
    
    // Detect when a new message is added
    useEffect(() => {
        if (!initialLoad && messages.length > prevMessageCountRef.current) {
            const newestMessage = messages[messages.length - 1];
            setNewMessageId(newestMessage?.id || null);
            
            // Clear the "new" status after animation completes
            const timer = setTimeout(() => setNewMessageId(null), 600);
            return () => clearTimeout(timer);
        }
        prevMessageCountRef.current = messages.length;
    }, [messages.length, initialLoad]);

    // Initial Fetch with Artificial Delay for Skeleton
    useEffect(() => {
        const loadData = async () => {
             const minDelayPromise = new Promise(resolve => setTimeout(resolve, 3000));
             const fetchPromise = dispatch(fetchMessages()).unwrap();
             const usersPromise = dispatch(fetchUsers()).unwrap();

             await Promise.all([minDelayPromise, fetchPromise, usersPromise]);
             setInitialLoad(false);
        };

        loadData();
    }, [dispatch]);

    // Robust Scroll to Bottom Function
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (containerRef.current) {
            const { scrollHeight, clientHeight } = containerRef.current;
            const maxScrollTop = scrollHeight - clientHeight;
            
            // Use 'instant' for direct mathematical assignment if needed, or behavior prop
            if (behavior === 'instant') {
                containerRef.current.scrollTop = maxScrollTop;
            } else {
                containerRef.current.scrollTo({ top: maxScrollTop, behavior });
            }
        }
    };

    // 1. Immediate scroll after DOM mutation (Messages added)
    // 1. Immediate scroll after DOM mutation (Messages added)
    // 1. Immediate scroll after DOM mutation (Messages added)
    useLayoutEffect(() => {
        if (messages.length > 0) {
            // First time load: Instant jump to bottom (no animation)
            if (!hasInitialScrolled.current) {
                scrollToBottom('instant');
                hasInitialScrolled.current = true;
                
                // Reinforce scroll for late-loading images (common in initial load)
                // We force it again after short delays to catch layout shifts
                setTimeout(() => scrollToBottom('instant'), 100);
                setTimeout(() => scrollToBottom('instant'), 300);
                setTimeout(() => scrollToBottom('instant'), 500);
            } 
            // New messages: Smooth scroll
            else {
                scrollToBottom('smooth');
            }
        }
    }, [messages.length, initialLoad]);

    // 2. Fallback check for "pop-in" content or slow renders
    useEffect(() => {
        const timer = setTimeout(() => scrollToBottom('smooth'), 100);
        return () => clearTimeout(timer);
    }, [messages.length]);

    // Mobile Keyboard & Viewport Handling
    useEffect(() => {
        const handleResize = () => {
             if (containerRef.current) {
                // Aggressively force scroll to bottom on viewport resize (keyboard open)
                window.requestAnimationFrame(() => scrollToBottom('instant'));
                setTimeout(() => scrollToBottom('instant'), 100);
                setTimeout(() => scrollToBottom('instant'), 300);
             }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
        }
        
        return () => {
             if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
             }
        };
    }, []);

    // Scroll when replying mode changes
    useEffect(() => {
        if (replyingTo) {
            setTimeout(() => scrollToBottom('smooth'), 100);
        }
    }, [replyingTo]);

    // ResizeObserver to watch container size changes (e.g. images)
    useEffect(() => {
        const currentContainer = containerRef.current;
        if (!currentContainer) return;

        const observer = new ResizeObserver(() => {
             // If we are near bottom or just want to enforce bottom on size chagne
             // For a chat, usually we want to stick to bottom if we were already there.
             // But simpler logic: if resizing happens, just ensure we see things if we just sent a msg.
             // Let's check logic:
             const { scrollHeight, clientHeight, scrollTop } = currentContainer;
             const isNearBottom = scrollHeight - scrollTop - clientHeight < 150; // Increased threshold
             
             if (isNearBottom) {
                 scrollToBottom('instant');
             }
        });

        observer.observe(currentContainer);

        return () => {
            observer.unobserve(currentContainer);
        };
    }, [messages.length]); 

    const handleReply = (msg: Message) => {
        dispatch(setReplyingTo(msg));
    };

    // Handle scroll to show/hide scroll-to-bottom button
    const handleScroll = () => {
        if (!containerRef.current) return;
        
        const { scrollHeight, clientHeight, scrollTop } = containerRef.current;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        
        // Enable scroll button feature once we reach bottom after initial load
        if (!canShowScrollButton && !initialLoad && distanceFromBottom < 5) {
            setCanShowScrollButton(true);
            return; // Don't show button yet, we just enabled it
        }
        
        // Only show/hide button after feature is enabled
        if (canShowScrollButton) {
            setShowScrollButton(distanceFromBottom > 50);
        }
    };

    if (initialLoad) {
        return (
             <div 
                className="flex-1"
                style={{ background: MESSAGE_LIST_BACKGROUND }}
            >
                <MessageListSkeleton />
            </div>
        );
    }

    return (
        <div className="relative flex-1 flex flex-col overflow-hidden">
            <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 p-2 pb-32 space-y-2 overflow-y-auto scroll-smooth"
                style={{ background: MESSAGE_LIST_BACKGROUND }}
            >
            {messages.map((msg, index) => {
                const prevMsg = messages[index - 1];
                const isOwn = msg.userId === user?.id;
                const showAvatar = !prevMsg || prevMsg.userId !== msg.userId || (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 60000);

                return (
                    <MessageItem 
                        key={msg.id} 
                        message={msg} 
                        messages={messages}
                        isOwn={isOwn} 
                        showAvatar={showAvatar}
                        onReply={handleReply}
                        isUserOnline={activeUsers.includes(msg.userId)}
                        activeReactionMenuId={activeReactionMenuId}
                        setActiveReactionMenuId={setActiveReactionMenuId}
                        currentUserId={user?.id}
                        isNew={msg.id === newMessageId}
                    />
                );
            })}
            </div>

            {/* Scroll to Bottom Button */}
            {showScrollButton && (
                <button
                    onClick={() => scrollToBottom('smooth')}
                    className="absolute bottom-32 right-4 p-2 bg-black/20 backdrop-blur-sm text-white/70 rounded-full shadow-sm hover:bg-black/30 hover:text-white active:scale-95 transition-all duration-200 animate-in fade-in z-20"
                    aria-label="Ir al último mensaje"
                >
                    <ChevronsDown className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
