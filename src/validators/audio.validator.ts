import { z } from "zod";
export const permissionSchema = z.object({
  body: z.object({
    ownerUserId: z.string(),
    listenerUserId: z.string(),
    isAllowed: z.boolean(),
  }),
});
export const createSessionSchema = z.object({
  body: z.object({ ownerUserId: z.string(), listenerUserId: z.string() }),
});
export const patchSessionSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({ status: z.enum(["connecting", "active", "rejected"]) }),
});
export const stopSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({ endedBy: z.string().optional() }),
});
