'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import ChatHeader from '@/components/chat/ChatHeader';
import SonideroBanner from '@/components/chat/SonideroBanner';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';

export default function ChatPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
          {/* Decorative Background */}
           <div className="absolute inset-0 bg-[url('/bg-pattern.png')] opacity-10 pointer-events-none" />
           <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

          <ChatHeader />
          <SonideroBanner />
          
          <main className="flex-1 overflow-hidden relative flex flex-col">
              <MessageList />
          </main>

          <MessageInput />
      </div>
    </AuthGuard>
  );
}
