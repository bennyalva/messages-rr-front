'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { sendMessage, setReplyingTo } from '@/lib/store/features/chatSlice';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Send, Image as ImageIcon, Smile, Sticker } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateUUID } from '@/lib/utils/uuid';
import { cn } from '@/lib/utils';

import { Tooltip } from '@/components/ui/Tooltip';

export default function MessageInput() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { replyingTo } = useAppSelector(state => state.chat);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Focus input when replying to a message
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  const handleSend = () => {
    if ((!content.trim() && !imagePreview) || !user) return;
    
    setIsSending(true);
    
    // Simulate network delay and animation
    setTimeout(() => {
        dispatch(sendMessage({
            id: generateUUID(),
            userId: user.id,
            userAlias: user.alias,
            userAvatar: user.avatar,
            userGang: user.gang,
            content: content.trim(), 
            image: imagePreview || undefined,
            timestamp: new Date().toISOString(),
            reactions: [],
            replyToId: replyingTo?.id,
        }));
        setContent('');
        setImagePreview(null);
        dispatch(setReplyingTo(null));
        setIsSending(false);
        inputRef.current?.focus();
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  };

  const [showTooltip, setShowTooltip] = useState(false);
  const maxLength = 150;
  
  // Calculate style state derived from content
  let borderColorClass = "border-transparent focus:border-primary/50";
  let tooltipMessage = `Máximo ${maxLength} caracteres`;

  if (content.length >= maxLength) {
      borderColorClass = "border-red-500/50 bg-red-950/20";
  } else if (content.length >= maxLength - 10) {
      borderColorClass = "border-red-500/50";
  } else if (content.length > maxLength * 0.5) {
      borderColorClass = "border-yellow-500/50";
  } else if (content.length > 0) {
      borderColorClass = "border-primary/50";
  }

  // Effect to handle tooltip visibility trigger
  useEffect(() => {
    const isOverLimit = content.length >= maxLength;
    const isNearLimit = content.length >= maxLength - 10;
    const isHalfway = content.length > maxLength * 0.5;

    // Trigger tooltip if in any "active" state
    if (isOverLimit || isNearLimit || isHalfway) {
        setShowTooltip(true);
    } else {
        setShowTooltip(false);
    }
  }, [content, maxLength]);

  // Effect to auto-hide tooltip after 4 seconds of inactivity/appearance
  useEffect(() => {
    if (showTooltip) {
        const timer = setTimeout(() => {
            setShowTooltip(false);
        }, 4000);
        return () => clearTimeout(timer);
    }
  }, [showTooltip, content]); // Reset timer on content change so it stays while typing, then fades.

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Reply Banner */}
      <AnimatePresence>
        {replyingTo && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-accent/10 backdrop-blur border-t border-primary/30 p-2 flex items-center justify-between mx-2 rounded-t-lg mb-0"
            >
                <div className="flex flex-col text-xs text-muted-foreground border-l-2 border-primary pl-2">
                    <span className="font-bold text-primary">Respondiendo a {replyingTo.userAlias}</span>
                    <span className="truncate max-w-[200px] opacity-70">{replyingTo.content}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dispatch(setReplyingTo(null))}>
                    <X className="w-4 h-4" />
                </Button>
            </motion.div>
        )}
      </AnimatePresence>

    <div className="bg-background/80 backdrop-blur-md p-2 border-t border-border flex flex-col gap-2 safe-area-bottom">
       {/* Input Area */}
       <div className="flex flex-col gap-2 w-full max-w-3xl mx-auto">
           
           {/* Image Preview with remove button */}
           {imagePreview && (
                <div className="relative w-fit group">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-border">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                            onClick={() => setImagePreview(null)}
                            className="absolute top-0 right-0 p-1 bg-black/60 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
           )}

           <div className="flex items-center gap-2 relative">
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="image-upload"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setImagePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                        }
                    }}
                />
                <label 
                    htmlFor="image-upload" 
                    className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-accent cursor-pointer transition-colors text-muted-foreground hover:text-foreground"
                    title="Adjuntar imagen"
                >
                    <ImageIcon className="w-5 h-5" />
                </label>
                
                <div className="flex-1 relative pt-1">
                    <Tooltip content={tooltipMessage} visible={showTooltip} position="top" className="w-full">
                        <textarea
                            ref={inputRef}
                            value={content}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                if (newValue.length <= maxLength) {
                                    setContent(newValue);
                                }
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe un mensaje ..."
                            maxLength={maxLength}
                            className={cn(
                                "w-full bg-muted/50 text-foreground rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-0 resize-none transition-all duration-300 border",
                                borderColorClass
                            )}
                            rows={1}
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />
                    </Tooltip>
                </div>

                <Button 
                        onClick={handleSend} 
                        size="icon" 
                        variant="default"
                        className="w-11 h-11 rounded-full shadow-[0_0_10px_theme(colors.primary.DEFAULT)] transition-all flex items-center justify-center"
                        disabled={(!content.trim() && !imagePreview) || isSending}
                >
                        {isSending ? <span className="animate-spin text-lg">💿</span> : <Send className="w-4 h-4 ml-0.5" />}
                </Button>
           </div>
       </div>

    </div>
    </div>
  );
}

