'use client';

import { useState, useEffect, useRef } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAppSelector } from '@/lib/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Music, Palette, Trash2, Edit, X, Disc, MessageSquare, Settings, Mail } from 'lucide-react';
import { useApiUrl } from '@/lib/config/api';
import { generateUUID } from '@/lib/utils/uuid';
import ChatHeader from '@/components/chat/ChatHeader';

interface DirectMessage {
  id: string;
  userId: string;
  userAlias: string;
  userGang: string;
  content: string;
  timestamp: string;
}

interface Message {
  id: string;
  userId: string;
  userAlias: string;
  userAvatar: string;
  userGang: string;
  content: string;
  timestamp: string;
  image?: string;
}

function DashboardPageContent() {
  const API_URL = useApiUrl();
  const { user } = useAppSelector(state => state.auth);
  const [users, setUsers] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsers();
    fetchSongs();
    fetchMessages();
    fetchDirectMessages();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/users`);
    if (res.ok) setUsers(await res.json());
  };

  const fetchSongs = async () => {
    const res = await fetch(`${API_URL}/songs`);
    if (res.ok) setSongs(await res.json());
  };

  const fetchMessages = async () => {
    const res = await fetch(`${API_URL}/messages`);
    if (res.ok) setMessages(await res.json());
  };

  const fetchDirectMessages = async () => {
    const res = await fetch(`${API_URL}/directMessages`);
    if (res.ok) setDirectMessages(await res.json());
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Eliminar usuario permanentemente?")) return;
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

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("¿Eliminar este mensaje?")) return;
    await fetch(`${API_URL}/messages/${id}`, { method: 'DELETE' });
    fetchMessages();
  };

  const handleDeleteDirectMessage = async (id: string) => {
    await fetch(`${API_URL}/directMessages/${id}`, { method: 'DELETE' });
    fetchDirectMessages();
  };

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <ChatHeader variant="admin" />
      
      {/* Content area - takes remaining height */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 lg:px-10 lg:py-6">
        <Tabs defaultValue="dm" className="flex-1 flex flex-col overflow-hidden">
          {/* Tab List */}
          <TabsList className="grid w-full grid-cols-5 lg:w-[800px] mb-4 bg-black/50 border border-white/20 flex-shrink-0">
            <TabsTrigger value="dm" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              DM <Mail className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="rolas" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Rolas <Disc className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Chat <MessageSquare className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Usuarios <Users className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Config <Settings className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          {/* Tab Content - DM (new) */}
          <TabsContent value="dm" className="flex-1 overflow-hidden mt-0">
            <Card className="h-full flex flex-col bg-black/50 border-white/20">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2"><Mail className="text-primary"/> Mensajes Directos al DJ</CardTitle>
                <CardDescription>Peticiones y mensajes de los bailadores.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                {directMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No hay mensajes directos.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {directMessages.map(dm => (
                      <div key={dm.id} className="flex items-center justify-between p-3 border border-white/10 rounded bg-card/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-primary">{dm.userAlias}</span>
                            <span className="text-xs text-muted-foreground">| {dm.userGang || 'Sin pandilla'}</span>
                          </div>
                          <p className="text-sm text-white/90">{dm.content}</p>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-destructive flex-shrink-0 ml-2" 
                          onClick={() => handleDeleteDirectMessage(dm.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab Content - Rolas */}
          <TabsContent value="rolas" className="flex-1 overflow-hidden mt-0">
            <Card className="h-full flex flex-col bg-black/50 border-white/20">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2"><Music className="text-secondary"/> Votaciones</CardTitle>
                <CardDescription>Crea la lista de éxitos para que voten los bailadores.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto space-y-4">
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

          {/* Tab Content - Chat */}
          <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
            <Card className="h-full flex flex-col bg-black/50 border-white/20">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2"><MessageSquare className="text-primary"/> Gestión del Chat</CardTitle>
                <CardDescription>Administra y modera los mensajes del chat público.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No hay mensajes en el chat.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map(msg => (
                      <div key={msg.id} className="flex items-start gap-3 p-3 border border-white/10 rounded bg-card/50">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                          <img src={msg.userAvatar} alt="av" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-primary">{msg.userAlias}</span>
                            <span className="text-xs text-muted-foreground">| {msg.userGang || 'Sin pandilla'}</span>
                          </div>
                          <p className="text-sm text-white/90 break-words">{msg.content}</p>
                          {msg.image && (
                            <img src={msg.image} alt="attached" className="mt-2 max-w-[200px] rounded" />
                          )}
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-destructive flex-shrink-0" 
                          onClick={() => handleDeleteMessage(msg.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Content - Users */}
          <TabsContent value="users" className="flex-1 overflow-hidden mt-0">
            <Card className="h-full flex flex-col bg-black/50 border-white/20">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Gestión de Usuarios</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <div className="space-y-2">
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

          {/* Tab Content - Config */}
          <TabsContent value="config" className="flex-1 overflow-hidden mt-0">
            <Card className="h-full flex flex-col bg-black/50 border-white/20">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2"><Palette className="text-white"/> Apariencia Global</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto space-y-4">
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
