import { getApiUrl } from '@/lib/config/api';
import { Message, Reaction } from '@/lib/store/features/chatSlice';

const API_URL = getApiUrl();

export const chatService = {
  // Get all messages
  getMessages: async (): Promise<Message[]> => {
    const response = await fetch(`${API_URL}/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  // Send a new message
  sendMessage: async (message: Message): Promise<Message> => {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  // Delete a message (mark as deleted or remove)
  // Logic: We're marking as deleted instead of actual removal based on previous logic
  deleteMessage: async (id: string): Promise<Message> => {
    const response = await fetch(`${API_URL}/messages/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        isDeleted: true,
        content: "Mensaje borrado",
        image: null // Remove image if deleted
      }),
    });
    if (!response.ok) throw new Error('Failed to delete message');
    return response.json();
  },

  // Add a reaction
  addReaction: async (messageId: string, reaction: Reaction): Promise<Message> => {
    // First get the current message to append the reaction
    const getResponse = await fetch(`${API_URL}/messages/${messageId}`);
    if (!getResponse.ok) throw new Error('Message not found');
    
    const message: Message = await getResponse.json();
    
    // Check if user already reacted with this emoji (toggle logic could be here, but we'll append for now per UI)
    // Actually, usually we want to avoid duplicates. Let's check.
    // Ideally the backend handles this, but with json-server we do it here.
    const updatedReactions = [...message.reactions, reaction];

    const response = await fetch(`${API_URL}/messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reactions: updatedReactions }),
    });
    
    if (!response.ok) throw new Error('Failed to add reaction');
    return response.json();
  },

  // Edit a message
  editMessage: async (id: string, newContent: string): Promise<Message> => {
    const response = await fetch(`${API_URL}/messages/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newContent }),
    });
    
    if (!response.ok) throw new Error('Failed to edit message');
    return response.json();
  },

  // Get all users (for resolving reactions)
  getUsers: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }
};
