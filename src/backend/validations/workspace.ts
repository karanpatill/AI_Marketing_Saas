import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  orgId: z.string().uuid("Invalid organization ID"),
  name: z.string().min(2, "Workspace name must be at least 2 characters").max(50, "Workspace name must be less than 50 characters"),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
