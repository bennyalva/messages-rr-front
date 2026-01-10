'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApiUrl } from '@/lib/config/api';

function VotePageContent() {
  const API_URL = useApiUrl();
  const router = useRouter();
  const [songs, setSongs] = useState<any[]>([]);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const res = await fetch(`${API_URL}/songs`);
    if(res.ok) setSongs(await res.json());
  };

  const handleVote = async (id: string, currentVotes: number) => {
      await fetch(`${API_URL}/songs/${id}`, {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ votes: currentVotes + 1 })
      });
      alert(`¡Voto registrado! 💃`);
      fetchSongs();
  };

  return (
    <div className="min-h-screen bg-background p-4">
       <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Vota por la siguiente</h1>
        </div>

        <div className="grid gap-4">
            {songs.map(song => (
                <Card key={song.id} className="bg-black/80 border-secondary/50 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-secondary">{song.title}</CardTitle>
                        <CardDescription className="text-gray-400">{song.artist}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-2 text-right text-sm text-gray-500">{song.votes || 0} votos</div>
                        <Button className="w-full" variant="outline" onClick={() => handleVote(song.id, song.votes || 0)}>
                            ¡Esa mero! 💃
                        </Button>
                    </CardContent>
                </Card>
            ))}
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
