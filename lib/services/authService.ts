import { LoginCredentials, RegisterData, User } from "../types/auth";
import { getApiUrl } from "../config/api";
import { generateUUID } from "../utils/uuid";

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const API_URL = getApiUrl();
    const response = await fetch(`${API_URL}/users?alias=${credentials.alias}`);
    if (!response.ok) {
        throw new Error("Error al conectar con el servidor");
    }
    const users = await response.json();
    
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
      const API_URL = getApiUrl();
      // Check if alias exists
      const checkRes = await fetch(`${API_URL}/users?alias=${data.alias}`);
      const existing = await checkRes.json();
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

      const response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
      });

      if (!response.ok) {
          throw new Error("Error al registrar usuario");
      }

      return await response.json();
  }
};
