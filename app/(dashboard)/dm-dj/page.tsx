'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import ChatHeader from '@/components/chat/ChatHeader';
import { SubmitButton } from '@/components/ui/submit-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import httpClient from '@/lib/services/httpClient';
import { generateUUID } from '@/lib/utils/uuid';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { ENDPOINTS, LIMITS, ROUTES } from '@/lib/constants';
import { ContentOverlay } from '@/components/ui/content-overlay';

function DmDjPageContent() {

  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSendClick = () => {
    if (!message.trim() || !user) return;
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    if (!message.trim() || !user) return;
    
    setIsSending(true);
    try {
        await httpClient.post(ENDPOINTS.DIRECT_MESSAGES, {
            id: generateUUID(),
            userId: user.id,
            userAlias: user.alias,
            userGang: user.gang || '',
            content: message.trim(),
            timestamp: new Date().toISOString(),
            isRead: false,
        });
        setShowConfirm(false);
        setMessage('');
        setShowSuccess(true);
    } catch (error) {
        setShowConfirm(false);
        // Error handled globally by httpClient interceptor
    } finally {
        setIsSending(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push(ROUTES.CHAT);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
       <ChatHeader showBackButton />
       
       <main className="flex-1 w-full flex items-start justify-center p-4 py-10 overflow-y-auto relative">
         <ContentOverlay isActive={isSending} />
         <Card className="w-full max-w-md bg-card border-border/50 shadow-2xl shadow-black/20 dark:shadow-primary/20 transition-all duration-300">
             <CardHeader>
                 <CardTitle className="text-2xl app-title">Mensaje al DJ</CardTitle>
                 <CardDescription className="text-muted-foreground font-medium">
                     Pide tu saludo o tu rola favorita (Máximo 120 caracteres)
                 </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                 <textarea 
                     className="w-full h-32 bg-muted/50 border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none shadow-inner"
                     placeholder="Escribe aquí..."
                     maxLength={LIMITS.DM_DJ_MESSAGE}
                     value={message}
                     onChange={(e) => setMessage(e.target.value)}
                     enterKeyHint="send"
                     onFocus={(e) => {
                       setTimeout(() => {
                         e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                       }, 300);
                     }}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         e.currentTarget.blur();
                         handleSendClick();
                       }
                     }}
                 />
                 <div className="text-right text-xs font-bold text-muted-foreground/60 tracking-wider">
                     {message.length} / {LIMITS.DM_DJ_MESSAGE}
                 </div>
                 <SubmitButton
                     isFormValid={!!message.trim()}
                     isSubmitting={isSending}
                     label="Enviar mensaje"
                     loadingLabel="Enviando..."
                     icon={<Send className="mr-2 h-4 w-4" />}
                     onClick={handleSendClick}
                     type="button"
                 />
             </CardContent>
         </Card>

         <ConfirmModal
           isOpen={showConfirm}
           onConfirm={handleConfirmSend}
           onCancel={() => setShowConfirm(false)}
           title="Confirmar envío"
           message={`¿Enviar tu mensaje al DJ?\n\n"${message}"`}
           confirmText="Enviar"
           cancelText="Cancelar"
           isLoading={isSending}
         />

         <ConfirmModal
           isOpen={showSuccess}
           onConfirm={handleSuccessClose}
           onCancel={handleSuccessClose}
           mode="info"
           title="¡Mensaje enviado!"
           message="Tu mensaje fue enviado al DJ exitosamente."
           confirmText="Aceptar"
           icon={<div className="p-3 rounded-full bg-emerald-500/10"><CheckCircle2 className="w-8 h-8 text-emerald-400" /></div>}
         />
       </main>
    </div>
  );
}

export default function DmDjPage() {
  return (
    <AuthGuard>
      <DmDjPageContent />
    </AuthGuard>
  );
}
