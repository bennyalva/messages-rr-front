import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { setReplyingTo, fetchMessages, fetchUsers, Message } from '@/lib/store/features/chatSlice';
import MessageItem from './MessageItem';
import MessageListSkeleton from './MessageListSkeleton';

export default function MessageList() {
    const { messages, user, activeUsers, isLoading, replyingTo } = useAppSelector(state => ({ 
        messages: state.chat.messages, 
        user: state.auth.user,
        activeUsers: state.chat.activeUsers,
        isLoading: state.chat.isLoading,
        replyingTo: state.chat.replyingTo
    }));
    const containerRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const [activeReactionMenuId, setActiveReactionMenuId] = useState<string | null>(null);
    const [initialLoad, setInitialLoad] = useState(true);

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
    useLayoutEffect(() => {
        // If it's the very first load, instant scroll. Otherwise smooth.
        // Actually, for new messages, smooth is nice, but if user is typing, instant ensures visibility.
        // Let's stick to smooth usually, but allow instant override.
        if (messages.length > 0) {
            scrollToBottom('smooth');
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

    if (initialLoad) {
        return (
             <div 
                className="flex-1"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,182,193,0.3) 0%, rgba(173,216,230,0.3) 50%, rgba(255,218,185,0.3) 100%)',
                }}
            >
                <MessageListSkeleton />
            </div>
        );
    }

    return (
        <div 
            ref={containerRef}
            className="flex-1 p-2 pb-32 space-y-2 overflow-y-auto scroll-smooth"
            style={{
                background: 'linear-gradient(135deg, rgba(255,182,193,0.3) 0%, rgba(173,216,230,0.3) 50%, rgba(255,218,185,0.3) 100%)',
                scrollBehavior: 'smooth'
            }}
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
                    />
                );
            })}
        </div>
    );
}
