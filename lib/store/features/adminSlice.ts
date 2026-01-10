import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/auth';
import { Message } from './chatSlice';

interface Song {
  id: string;
  title: string;
  artist: string;
  votes: number;
}

interface AdminState {
  users: User[]; // Mock of all users
  songs: Song[];
  reportedMessages: Message[];
  dmsToDj: Message[]; // Reusing Message type for simplicity
}

const initialState: AdminState = {
  users: [
    { id: '1', username: 'admin', alias: 'Admin', role: 'admin', isActive: true, password: 'admin' },
    { id: '2', username: 'user1', alias: 'Bailador', role: 'user', isActive: true, password: 'user1' },
  ],
  songs: [],
  reportedMessages: [],
  dmsToDj: [],
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
        state.users = action.payload;
    },
    deleteUser(state, action: PayloadAction<string>) {
        state.users = state.users.filter(u => u.id !== action.payload);
    },
    updateUserRole(state, action: PayloadAction<{id: string, role: any}>) { // simplified type
        const user = state.users.find(u => u.id === action.payload.id);
        if (user) user.role = action.payload.role;
    },
    setSongs(state, action: PayloadAction<Song[]>) {
        state.songs = action.payload;
    },
    addSong(state, action: PayloadAction<Song>) {
        state.songs.push(action.payload);
    },
    clearSongs(state) {
        state.songs = [];
    }
  },
});

export const { setUsers, deleteUser, updateUserRole, setSongs, addSong, clearSongs } = adminSlice.actions;
export default adminSlice.reducer;
