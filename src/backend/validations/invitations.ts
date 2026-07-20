import { z } from 'zod';

export const createInvitationSchema = z.object({
  orgId: z.string().uuid("Invalid organization ID"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["owner", "admin", "member"], {
    message: "Role must be owner, admin, or member"
  }),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
