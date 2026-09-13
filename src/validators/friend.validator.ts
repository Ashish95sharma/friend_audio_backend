import { z } from "zod";
export const requestSchema = z.object({
  body: z.object({ userId: z.string().min(1) }),
});
export const idSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
export const userIdSchema = z.object({
  params: z.object({ userId: z.string().min(1) }),
});
export const requestsQuerySchema = z.object({
  query: z.object({
    direction: z.enum(["incoming", "outgoing"]).optional(),
  }),
});
