import { Message, Reaction } from '@/lib/store/features/chatSlice';
import httpClient from './httpClient';
import { ENDPOINTS } from '@/lib/constants';

export const chatService = {
  // Get all messages
  getMessages: async (): Promise<Message[]> => {
    const { data } = await httpClient.get<Message[]>(ENDPOINTS.MESSAGES);
    return data;
  },

  // Send a new message
  sendMessage: async (message: Message): Promise<Message> => {
    const { data } = await httpClient.post<Message>(ENDPOINTS.MESSAGES, message);
    return data;
  },

  // Delete a message (mark as deleted)
  deleteMessage: async (id: string): Promise<Message> => {
    const { data } = await httpClient.patch<Message>(`${ENDPOINTS.MESSAGES}/${id}`, {
      isDeleted: true,
      content: "Mensaje borrado",
      image: null,
    });
    return data;
  },

  // Add a reaction
  addReaction: async (messageId: string, reaction: Reaction): Promise<Message> => {
    // First get the current message to append the reaction
    const { data: message } = await httpClient.get<Message>(`${ENDPOINTS.MESSAGES}/${messageId}`);

    const updatedReactions = [...message.reactions, reaction];

    const { data: updated } = await httpClient.patch<Message>(`${ENDPOINTS.MESSAGES}/${messageId}`, {
      reactions: updatedReactions,
    });
    return updated;
  },

  // Edit a message
  editMessage: async (id: string, newContent: string): Promise<Message> => {
    const { data } = await httpClient.patch<Message>(`${ENDPOINTS.MESSAGES}/${id}`, {
      content: newContent,
    });
    return data;
  },

  // Get all users (for resolving reactions)
  getUsers: async (): Promise<any[]> => {
    const { data } = await httpClient.get<any[]>(ENDPOINTS.USERS);
    return data;
  },
};
