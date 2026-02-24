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
import ConfirmModal from '@/components/ui/ConfirmModal';

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
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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
    setIsResetting(true);
    try {
      // Delete all songs
      for (const song of songs) {
        await fetch(`${API_URL}/songs/${song.id}`, { method: 'DELETE' });
      }
      
      // Delete all user votes to allow voting again
      const userVotesRes = await fetch(`${API_URL}/userVotes`);
      if (userVotesRes.ok) {
        const userVotes = await userVotesRes.json();
        for (const vote of userVotes) {
          await fetch(`${API_URL}/userVotes/${vote.id}`, { method: 'DELETE' });
        }
      }
      
      fetchSongs();
    } finally {
      setIsResetting(false);
      setShowResetModal(false);
    }
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
              <CardHeader className="flex-shrink-0 border-b border-white/10">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10">
                    <Mail className="text-primary w-5 h-5"/>
                  </div>
                  <span>Mensajes Directos al DJ</span>
                  {directMessages.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {directMessages.length} {directMessages.length === 1 ? 'mensaje' : 'mensajes'}
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Peticiones y saludos de los bailadores.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto pt-4">
                {directMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="p-4 rounded-full bg-white/5 mb-4">
                      <Mail className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-500">No hay mensajes directos</p>
                    <p className="text-gray-600 text-sm">Los saludos de los bailadores aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {directMessages.map(dm => (
                      <div 
                        key={dm.id} 
                        className="group flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 transition-all duration-200"
                      >
                        {/* Avatar Initial */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {dm.userAlias?.charAt(0).toUpperCase() || '?'}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-sm text-primary">{dm.userAlias}</span>
                            {dm.userGang && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                                {dm.userGang}
                              </span>
                            )}
                            {!dm.userGang && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-600 italic">
                                Sin pandilla
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white/90 leading-relaxed">{dm.content}</p>
                        </div>
                        
                        {/* Delete Button */}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" 
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
              <CardHeader className="flex-shrink-0 border-b border-white/10">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-secondary/30 to-secondary/10">
                    <Music className="text-secondary w-5 h-5"/>
                  </div>
                  <span>Votaciones de Rolas</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Crea la lista de éxitos para que voten los bailadores.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto space-y-6 pt-6">
                 {/* Add Song Form */}
                 <div className={`p-4 rounded-xl border transition-all ${
                   songs.length >= 3 
                     ? 'bg-gray-800/30 border-gray-700/30 opacity-60' 
                     : 'bg-gradient-to-r from-secondary/10 to-transparent border-secondary/20'
                 }`}>
                    <h4 className="text-sm font-semibold text-secondary mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Disc className="w-4 h-4" /> Agregar Nueva Rola
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        songs.length >= 3 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-secondary/20 text-secondary'
                      }`}>
                        {songs.length}/3
                      </span>
                    </h4>
                    {songs.length >= 3 && (
                      <p className="text-xs text-gray-500 mb-3">Máximo 3 canciones permitidas. Reinicia para agregar más.</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="relative">
                          <Input 
                               placeholder="Nombre de la canción" 
                               value={newSongTitle}
                               onChange={(e) => setNewSongTitle(e.target.value)}
                               className="bg-black/50 border-white/20 focus:border-secondary pl-3"
                               disabled={songs.length >= 3}
                          />
                        </div>
                        <div className="relative">
                          <Input 
                               placeholder="Artista / Grupo" 
                               value={newSongArtist}
                               onChange={(e) => setNewSongArtist(e.target.value)}
                               className="bg-black/50 border-white/20 focus:border-secondary pl-3"
                               disabled={songs.length >= 3}
                          />
                        </div>
                        <Button 
                          onClick={handleAddSong}
                          className={`transition-all font-semibold ${
                            newSongTitle.trim() && newSongArtist.trim() && songs.length < 3
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25 border-0'
                              : 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
                          }`}
                          disabled={!newSongTitle.trim() || !newSongArtist.trim() || songs.length >= 3}
                        >
                          <Music className="w-4 h-4 mr-2" /> Agregar
                        </Button>
                    </div>
                 </div>
                 
                 {/* Active Votes Section */}
                 <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="text-white">🎵 Votaciones Activas</span>
                      </h3>
                      {songs.length > 0 && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm px-3 py-1 rounded-full bg-primary/20 text-primary font-semibold">
                            {songs.reduce((acc, song) => acc + (song.votes || 0), 0)} votos
                          </span>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => setShowResetModal(true)}
                            className="text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" /> Reiniciar
                        </Button>
                        </div>
                      )}
                    </div>
                    
                    {songs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 rounded-full bg-white/5 mb-4">
                          <Disc className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-500">No hay rolas en votación</p>
                        <p className="text-gray-600 text-sm">Agrega canciones arriba para empezar</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                          {songs
                            .sort((a, b) => b.votes - a.votes)
                            .map((song, i) => (
                              <div 
                                key={song.id} 
                                className={`
                                  group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200
                                  ${i === 0 && songs.length > 1 
                                    ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30 shadow-lg shadow-yellow-500/5' 
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                  }
                                `}
                              >
                                {/* Position Badge */}
                                <div className={`
                                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md
                                  ${i === 0 && songs.length > 1 
                                    ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 text-yellow-900 ring-2 ring-yellow-400/50' 
                                    : i === 1 
                                      ? 'bg-gradient-to-br from-slate-200 via-gray-300 to-slate-400 text-slate-700 ring-2 ring-slate-300/50'
                                      : i === 2 
                                        ? 'bg-gradient-to-br from-orange-400 via-amber-600 to-orange-700 text-orange-100 ring-2 ring-orange-500/50'
                                        : 'bg-white/10 text-gray-400'
                                  }
                                `}>
                                  {i + 1}
                                </div>
                                
                                {/* Song Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white truncate">{song.title}</p>
                                  <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                                </div>
                                
                                {/* Votes Badge */}
                                <div className={`
                                  px-3 py-1 rounded-full text-sm font-bold flex-shrink-0
                                  ${song.votes > 0 
                                    ? 'bg-gradient-to-r from-secondary/30 to-secondary/10 text-secondary' 
                                    : 'bg-white/5 text-gray-500'
                                  }
                                `}>
                                  {song.votes} {song.votes === 1 ? 'voto' : 'votos'}
                                </div>
                                
                                {/* Delete Button */}
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" 
                                  onClick={() => handleDeleteSong(song.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                          ))}
                      </div>
                    )}
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

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        onConfirm={handleResetVotes}
        onCancel={() => setShowResetModal(false)}
        title="Reiniciar Votaciones"
        message="¿Borrar TODAS las canciones y votos? Los usuarios podrán votar de nuevo."
        confirmText="Sí, reiniciar"
        cancelText="Cancelar"
        isLoading={isResetting}
      />
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
