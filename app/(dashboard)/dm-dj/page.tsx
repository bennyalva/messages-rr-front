'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/ui/submit-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { useApiUrl } from '@/lib/config/api';
import { generateUUID } from '@/lib/utils/uuid';
import ConfirmModal from '@/components/ui/ConfirmModal';

function DmDjPageContent() {
  const API_URL = useApiUrl();
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSendClick = () => {
    if (!message.trim() || !user) return;
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    if (!message.trim() || !user) return;
    
    setIsSending(true);
    try {
        await fetch(`${API_URL}/directMessages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: generateUUID(),
                userId: user.id,
                userAlias: user.alias,
                userGang: user.gang || '',
                content: message.trim(),
                timestamp: new Date().toISOString(),
                isRead: false
            })
        });
        setShowConfirm(false);
        setMessage('');
        router.back();
    } catch (error) {
        alert("Error al enviar mensaje");
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
       <Card className="w-full max-w-md bg-black/90 text-white border-primary">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <CardTitle className="text-2xl app-title">Mensaje al DJ</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                    Pide tu saludo o tu rola favorita (Máximo 120 caracteres)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <textarea 
                    className="w-full h-32 bg-gray-900 border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Escribe aquí..."
                    maxLength={120}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <div className="text-right text-xs text-gray-500">
                    {message.length}/120
                </div>
                <SubmitButton
                    isFormValid={!!message.trim()}
                    isSubmitting={isSending}
                    label="Enviar"
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
