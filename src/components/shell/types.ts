export type ShellUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export type ShellWorkspace = {
  id: string;
  name: string;
  orgId: string;
  orgName?: string;
};
