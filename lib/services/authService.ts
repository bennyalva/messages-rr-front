import { LoginCredentials, RegisterData, User } from "../types/auth";
import { generateUUID } from "../utils/uuid";
import httpClient from "./httpClient";
import { ENDPOINTS } from '@/lib/constants';

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const { data: users } = await httpClient.get<User[]>(ENDPOINTS.USERS, {
      params: { alias: credentials.alias },
    });

    if (users.length === 0) {
      throw new Error("Alias o contraseña incorrectos");
    }

    const user = users[0];
    if (user.password !== credentials.password) {
      throw new Error("Alias o contraseña incorrectos");
    }

    if (!user.isActive) {
      throw new Error("Usuario desactivado");
    }

    return user;
  },

  async register(data: RegisterData): Promise<User> {
    // Check if alias exists
    const { data: existing } = await httpClient.get<User[]>(ENDPOINTS.USERS, {
      params: { alias: data.alias },
    });

    if (existing.length > 0) {
      throw new Error("El alias ya está en uso");
    }

    const { confirmPassword, ...userData } = data;

    const newUser = {
      id: generateUUID(),
      ...userData,
      role: "user",
      isActive: true,
      avatar: data.avatar,
      musicPreferences: data.musicTypes,
    };

    const { data: created } = await httpClient.post<User>(ENDPOINTS.USERS, newUser);
    return created;
  }
};
