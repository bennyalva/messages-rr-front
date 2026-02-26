import { LoginCredentials, RegisterData, User } from "../types/auth";
import { generateUUID } from "../utils/uuid";
import httpClient from "./httpClient";

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const { data: users } = await httpClient.get<User[]>('/users', {
      params: { alias: credentials.alias },
    });

    if (users.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    const user = users[0];
    if (user.password !== credentials.password) {
      throw new Error("Contraseña incorrecta");
    }

    if (!user.isActive) {
      throw new Error("Usuario desactivado");
    }

    return user;
  },

  async register(data: RegisterData): Promise<User> {
    // Check if alias exists
    const { data: existing } = await httpClient.get<User[]>('/users', {
      params: { alias: data.alias },
    });

    if (existing.length > 0) {
      throw new Error("El alias ya está en uso");
    }

    const newUser = {
      id: generateUUID(),
      ...data,
      role: "user",
      isActive: true,
      avatar: data.avatar,
      musicPreferences: data.musicTypes,
      confirmPassword: undefined,
    };

    const { data: created } = await httpClient.post<User>('/users', newUser);
    return created;
  }
};
