import { z } from "zod";
export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().min(1).max(60).optional(),
  }),
});
export const loginSchema = z.object({
  body: z.object({
    emailOrUsername: z.string().min(1),
    password: z.string().min(1),
  }),
});
