import { z } from 'zod';

export const updateRoleSchema = z.object({
  orgId: z.string().uuid("Invalid organization ID"),
  userId: z.string().uuid("Invalid user ID"),
  newRole: z.enum(["owner", "admin", "member"], {
    message: "Role must be owner, admin, or member"
  }),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
