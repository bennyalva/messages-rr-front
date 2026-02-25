'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Music, Disc, ThumbsUp, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApiUrl } from '@/lib/config/api';
import { useAppSelector } from '@/lib/store/hooks';
import { generateUUID } from '@/lib/utils/uuid';

interface Song {
  id: string;
  title: string;
  artist: string;
  votes: number;
}

function VotePageContent() {
  const API_URL = useApiUrl();
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
    const res = await fetch(`${API_URL}/songs`);
    if(res.ok) setSongs(await res.json());
  };

  const checkUserVote = async () => {
    if (!user) return;
    // Search by oderId (the field name used when storing)
    const res = await fetch(`${API_URL}/userVotes?oderId=${user.id}`);
    if (res.ok) {
      const votes = await res.json();
      if (votes.length > 0) {
        setHasVoted(true);
        setVotedSongId(votes[0].songId);
        // Don't show banner if already voted on page load
      }
    }
  };

  const handleVote = async (songId: string, currentVotes: number) => {
    if (!user || hasVoted) return;
    
    setIsVoting(true);
    try {
      // Increment vote count
      await fetch(`${API_URL}/songs/${songId}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ votes: currentVotes + 1 })
      });
      
      // Record user vote - Fixed: use userId consistently
      await fetch(`${API_URL}/userVotes`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          id: generateUUID(),
          oderId: user.id,
          songId: songId
        })
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
    <div className="min-h-screen bg-background p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
        <div>
          <h1 className="text-2xl app-title">
            Vota por la siguiente
          </h1>
          <p className="text-gray-400 text-sm">Elige tu rola favorita para que suene</p>
        </div>
      </div>

      {/* Vote Status Banner - Shows for 5 seconds after voting */}
      {showBanner && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-600/10 border border-green-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/20">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-green-400 font-semibold">¡Voto registrado! </p>
              <p className="text-green-300/70 text-sm">Tu voto se ha contado exitosamente</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-6 rounded-full bg-white/5 mb-6">
            <Music className="w-12 h-12 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No hay rolas disponibles</h2>
          <p className="text-gray-600">El DJ aún no ha agregado canciones para votar</p>
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
                className={`
                  transition-all duration-300 border
                  ${isVotedSong 
                    ? 'bg-gradient-to-r from-primary/20 to-transparent border-primary/50 shadow-lg shadow-primary/20' 
                    : showPositionHighlight
                      ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30'
                      : 'bg-black/60 border-white/10 hover:border-white/20'
                  }
                `}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Position Badge - Always show position colors */}
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                        ${index === 0 && songs.length > 1 && song.votes > 0
                          ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 text-yellow-900' 
                          : index === 1 && song.votes > 0
                            ? 'bg-gradient-to-br from-slate-200 via-gray-300 to-slate-400 text-slate-700'
                            : index === 2 && song.votes > 0
                              ? 'bg-gradient-to-br from-orange-400 via-amber-600 to-orange-700 text-orange-100'
                              : 'bg-white/10 text-gray-400'
                        }
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">{song.title}</CardTitle>
                        <CardDescription className="text-gray-400">{song.artist}</CardDescription>
                      </div>
                    </div>
                    
                    {/* Votes Badge - Bright when not voted, subtle when voted */}
                    <div className={`
                      px-3 py-1 rounded-full text-sm font-bold
                      ${isVotedSong
                        ? 'bg-primary/50 text-white shadow-sm shadow-primary/30'
                        : hasVoted
                          ? (song.votes || 0) > 0 
                            ? 'bg-white/15 text-gray-300'
                            : 'bg-white/10 text-gray-400'
                          : (song.votes || 0) > 0 
                            ? 'bg-secondary/50 text-white shadow-sm shadow-secondary/30' 
                            : 'bg-white/20 text-gray-300'
                      }
                    `}>
                      {song.votes || 0} {song.votes === 1 ? 'voto' : 'votos'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {isVotedSong ? (
                    <div className="flex items-center justify-center gap-2 py-2 text-primary">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold">Votaste por esta rola</span>
                    </div>
                  ) : (
                    <Button 
                      className={`w-full transition-all font-semibold ${
                        hasVoted 
                          ? 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
                          : 'bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20'
                      }`}
                      onClick={() => handleVote(song.id, song.votes || 0)}
                      disabled={hasVoted || isVoting}
                    >
                      {isVoting ? (
                        'Votando...'
                      ) : hasVoted ? (
                        'Ya votaste'
                      ) : (
                        <>
                          <ThumbsUp className="w-4 h-4 mr-2" /> ¡Esta mero!
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
  );
}

export default function VotePage() {
  return (
    <AuthGuard>
      <VotePageContent />
    </AuthGuard>
  );
}
