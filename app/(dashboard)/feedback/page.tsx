'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import ChatHeader from '@/components/chat/ChatHeader';
import { PageHeader } from '@/components/ui/page-header';
import { EmojiRating } from '@/components/ui/emoji-rating';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Send, MessageSquareHeart } from 'lucide-react';
import { useState }  from 'react';
import { cn } from '@/lib/utils';

interface FeedbackData {
  ambiente: number | null;
  experiencia: number | null;
  mejora: number | null;
  comentario: string;
}

const QUESTIONS = [
  { key: 'ambiente' as const, question: '¿Qué tal el ambiente sonidero?' },
  { key: 'experiencia' as const, question: '¿Te gusta esta nueva experiencia sonidera?' },
  { key: 'mejora' as const, question: '¿Nos ayudarías a seguir mejorando?' },
];

function FeedbackPageContent() {
  const [feedback, setFeedback] = useState<FeedbackData>({
    ambiente: null,
    experiencia: null,
    mejora: null,
    comentario: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isFormValid =
    feedback.ambiente !== null &&
    feedback.experiencia !== null &&
    feedback.mejora !== null;

  const handleRatingChange = (key: keyof FeedbackData, value: number) => {
    setFeedback((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);

    // TODO: Replace with API call
    console.log('📝 Feedback enviado:', {
      ambiente: feedback.ambiente,
      experiencia: feedback.experiencia,
      mejora: feedback.mejora,
      comentario: feedback.comentario.trim(),
    });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <ChatHeader showBackButton />
        <main className="flex-1 w-full p-4 lg:p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="p-6 rounded-full bg-primary/10 mb-6 animate-[bounce_1s_ease-out]">
            <MessageSquareHeart className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">¡Gracias por tu opinión!</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Tu retroalimentación nos ayuda a mejorar cada evento. ¡Nos vemos en la pista!
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader showBackButton />

      <main className="flex-1 w-full p-4 lg:p-8 pb-20">
        <PageHeader
          title="¡Tu opinión cuenta!"
          subtitle="Queremos escucharte: cuéntanos un poco más, en qué fallamos y cómo podemos mejorar para ti."
        />

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Emoji Rating Questions */}
          <Card className="bg-card border-border/50 shadow-2xl shadow-black/20 dark:shadow-primary/20">
            <CardContent className="pt-6 space-y-8">
              {QUESTIONS.map((q, index) => (
                <div key={q.key}>
                  <EmojiRating
                    question={q.question}
                    value={feedback[q.key] as number | null}
                    onChange={(val) => handleRatingChange(q.key, val)}
                  />
                  {index < QUESTIONS.length - 1 && (
                    <div className="border-b border-border/30 mt-6" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Text Feedback Section */}
          <Card className="bg-card border-border/50 shadow-2xl shadow-black/20 dark:shadow-primary/20">
            <CardContent className="pt-6 space-y-3">
              <p className="text-foreground font-semibold text-[15px]">¡Queremos leerte!</p>
              <Textarea
                placeholder="Cuéntanos un poco y dinos si tienes alguna sugerencia, opinion o  queja..."
                maxLength={150}
                value={feedback.comentario}
                onChange={(e) =>
                  setFeedback((prev) => ({ ...prev, comentario: e.target.value }))
                }
                enterKeyHint="done"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                className="resize-none min-h-[100px] bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
              />
              <div className="flex justify-end">
                <span
                  className={cn(
                    'text-xs font-medium tabular-nums transition-colors',
                    feedback.comentario.length >= 140
                      ? 'text-destructive'
                      : feedback.comentario.length >= 100
                        ? 'text-yellow-500'
                        : 'text-muted-foreground'
                  )}
                >
                  {feedback.comentario.length}/150
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <SubmitButton
            isFormValid={isFormValid}
            isSubmitting={isSubmitting}
            label="Compartir opinión"
            loadingLabel="Enviando..."
            icon={<Send className="mr-2 h-4 w-4" />}
          />
        </form>
      </main>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <AuthGuard>
      <FeedbackPageContent />
    </AuthGuard>
  );
}
