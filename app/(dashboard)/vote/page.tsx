'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import ChatHeader from '@/components/chat/ChatHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Music, Disc, ThumbsUp, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import httpClient from '@/lib/services/httpClient';
import { useAppSelector } from '@/lib/store/hooks';
import { generateUUID } from '@/lib/utils/uuid';
import { cn } from '@/lib/utils';

interface Song {
  id: string;
  title: string;
  artist: string;
  votes: number;
}

function VotePageContent() {

  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);
  const [songs, setSongs] = useState<Song[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedSongId, setVotedSongId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    fetchSongs();
    if (user) {
      checkUserVote();
    }
  }, [user]);

  // Auto-hide banner after 5 seconds
  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  const fetchSongs = async () => {
    const { data } = await httpClient.get<Song[]>('/songs');
    setSongs(data);
  };

  const checkUserVote = async () => {
    if (!user) return;
    // Search by oderId (the field name used when storing)
    const { data: votes } = await httpClient.get('/userVotes', {
      params: { oderId: user.id },
    });
    if (votes.length > 0) {
      setHasVoted(true);
      setVotedSongId(votes[0].songId);
      // Don't show banner if already voted on page load
    }
  };

  const handleVote = async (songId: string, currentVotes: number) => {
    if (!user || hasVoted) return;
    
    setIsVoting(true);
    try {
      // Increment vote count
      await httpClient.patch(`/songs/${songId}`, { votes: currentVotes + 1 });
      
      // Record user vote
      await httpClient.post('/userVotes', {
        id: generateUUID(),
        oderId: user.id,
        songId: songId,
      });
      
      setHasVoted(true);
      setVotedSongId(songId);
      setShowBanner(true); // Show banner only after new vote
      fetchSongs();
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const sortedSongs = [...songs].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  return (
    <div className="w-full bg-background block min-h-[110vh]">
      <ChatHeader showBackButton />

      <div className="w-full p-4 lg:p-8 pb-20">
        {/* Section Title */}
        <div className="mb-8">
          <h1 className="text-2xl app-title">
            Vota por la siguiente
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Elige tu rola favorita para que suene</p>
        </div>

        {/* Vote Status Banner - Shows for 5 seconds after voting */}
        {showBanner && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/20">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-green-700 dark:text-green-400 font-bold">¡Voto registrado! </p>
                <p className="text-green-600/80 dark:text-green-300/70 text-sm font-medium">Tu voto se ha contado exitosamente</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 rounded-full bg-muted mb-6">
              <Music className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">No hay rolas disponibles</h2>
            <p className="text-muted-foreground opacity-70">El DJ aún no ha agregado canciones para votar</p>
          </div>
        ) : (
          <div className="grid gap-4 max-w-2xl mx-auto">
            {sortedSongs.map((song, index) => {
              const isVotedSong = votedSongId === song.id;
              // Only show position highlighting if user has NOT voted yet
              const showPositionHighlight = !hasVoted && index === 0 && songs.length > 1 && song.votes > 0;
              
              return (
                <Card 
                  key={song.id} 
                  className={cn(
                    "transition-all duration-300 border shadow-xl shadow-black/10 dark:shadow-primary/15",
                    isVotedSong 
                      ? "bg-accent/10 border-primary/60 ring-1 ring-primary/20" 
                      : showPositionHighlight
                        ? "bg-accent/5 border-yellow-500/40"
                        : "bg-card border-border/80 hover:border-primary/40"
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* Position Badge - Always show position colors */}
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm",
                          index === 0 && songs.length > 1 && song.votes > 0
                            ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 text-yellow-900' 
                            : index === 1 && song.votes > 0
                              ? 'bg-gradient-to-br from-slate-100 via-gray-300 to-slate-400 text-slate-700'
                              : index === 2 && song.votes > 0
                                ? 'bg-gradient-to-br from-orange-400 via-amber-600 to-orange-700 text-orange-100'
                                : 'bg-muted text-muted-foreground border border-border'
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-foreground font-bold">{song.title}</CardTitle>
                          <CardDescription className="text-muted-foreground font-medium">{song.artist}</CardDescription>
                        </div>
                      </div>
                      
                      {/* Votes Badge - Bright when not voted, subtle when voted */}
                      <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        isVotedSong
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : (song.votes || 0) > 0 
                            ? 'bg-muted text-foreground border border-border'
                            : 'bg-muted/50 text-muted-foreground italic'
                      )}>
                        {song.votes || 0} {song.votes === 1 ? 'voto' : 'votos'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {isVotedSong ? (
                      <div className="flex items-center justify-center gap-2 py-2 text-primary animate-in zoom-in-95 duration-300">
                        <Check className="w-5 h-5 stroke-[3px]" />
                        <span className="font-bold uppercase tracking-wider text-xs">Votaste por esta rola</span>
                      </div>
                    ) : (
                      <Button 
                        variant={hasVoted ? "ghost" : "outline"}
                        className={cn(
                            "w-full transition-all font-bold uppercase tracking-widest text-xs h-10 shadow-sm",
                            !hasVoted 
                                ? "bg-accent/10 hover:bg-primary hover:text-primary-foreground border-primary/20" 
                                : "opacity-40 cursor-not-allowed border-none bg-muted"
                        )}
                        onClick={() => handleVote(song.id, song.votes || 0)}
                        disabled={hasVoted || isVoting}
                      >
                        {isVoting ? (
                          'Votando...'
                        ) : hasVoted ? (
                          'Ya votaste'
                        ) : (
                          <>
                            <ThumbsUp className="w-3.5 h-3.5 mr-2" /> ¡Esta mero!
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VotePage() {
  return (
    <AuthGuard>
      <VotePageContent />
    </AuthGuard>
  );
}
