'use client';

import { useState, useEffect, useRef } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Music, Palette, Trash2, Edit, X, Disc, MessageSquare, Settings, Mail, Sun, Moon, Info, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import httpClient from '@/lib/services/httpClient';
import { generateUUID } from '@/lib/utils/uuid';
import { cn } from '@/lib/utils';
import ChatHeader from '@/components/chat/ChatHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { setThemeConfig, ThemeConfig, setTheme } from '@/lib/store/features/themeSlice';
import { ENDPOINTS, STORAGE_KEYS } from '@/lib/constants';
import { ADMIN_TABS_CONTENT } from './constants';

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

const MAX_SONGS_ALLOWED = 5;

const NotificationBadge = ({ 
  count, 
  variant = 'primary',
  className = ''
}: { 
  count: number, 
  variant?: 'primary' | 'secondary',
  className?: string 
}) => {
  if (count <= 0) return null;
  
  const variants = {
    primary: "bg-primary/20 text-primary",
    secondary: "bg-secondary/20 text-secondary"
  };

  return (
    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full font-bold text-sm leading-none min-w-[1.25rem] ${variants[variant]} ${className}`}>
      {count}
    </span>
  );
};

const TabHeaderWithInfo = ({ 
  icon: Icon, 
  title, 
  description, 
  actionSlot, 
  titleBadge 
}: { 
  icon: any, 
  title: string, 
  description?: string, 
  actionSlot?: React.ReactNode, 
  titleBadge?: React.ReactNode 
}) => {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <CardHeader className="flex-shrink-0 border-b border-border/50 bg-card/10 py-3 px-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Icon className="text-foreground w-5 h-5 flex-shrink-0 mr-1" />
            <div className="flex items-start">
              <CardTitle className="text-xl m-0">{title}</CardTitle>
              {description && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowInfo(!showInfo)}
                  className={`h-5 w-5 rounded-full transition-colors cursor-pointer ml-0.5 -mt-1 hover:bg-transparent ${showInfo ? 'text-primary' : 'text-muted-foreground/70 hover:text-foreground'}`}
                  title={showInfo ? "Ocultar información" : "Mostrar información"}
                >
                  <Info className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
            {titleBadge}
          </div>
          <div className="flex items-center gap-2">
            {actionSlot}
          </div>
        </div>
        
        {description && (
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 bg-card/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] border border-border/40 text-sm text-muted-foreground rounded-lg flex items-start gap-3">
                   <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                   <p className="leading-relaxed">{description}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </CardHeader>
  );
};

function DashboardPageContent() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { activeTheme } = useAppSelector(state => state.theme);
  const [users, setUsers] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Theme Config state
  const [fullConfig, setFullConfig] = useState<any>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchSongs();
    fetchMessages();
    fetchDirectMessages();
    fetchConfig();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConfig = async () => {
    const { data } = await httpClient.get(ENDPOINTS.CONFIG);
    setFullConfig(data);
  };

  const handleSaveConfig = async () => {
    if (!fullConfig) return;
    setIsSavingConfig(true);
    try {
      await httpClient.patch(ENDPOINTS.CONFIG, fullConfig);
      // Update global store
      if (fullConfig.themes) {
        dispatch(setThemeConfig(fullConfig.themes));
      }
      alert("Configuración guardada exitosamente");
    } catch (err) {
      alert("Error al guardar configuración");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const updateThemeColor = (theme: 'dark' | 'standard', key: string, value: string) => {
    if (!fullConfig) return;
    setFullConfig({
      ...fullConfig,
      themes: {
        ...fullConfig.themes,
        [theme]: {
          ...fullConfig.themes[theme],
          [key]: value
        }
      }
    });
  };

  const fetchUsers = async () => {
    const { data } = await httpClient.get(ENDPOINTS.USERS);
    setUsers(data);
  };

  const fetchSongs = async () => {
    const { data } = await httpClient.get(ENDPOINTS.SONGS);
    setSongs(data);
  };

  const fetchMessages = async () => {
    const { data } = await httpClient.get(ENDPOINTS.MESSAGES);
    setMessages(data);
  };

  const fetchDirectMessages = async () => {
    const { data } = await httpClient.get(ENDPOINTS.DIRECT_MESSAGES);
    setDirectMessages(data);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Eliminar usuario permanentemente?")) return;
    await httpClient.delete(`${ENDPOINTS.USERS}/${id}`);
    fetchUsers();
  };

  const handleAddSong = async () => {
    if (!newSongTitle || !newSongArtist) return;
    await httpClient.post(ENDPOINTS.SONGS, {
      id: generateUUID(),
      title: newSongTitle,
      artist: newSongArtist,
      votes: 0,
    });
    setNewSongTitle('');
    setNewSongArtist('');
    fetchSongs();
  };

  const handleDeleteSong = async (id: string) => {
    await httpClient.delete(`${ENDPOINTS.SONGS}/${id}`);
    fetchSongs();
  };

  const handleResetVotes = async () => {
    setIsResetting(true);
    try {
      // Delete all songs
      for (const song of songs) {
        await httpClient.delete(`${ENDPOINTS.SONGS}/${song.id}`);
      }
      
      // Delete all user votes to allow voting again
      const { data: userVotes } = await httpClient.get(ENDPOINTS.USER_VOTES);
      for (const vote of userVotes) {
        await httpClient.delete(`${ENDPOINTS.USER_VOTES}/${vote.id}`);
      }
      
      fetchSongs();
    } finally {
      setIsResetting(false);
      setShowResetModal(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("¿Eliminar este mensaje?")) return;
    await httpClient.delete(`${ENDPOINTS.MESSAGES}/${id}`);
    fetchMessages();
  };

  const handleDeleteDirectMessage = async (id: string) => {
    await httpClient.delete(`${ENDPOINTS.DIRECT_MESSAGES}/${id}`);
    fetchDirectMessages();
  };

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <ChatHeader variant="admin" />
      
      {/* Content area - takes remaining height - aligned exactly with header (m-4) */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <Tabs defaultValue="dm" className="flex-1 flex flex-col overflow-hidden">
          {/* Tab List */}
          <TabsList className="grid w-full grid-cols-5 mb-4 bg-muted/50 border border-border flex-shrink-0">
            <TabsTrigger value="dm" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary cursor-pointer">
              DM <Mail className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="rolas" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary cursor-pointer">
              Rolas <Disc className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary cursor-pointer">
              Chat <MessageSquare className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary cursor-pointer">
              Usuarios <Users className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary cursor-pointer">
              Config <Settings className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          {/* Tab Content - DM (new) */}
          <TabsContent value="dm" className="flex-1 overflow-hidden mt-0">
            <Card className="h-full flex flex-col bg-card/50 border-border">
              <TabHeaderWithInfo 
                icon={Mail}
                title={ADMIN_TABS_CONTENT.DM.title}
                description={ADMIN_TABS_CONTENT.DM.description}
                titleBadge={
                  <NotificationBadge count={directMessages.length} />
                }
              />
              <CardContent className="flex-1 overflow-auto pt-4 themed-scrollbar">
                {directMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="p-4 rounded-full bg-muted mb-4">
                      <Mail className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No hay mensajes directos</p>
                    <p className="text-muted-foreground/60 text-sm">Los saludos de los bailadores aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max p-1">
                    <AnimatePresence mode="popLayout">
                      {directMessages.map((dm, index) => {
                        const isFirst = index === 0;
                        const isRecent = index > 0 && index < 3;
                        
                        return (
                          <motion.div 
                            key={dm.id} 
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className={cn(
                              "group relative flex flex-col p-5 rounded-2xl border transition-all duration-500",
                              isFirst 
                                ? "bg-gradient-to-br from-primary/10 via-background to-background border-primary shadow-[0_4px_20px_-4px_rgba(var(--primary),0.3)] md:col-span-2 xl:col-span-2 ring-1 ring-primary/20 z-10" 
                                : isRecent
                                  ? "bg-card border-border/80 opacity-[0.98] z-[9]"
                                  : "bg-muted/20 border-border/40 opacity-70 scale-[0.98] grayscale-[0.2] z-[8] hover:opacity-100 hover:grayscale-0 hover:scale-[0.99]"
                            )}
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                  <div className={cn(
                                      "rounded-full flex items-center justify-center font-bold flex-shrink-0 transition-all duration-500",
                                      isFirst ? "w-12 h-12 bg-primary text-primary-foreground shadow-inner text-xl" : "w-10 h-10 bg-primary/20 text-primary text-sm"
                                  )}>
                                    {dm.userAlias?.charAt(0).toUpperCase() || '?'}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className={cn(
                                        "font-bold transition-all duration-500", 
                                        isFirst ? "text-lg text-primary" : "text-sm text-foreground"
                                    )}>
                                      {dm.userAlias}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {dm.userGang ? (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground/80 font-medium transition-colors">
                                          {dm.userGang}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground/50 italic opacity-80">
                                          Sin pandilla
                                        </span>
                                      )}
                                    </div>
                                  </div>
                              </div>
                              
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-all flex-shrink-0 cursor-pointer rounded-full" 
                                onClick={() => handleDeleteDirectMessage(dm.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1">
                              <p className={cn(
                                  "leading-relaxed break-words transition-all duration-500",
                                  isFirst ? "text-xl text-foreground font-medium leading-normal" : "text-sm text-foreground/80 line-clamp-4"
                              )}>
                                {dm.content}
                              </p>
                            </div>
                            
                            {/* Footer only for the first priority message */}
                            {isFirst && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-4 pt-3 border-t border-border/50 flex justify-end"
                              >
                                <div className="bg-primary/10 p-1.5 rounded-full ring-1 ring-primary/20">
                                  <Mic className="w-3.5 h-3.5 text-primary animate-[pulse_1.5s_ease-in-out_infinite]" />
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab Content - Rolas */}
          <TabsContent value="rolas" className="flex-1 overflow-hidden mt-0">
            <Card className="h-full flex flex-col bg-card/50 border-border">
              <TabHeaderWithInfo 
                icon={Music}
                title={ADMIN_TABS_CONTENT.ROLAS.title}
                description={ADMIN_TABS_CONTENT.ROLAS.description}
              />
              <CardContent className="flex-1 overflow-auto space-y-6 pt-6 themed-scrollbar">
                 {/* Add Song Form */}
                 <div className={`p-4 rounded-xl border transition-all ${
                   songs.length >= MAX_SONGS_ALLOWED 
                     ? 'bg-muted/30 border-border/30 opacity-60' 
                     : 'bg-gradient-to-r from-secondary/10 to-transparent border-secondary/20'
                 }`}>
                    <h4 className="text-sm font-semibold text-secondary mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Disc className="w-4 h-4" /> Agregar Nueva Rola
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        songs.length >= MAX_SONGS_ALLOWED 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-secondary/20 text-secondary'
                      }`}>
                        {songs.length}/{MAX_SONGS_ALLOWED}
                      </span>
                    </h4>
                    {songs.length >= MAX_SONGS_ALLOWED && (
                      <p className="text-xs text-muted-foreground mb-3">Máximo {MAX_SONGS_ALLOWED} canciones permitidas. Reinicia para agregar más.</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="relative">
                          <Input 
                               placeholder="Nombre de la canción" 
                               value={newSongTitle}
                               onChange={(e) => setNewSongTitle(e.target.value)}
                               className="bg-muted border-border focus:border-secondary pl-3"
                               disabled={songs.length >= MAX_SONGS_ALLOWED}
                          />
                        </div>
                        <div className="relative">
                          <Input 
                               placeholder="Artista / Grupo" 
                               value={newSongArtist}
                               onChange={(e) => setNewSongArtist(e.target.value)}
                               className="bg-muted border-border focus:border-secondary pl-3"
                               disabled={songs.length >= MAX_SONGS_ALLOWED}
                          />
                        </div>
                        <Button 
                          onClick={handleAddSong}
                          className={`transition-all font-semibold ${
                            newSongTitle.trim() && newSongArtist.trim() && songs.length < MAX_SONGS_ALLOWED
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25 border-0 cursor-pointer'
                              : 'bg-muted text-muted-foreground border border-border cursor-not-allowed'
                          }`}
                          disabled={!newSongTitle.trim() || !newSongArtist.trim() || songs.length >= MAX_SONGS_ALLOWED}
                        >
                          <Music className="w-4 h-4 mr-2" /> Agregar
                        </Button>
                    </div>
                 </div>
                 
                 {/* Active Votes Section */}
                 <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="text-foreground">🎵 Votaciones Activas</span>
                      </h3>
                      {songs.length > 0 && (
                        <div className="flex items-center gap-3">
                          <NotificationBadge 
                            count={songs.reduce((acc, song) => acc + (song.votes || 0), 0)} 
                            className="px-3 py-1"
                          />
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => setShowResetModal(true)}
                            className="text-xs cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 mr-1" /> Reiniciar
                        </Button>
                        </div>
                      )}
                    </div>
                    
                    {songs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 rounded-full bg-muted mb-4">
                          <Disc className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No hay rolas en votación</p>
                        <p className="text-muted-foreground/60 text-sm">Agrega canciones arriba para empezar</p>
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
                                    : 'bg-muted/50 border-border hover:bg-muted'
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
                                        : 'bg-muted text-muted-foreground'
                                  }
                                `}>
                                  {i + 1}
                                </div>
                                
                                {/* Song Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground truncate">{song.title}</p>
                                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                                </div>
                                
                                {/* Votes Badge */}
                                <div className={`
                                  px-3 py-1 rounded-full text-sm font-bold flex-shrink-0
                                  ${song.votes > 0 
                                    ? 'bg-gradient-to-r from-secondary/30 to-secondary/10 text-secondary' 
                                    : 'bg-muted text-muted-foreground'
                                  }
                                `}>
                                  {song.votes} {song.votes === 1 ? 'voto' : 'votos'}
                                </div>
                                
                                {/* Delete Button */}
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer" 
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
            <Card className="h-full flex flex-col bg-card/50 border-border">
              <TabHeaderWithInfo 
                icon={MessageSquare}
                title={ADMIN_TABS_CONTENT.CHAT.title}
                description={ADMIN_TABS_CONTENT.CHAT.description}
              />
              <CardContent className="flex-1 overflow-auto themed-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No hay mensajes en el chat.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map(msg => (
                      <div key={msg.id} className="flex items-start gap-3 p-3 border border-border rounded bg-card/50">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          <img src={msg.userAvatar} alt="av" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-primary">{msg.userAlias}</span>
                            <span className="text-xs text-muted-foreground">| {msg.userGang || 'Sin pandilla'}</span>
                          </div>
                          <p className="text-sm text-foreground/90 break-words">{msg.content}</p>
                          {msg.image && (
                            <img src={msg.image} alt="attached" className="mt-2 max-w-[200px] rounded" />
                          )}
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-destructive flex-shrink-0 cursor-pointer" 
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
            <Card className="h-full flex flex-col bg-card/50 border-border">
              <TabHeaderWithInfo 
                icon={Users}
                title={ADMIN_TABS_CONTENT.USERS.title}
                description={ADMIN_TABS_CONTENT.USERS.description}
              />
              <CardContent className="flex-1 overflow-auto themed-scrollbar">
                <div className="space-y-2">
                    {users.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-2 border border-border rounded bg-card/50">
                            <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                                     <img src={u.avatar} alt="av" className="w-full h-full object-cover" />
                                 </div>
                                 <div>
                                     <p className="font-bold text-sm">{u.alias}</p>
                                     <p className="text-xs text-muted-foreground">{u.role} | {u.gang || 'Sin pandilla'}</p>
                                 </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 cursor-pointer"><Edit className="w-4 h-4" /></Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive cursor-pointer" onClick={() => handleDeleteUser(u.id)}>
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
            <Card className="h-full flex flex-col bg-card/50 border-border">
              <TabHeaderWithInfo 
                icon={Palette}
                title={ADMIN_TABS_CONTENT.CONFIG.title}
                description={ADMIN_TABS_CONTENT.CONFIG.description}
                actionSlot={
                  <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border">
                    <button
                      onClick={() => { dispatch(setThemeConfig(fullConfig?.themes)); dispatch(setTheme('dark')); localStorage.setItem(STORAGE_KEYS.THEME, 'dark'); }}
                      className={`p-2 rounded-full transition-all flex items-center gap-2 cursor-pointer ${activeTheme === 'dark' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      title="Aplicar Tema Dark"
                    >
                      <Moon className="w-4 h-4" /> <span className="text-xs font-medium hidden sm:inline-block pr-1">Oscuro</span>
                    </button>
                    <button
                      onClick={() => { dispatch(setThemeConfig(fullConfig?.themes)); dispatch(setTheme('standard')); localStorage.setItem(STORAGE_KEYS.THEME, 'standard'); }}
                      className={`p-2 rounded-full transition-all flex items-center gap-2 cursor-pointer ${activeTheme === 'standard' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      title="Aplicar Tema Estándar"
                    >
                      <Sun className="w-4 h-4" /> <span className="text-xs font-medium hidden sm:inline-block pr-1">Claro</span>
                    </button>
                  </div>
                }
              />
              <CardContent className="flex-1 overflow-auto space-y-8 pt-4 pb-10 themed-scrollbar">
                {!fullConfig ? (
                  <p className="text-muted-foreground italic">Cargando configuración...</p>
                ) : (
                  <>
                    {/* Dark Theme Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                        <Moon className="w-5 h-5" /> Tema Dark (Activo por defecto)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Primario (Neon)</Label>
                          <div className="flex gap-2">
                            <Input 
                              type="color" 
                              value={fullConfig.themes.dark.primary} 
                              onChange={(e) => updateThemeColor('dark', 'primary', e.target.value)}
                              className="w-12 h-10 p-1 bg-muted border-border cursor-pointer" 
                            />
                            <Input 
                              value={fullConfig.themes.dark.primary} 
                              onChange={(e) => updateThemeColor('dark', 'primary', e.target.value)}
                              className="flex-1 bg-muted border-border text-xs font-mono" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Secundario (Gris Oscuro)</Label>
                          <div className="flex gap-2">
                            <Input 
                              type="color" 
                              value={fullConfig.themes.dark.secondary} 
                              onChange={(e) => updateThemeColor('dark', 'secondary', e.target.value)}
                              className="w-12 h-10 p-1 bg-muted border-border cursor-pointer" 
                            />
                            <Input 
                              value={fullConfig.themes.dark.secondary} 
                              onChange={(e) => updateThemeColor('dark', 'secondary', e.target.value)}
                              className="flex-1 bg-muted border-border text-xs font-mono" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Fondo (Background)</Label>
                          <div className="flex gap-2">
                            <Input 
                              type="color" 
                              value={fullConfig.themes.dark.background} 
                              onChange={(e) => updateThemeColor('dark', 'background', e.target.value)}
                              className="w-12 h-10 p-1 bg-muted border-border cursor-pointer" 
                            />
                            <Input 
                              value={fullConfig.themes.dark.background} 
                              onChange={(e) => updateThemeColor('dark', 'background', e.target.value)}
                              className="flex-1 bg-muted border-border text-xs font-mono" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-border w-full" />

                    {/* Standard Theme Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
                        <Sun className="w-5 h-5" /> Tema Estándar (Limpio)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Primario (Oscuro)</Label>
                          <div className="flex gap-2">
                            <Input 
                              type="color" 
                              value={fullConfig.themes.standard.primary} 
                              onChange={(e) => updateThemeColor('standard', 'primary', e.target.value)}
                              className="w-12 h-10 p-1 bg-muted border-border cursor-pointer" 
                            />
                            <Input 
                              value={fullConfig.themes.standard.primary} 
                              onChange={(e) => updateThemeColor('standard', 'primary', e.target.value)}
                              className="flex-1 bg-muted border-border text-xs font-mono" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Secundario (Gris Claro)</Label>
                          <div className="flex gap-2">
                            <Input 
                              type="color" 
                              value={fullConfig.themes.standard.secondary} 
                              onChange={(e) => updateThemeColor('standard', 'secondary', e.target.value)}
                              className="w-12 h-10 p-1 bg-muted border-border cursor-pointer" 
                            />
                            <Input 
                              value={fullConfig.themes.standard.secondary} 
                              onChange={(e) => updateThemeColor('standard', 'secondary', e.target.value)}
                              className="flex-1 bg-muted border-border text-xs font-mono" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Fondo (Blanco)</Label>
                          <div className="flex gap-2">
                            <Input 
                              type="color" 
                              value={fullConfig.themes.standard.background} 
                              onChange={(e) => updateThemeColor('standard', 'background', e.target.value)}
                              className="w-12 h-10 p-1 bg-muted border-border cursor-pointer" 
                            />
                            <Input 
                              value={fullConfig.themes.standard.background} 
                              onChange={(e) => updateThemeColor('standard', 'background', e.target.value)}
                              className="flex-1 bg-muted border-border text-xs font-mono" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-secondary text-black font-bold h-12 cursor-pointer"
                      onClick={handleSaveConfig}
                      disabled={isSavingConfig}
                    >
                      {isSavingConfig ? 'Guardando...' : 'Guardar Configuración Global'}
                    </Button>
                  </>
                )}
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
