import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatService } from '@/lib/services/chatService';

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Message {
  id: string;
  userId: string;
  userAlias: string;
  userAvatar?: string;
  userGang?: string;
  content: string;
  image?: string; // Base64 image
  timestamp: string; // ISO String
  reactions: Reaction[];
  replyToId?: string;
  isDeleted?: boolean;
}

interface ChatState {
  messages: Message[];
  users: Record<string, { alias: string; avatar: string }>; // Map of id -> user details
  isLoading: boolean;
  error: string | null;
  activeUsers: string[]; // List of user IDs
  replyingTo: Message | null;
}

const initialState: ChatState = {
  messages: [],
  users: {},
  isLoading: false,
  error: null,
  activeUsers: ['1', '2'], // Mock active users
  replyingTo: null,
};

// Async Thunks
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async () => {
    return await chatService.getMessages();
  }
);

export const fetchUsers = createAsyncThunk(
  'chat/fetchUsers',
  async () => {
    return await chatService.getUsers();
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message: Message) => {
    return await chatService.sendMessage(message);
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (id: string) => {
    return await chatService.deleteMessage(id);
  }
);

export const addReaction = createAsyncThunk(
  'chat/addReaction',
  async ({ messageId, reaction }: { messageId: string; reaction: Reaction }) => {
    return await chatService.addReaction(messageId, reaction);
  }
);

export const editMessage = createAsyncThunk(
  'chat/editMessage',
  async ({ id, content }: { id: string; content: string }) => {
    return await chatService.editMessage(id, content);
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setReplyingTo(state, action: PayloadAction<Message | null>) {
      state.replyingTo = action.payload;
    },
    updateMessage(state, action: PayloadAction<Message>) {
      const index = state.messages.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      } else {
        state.messages.push(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error fetching messages';
      })
      // Fetch Users
      .addCase(fetchUsers.fulfilled, (state, action) => {
        const usersMap: Record<string, { alias: string; avatar: string }> = {};
        action.payload.forEach((u: { id: string, alias?: string, username: string, avatar: string }) => {
            usersMap[u.id] = { alias: u.alias || u.username, avatar: u.avatar };
        });
        state.users = usersMap;
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const index = state.messages.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
      })
      // Add Reaction
      .addCase(addReaction.fulfilled, (state, action) => {
        const index = state.messages.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
      })
      // Edit Message
      .addCase(editMessage.fulfilled, (state, action) => {
        const index = state.messages.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
      });
  },
});

export const { setReplyingTo, updateMessage } = chatSlice.actions;
export default chatSlice.reducer;
