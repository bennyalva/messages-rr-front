'use client';

import { useRef, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { logout } from '@/lib/store/features/authSlice';
import { useRouter } from 'next/navigation';
import { Menu, Disc, LogOut, User, Mail, Info, MessageSquare, Users as UsersIcon, MoreVertical, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApiUrl } from '@/lib/config/api';

interface ChatHeaderProps {
  variant?: 'user' | 'admin';
  showBackButton?: boolean;
}

export default function ChatHeader({ variant = 'user', showBackButton = false }: ChatHeaderProps) {
  const API_URL = useApiUrl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);
  const { activeUsers } = useAppSelector(state => state.chat);
  const isAdminVariant = variant === 'admin';
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'phase1' | 'phase2'>('idle');
  const [config, setConfig] = useState<any>({ appName: 'Cargando...', logoUrl: null });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pressStartTime = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const ignoreClickRef = useRef(false);
  const heroTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/config`).then(res => res.json()).then(setConfig).catch(() => {});
  }, []);

  // Auto-dismiss hero animation after 5 seconds
  useEffect(() => {
    if (animationPhase === 'phase2') {
      heroTimeoutRef.current = setTimeout(() => {
        setAnimationPhase('idle');
        ignoreClickRef.current = false; // Reset to allow menu after animation ends
      }, 5000); // 5 seconds total for the hero animation
    }
    return () => {
      if (heroTimeoutRef.current) clearTimeout(heroTimeoutRef.current);
    };
  }, [animationPhase]);

  const checkPressDuration = () => {
      if (!pressStartTime.current) return;
      
      const duration = Date.now() - pressStartTime.current;
      
      if (duration >= 10000 && animationPhase !== 'phase2') {
          setAnimationPhase('phase2');
          ignoreClickRef.current = true;
          if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
          // Stop checking once phase2 is triggered
          pressStartTime.current = null;
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          return;
      } else if (duration >= 6000 && duration < 10000 && animationPhase !== 'phase1') {
          setAnimationPhase('phase1');
           ignoreClickRef.current = true;
           if(navigator.vibrate) navigator.vibrate([50]);
      }
      
      animationFrameRef.current = requestAnimationFrame(checkPressDuration);
  };

  const handlePointerDown = () => {
    if (animationPhase === 'phase2') return; // Don't restart if hero is playing
    pressStartTime.current = Date.now();
    ignoreClickRef.current = false;
    animationFrameRef.current = requestAnimationFrame(checkPressDuration);
  };

  const handlePointerUp = () => {
      // Don't reset if we're in phase2 (let it run its course)
      if (animationPhase === 'phase2') return;
      
      pressStartTime.current = null;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setAnimationPhase('idle');
      ignoreClickRef.current = false; // Reset to allow menu to open again
  };

  const handleLogoClick = () => {
      // Only trigger phase1 animation on tap if not already animating
      if (animationPhase === 'idle') {
          setAnimationPhase('phase1');
          // Auto-dismiss phase1 after 3 seconds
          setTimeout(() => {
              setAnimationPhase((prev) => prev === 'phase1' ? 'idle' : prev);
          }, 3000);
      }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    // dispatch(logout) calls sessionService.clearSession() which invalidates sessionId
    dispatch(logout());
    setShowLogoutConfirm(false);
    
    // Hard navigation to login - use location.href to go to END of history
    window.location.href = '/login';
  };

  return (
    <>
      {/* Global Overlay for Phase 2 Animation - Hero Mode - OUTSIDE header to avoid clipping */}
      <AnimatePresence>
           {animationPhase === 'phase2' && (
               <>
                   {/* Solid Overlay Background - Full Viewport */}
                   <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       transition={{ duration: 0.3 }}
                       style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 99999 }}
                       className="bg-gradient-to-b from-purple-950 via-black to-cyan-950"
                   />
                   
                   {/* Content Container on top of overlay - Full Viewport */}
                   <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       transition={{ duration: 0.5 }}
                       style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100000 }}
                       className="flex items-center justify-center flex-col"
                   >
                       {/* Burst/Flash Effect */}
                       <motion.div
                           initial={{ scale: 0.5, opacity: 0 }}
                           animate={{ 
                               scale: [0.5, 2, 1.5],
                               opacity: [0, 0.8, 0.5]
                           }}
                           transition={{ duration: 1, ease: "easeOut" }}
                           className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-primary/50 to-secondary/50 blur-[100px]"
                       />
                       
                       {/* Main Logo */}
                       <motion.div
                           initial={{ scale: 0.2, y: -300, opacity: 0 }}
                           animate={{ 
                               scale: 1,
                               y: 0,
                               opacity: 1,
                               rotate: [0, 360, 720]
                           }}
                           transition={{ 
                               duration: 1.2, 
                               ease: "easeOut",
                               rotate: { duration: 2.5, ease: "linear" }
                           }}
                           className="w-52 h-auto shadow-[0_0_100px_theme(colors.primary.DEFAULT),0_0_150px_theme(colors.secondary.DEFAULT)] relative z-10"
                       >
                           {config.logoUrl ? (
                               <img src={config.logoUrl} alt="Logo Hero" className="w-full h-auto object-contain" />
                           ) : (
                               <Disc className="w-52 h-52 p-6 text-white" />
                           )}
                       </motion.div>
                       
                       {/* App Name with Wave Effect */}
                       <motion.h1 
                           initial={{ y: 50, opacity: 0 }}
                           animate={{ 
                               y: [0, -5, 0, 5, 0],
                               opacity: 1
                           }}
                           transition={{ 
                               y: { delay: 0.5, duration: 0.8, repeat: Infinity },
                               opacity: { delay: 0.5, duration: 0.5 }
                           }}
                           className="mt-10 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary uppercase tracking-widest text-center drop-shadow-[0_0_20px_theme(colors.primary.DEFAULT)]"
                       >
                           {config.appName}
                       </motion.h1>
                       
                       {/* Users Connected with Wave */}
                       <motion.div 
                           initial={{ y: 30, opacity: 0 }}
                           animate={{ 
                               y: [0, 3, 0, -3, 0],
                               opacity: 1
                           }}
                           transition={{ 
                               y: { delay: 0.7, duration: 0.6, repeat: Infinity },
                               opacity: { delay: 0.7, duration: 0.5 }
                           }}
                           className="flex items-center gap-2 text-lg text-gray-300 mt-4"
                       >
                           <UsersIcon className="w-5 h-5 text-green-400" />
                           <span className="text-green-400 font-bold">{activeUsers.length}</span>
                           <span>usuarios conectados</span>
                       </motion.div>
                       
                       <motion.p 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ delay: 1, duration: 0.5 }}
                           className="text-gray-500 mt-6 text-sm"
                       >
                           ¡Súbele al volumen!
                       </motion.p>
                   </motion.div>
               </>
           )}
      </AnimatePresence>

      <header className={`sticky top-0 z-50 bg-black/80 backdrop-blur-md py-1 flex items-center relative ${
          isAdminVariant 
            ? 'mx-4 lg:mx-10 mt-4 rounded-xl border border-white/20 p-2 max-h-20' 
            : 'w-full h-17 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
        }`}>

        {/* Left: Back button OR Users counter — flex-1 pushes logo to center */}
        <div className="flex-1 flex items-center pl-3 z-10">
            {isAdminVariant ? (
                <span className="text-white/80 text-[11px]">Bienvenido, <span className="text-primary font-bold">{user?.alias}</span></span>
            ) : showBackButton ? (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.back()}
                    className="text-white hover:bg-white/10 -ml-1"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            ) : (
                <motion.div 
                    animate={(animationPhase === 'phase1' || animationPhase === 'phase2') ? {
                        y: [0, 1, 0, -1, 0],
                        transition: { duration: 0.6, repeat: Infinity, delay: 0.1 }
                    } : {}}
                    className="flex flex-col items-center text-[11px] text-gray-300 leading-tight"
                >
                    <span className="flex items-center gap-1">
                        <UsersIcon className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400 font-bold">{activeUsers.length}</span>
                    </span>
                    <span className="text-[9px] text-gray-400">en línea</span>
                </motion.div>
            )}
        </div>

        {/* Center: Logo — flex-shrink-0, visually centered between left and right */}
        <div
            className="flex-shrink-0 cursor-pointer outline-none h-full flex items-center py-0.5"
            onPointerDown={!isAdminVariant ? handlePointerDown : undefined}
            onPointerUp={!isAdminVariant ? handlePointerUp : undefined}
            onPointerLeave={!isAdminVariant ? handlePointerUp : undefined}
            onClick={!isAdminVariant ? handleLogoClick : undefined}
        >
            <motion.div 
                layoutId="sonidero-logo-hero"
                animate={
                    !isAdminVariant && animationPhase === 'phase1' 
                    ? { rotate: 360, scale: 1.1, filter: "hue-rotate(90deg)" }
                    : { rotate: 0, scale: 1, filter: "hue-rotate(0deg)" }
                }
                transition={{ 
                    duration: animationPhase === 'phase1' ? 0.5 : 0.3, 
                    repeat: !isAdminVariant && animationPhase === 'phase1' ? Infinity : 0,
                    ease: "linear"
                }}
                className="h-full w-auto select-none"
            >
                {config.logoUrl ? (
                    <img 
                        src={config.logoUrl} 
                        alt="Logo" 
                        className="h-full w-auto object-contain pointer-events-none mix-blend-lighten contrast-125 select-none scale-x-[1.25]" 
                    />
                ) : (
                    <Disc className="w-12 h-12 p-1 text-white" />
                )}
            </motion.div>
        </div>

        {/* Right: Menu — flex-1 mirrors left column for symmetric centering */}
        <div className="flex-1 flex justify-end items-center pr-1 z-10">
        {isAdminVariant ? (
            <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:bg-destructive/20"
                onClick={handleLogoutClick}
                title="Cerrar Sesión"
            >
                <LogOut className="w-6 h-6" />
            </Button>
        ) : (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-primary/20">
                        <MoreVertical className="w-6 h-6" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-black/90 border-primary text-white mr-2 z-[70]">
                    <DropdownMenuItem onClick={() => router.push('/vote')} className="focus:bg-primary/20 cursor-pointer">
                        <Disc className="mr-2 h-4 w-4" /> Votar Canciones
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dm-dj')} className="focus:bg-primary/20 cursor-pointer">
                        <Mail className="mr-2 h-4 w-4" /> Mensaje al DJ
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')} className="focus:bg-primary/20 cursor-pointer">
                        <User className="mr-2 h-4 w-4" /> Mi Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/about')} className="focus:bg-primary/20 cursor-pointer">
                        <Info className="mr-2 h-4 w-4" /> Acerca de
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogoutClick} className="text-destructive focus:bg-destructive/20 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
        </div>

        {/* Gradient accent line — user variant only */}
        {!isAdminVariant && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-primary" />
        )}

    </header>

    {/* Logout Confirmation Modal */}
    <ConfirmDialog
      open={showLogoutConfirm}
      onOpenChange={setShowLogoutConfirm}
      title="¿Cerrar sesión?"
      description="Estás a punto de salir de la aplicación. Perderás el acceso hasta que vuelvas a iniciar sesión."
      confirmLabel="Sí, cerrar sesión"
      cancelLabel="Cancelar"
      onConfirm={handleConfirmLogout}
      variant="destructive"
    />
    </>
  );
}
