'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAppSelector } from '@/lib/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Music, Palette, Trash2, Edit, X } from 'lucide-react';
import { useApiUrl } from '@/lib/config/api';
import { generateUUID } from '@/lib/utils/uuid';
import ChatHeader from '@/components/chat/ChatHeader';

function DashboardPageContent() {
  const API_URL = useApiUrl();
  const { user } = useAppSelector(state => state.auth);
  const [users, setUsers] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchSongs();
  }, []);

  const fetchUsers = async () => {
      const res = await fetch(`${API_URL}/users`);
      if (res.ok) setUsers(await res.json());
  };

  const fetchSongs = async () => {
      const res = await fetch(`${API_URL}/songs`);
      if (res.ok) setSongs(await res.json());
  };

  const handleDeleteUser = async (id: string) => {
      if (!confirm("¿Eliminar usuario Permanentemente?")) return;
      await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
      fetchUsers();
  };

  const handleAddSong = async () => {
      if (!newSongTitle || !newSongArtist) return;
      await fetch(`${API_URL}/songs`, { 
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: generateUUID(),
                title: newSongTitle,
                artist: newSongArtist,
                votes: 0
            })
      });
      setNewSongTitle('');
      setNewSongArtist('');
      fetchSongs();
  };

  const handleDeleteSong = async (id: string) => {
       await fetch(`${API_URL}/songs/${id}`, { method: 'DELETE' });
       fetchSongs();
  };

  const handleResetVotes = async () => {
      if(!confirm("¿Borrar TODAS las canciones y votos?")) return;
      for (const song of songs) {
          await fetch(`${API_URL}/songs/${song.id}`, { method: 'DELETE' });
      }
      fetchSongs();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <ChatHeader variant="admin" />
      
      <div className="p-4 lg:p-10">

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px] mb-8 bg-black/50 border border-primary/20">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="songs">Canciones</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card className="bg-black/50 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {users.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-2 border border-white/10 rounded bg-card/50">
                          <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                                   <img src={u.avatar} alt="av" className="w-full h-full object-cover" />
                               </div>
                               <div>
                                   <p className="font-bold text-sm">{u.alias}</p>
                                   <p className="text-xs text-muted-foreground">{u.role} | {u.gang || 'Sin pandilla'}</p>
                               </div>
                          </div>
                          <div className="flex gap-2">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400"><Edit className="w-4 h-4" /></Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteUser(u.id)}>
                                  <Trash2 className="w-4 h-4" />
                              </Button>
                          </div>
                      </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="songs">
          <Card className="bg-black/50 border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Music className="text-secondary"/> Votaciones</CardTitle>
              <CardDescription>Crea la lista de éxitos para que voten los bailadores.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                   <Input 
                        placeholder="Nombre de la canción" 
                        value={newSongTitle}
                        onChange={(e) => setNewSongTitle(e.target.value)}
                   />
                   <Input 
                        placeholder="Artista / Grupo" 
                        value={newSongArtist}
                        onChange={(e) => setNewSongArtist(e.target.value)}
                   />
                   <Button variant="outline" onClick={handleAddSong}>Agregar a Votación</Button>
               </div>
               
               <div className="mt-4">
                   <h3 className="font-bold mb-2 flex items-center justify-between">
                       Votaciones Activas 
                       <Button size="sm" variant="destructive" onClick={handleResetVotes}>Reiniciar Votaciones</Button>
                   </h3>
                   <div className="space-y-2">
                       {songs.map((song, i) => (
                           <div key={song.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                               <span>{i+1}. {song.title} - <em className="text-gray-400">{song.artist}</em></span>
                               <span className="font-bold text-secondary">{song.votes} votos</span>
                               <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={() => handleDeleteSong(song.id)}>
                                   <X className="w-4 h-4" />
                               </Button>
                           </div>
                       ))}
                   </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card className="bg-black/50 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="text-white"/> Apariencia Global</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <p className="text-sm text-gray-400">Esta configuración afectará a la aplicación tras recargar.</p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Color Primario (Neon Pink)</Label>
                        <Input type="color" defaultValue="#ff00ff" />
                    </div>
                     <div className="space-y-2">
                        <Label>Color Secundario (Cyan)</Label>
                        <Input type="color" defaultValue="#00ffff" />
                    </div>
                </div>
                <Button className="w-full">Guardar Configuración Global</Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard allowedRoles={['admin', 'owner']}>
      <DashboardPageContent />
    </AuthGuard>
  );
}
