import { z } from "zod";

export const UserRoleSchema = z.enum(["owner", "admin", "user"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  alias: z.string().min(2, "El alias debe tener al menos 2 caracteres"),
  role: UserRoleSchema,
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  avatar: z.string().optional(),
  gang: z.string().optional(),
  musicTypes: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export type User = z.infer<typeof UserSchema>;

export const LoginSchema = z.object({
  alias: z.string().min(1, "El alias es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginCredentials = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  lastName: z.string().optional(),
  alias: z.string().min(2, "Alias requerido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
  gang: z.string().optional(),
  avatar: z.string().min(1, "Debes seleccionar un avatar"),
  musicTypes: z.array(z.string()).min(1, "Selecciona al menos un género musical"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type RegisterData = z.infer<typeof RegisterSchema>;
