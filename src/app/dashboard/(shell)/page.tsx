import { redirect } from "next/navigation";
import { isSameMonth, parseISO, startOfToday, format } from "date-fns";
import { CalendarCheck, Coins, Plug, Send, Sparkles, CalendarDays } from "lucide-react";
import { createClient, createAdminClient } from "@/lib/supabaseServer";
import { DashboardService } from "@/backend/services/DashboardService";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { ButtonLink } from "@/components/ui/Button";
import { GeneratePlanButton } from "@/components/ui/GeneratePlanButton";
import { UpcomingPosts } from "@/features/overview/UpcomingPosts";
import { BrandSnapshot } from "@/features/overview/BrandSnapshot";
import { SetupChecklist } from "@/features/overview/SetupChecklist";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

/** OAuth callbacks still land on /dashboard; the integrations UI that consumes them is on the legacy screen. */
const OAUTH_PARAMS = [
  "linkedin_success", "linkedin_error",
  "facebook_success", "facebook_error", "facebook_pages", "facebook_user_token", "facebook_workspace",
  "instagram_success", "instagram_error", "instagram_accounts", "instagram_user_token", "instagram_workspace",
];

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function greeting(name: string) {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return name ? `${part}, ${name.split(" ")[0]}` : part;
}

export default async function OverviewPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  if (OAUTH_PARAMS.some((k) => params[k] !== undefined)) {
    const forward = new URLSearchParams();
    for (const k of OAUTH_PARAMS) {
      const v = first(params[k]);
      if (v !== undefined) forward.set(k, v);
    }
    forward.set("settingsTab", "integrations");
    redirect(`/dashboard/legacy?${forward.toString()}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const data = await new DashboardService(createAdminClient()).getOverview(user, {
    workspaceId: first(params.workspaceId),
    brandDnaId: first(params.brandDnaId),
  });

  const brand = data.brandDna;
  const today = startOfToday();
  const upcoming = data.calendar.filter((c) => parseISO(c.date) >= today).slice(0, 6);
  const thisMonth = data.calendar.filter((c) => isSameMonth(parseISO(c.date), today));
  const published = thisMonth.filter((c) => (c.status || "").toLowerCase() === "published").length;
  const connectedCount = Object.values(data.channels).filter(Boolean).length;
  const tokens = data.billing?.wallet?.balance ?? 0;
  const planName = data.billing?.subscription?.plan_id ?? data.organizations[0]?.plan ?? "free";

  const steps = [
    { id: "brand", label: "Create your Brand DNA", done: !!brand, href: "/onboarding" },
    { id: "logo", label: "Upload your logo", done: !!data.brandAssets?.logo_url, href: "/dashboard/legacy?tab=dna" },
    { id: "channel", label: "Connect a social channel", done: connectedCount > 0, href: "/dashboard/legacy?settingsTab=integrations" },
    { id: "plan", label: "Plan your first month", done: data.calendar.length > 0, href: "/dashboard/legacy?tab=campaigns" },
    { id: "autopilot", label: "Turn on Autopilot", done: !!data.automation?.is_active, href: "/dashboard/legacy?settingsTab=autopilot" },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow={brand ? `${brand.brand_name} · ${format(today, "EEEE, d MMMM")}` : format(today, "EEEE, d MMMM")}
        title={greeting(data.profile.name)}
        description={
          brand
            ? `${upcoming.length ? `${upcoming.length} posts coming up` : "Nothing scheduled"} · ${connectedCount} channel${connectedCount === 1 ? "" : "s"} connected`
            : "Let's get your brand set up so Automarc can start creating for you."
        }
        actions={
          <>
            <GeneratePlanButton orgId={data.organizations[0]?.id} brandId={brand?.id} />
            <ButtonLink href="/dashboard/legacy?tab=studio" leadingIcon={<Sparkles className="h-4 w-4" />}>
              Create post
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Scheduled this month" value={thisMonth.length} hint={`${upcoming.length} upcoming`} icon={<CalendarCheck className="h-5 w-5" />} tone="accent" />
        <Stat label="Published" value={published} hint={format(today, "MMMM")} icon={<Send className="h-5 w-5" />} tone="success" />
        <Stat
          label="Tokens remaining"
          value={tokens}
          hint={`${String(planName).replace(/_/g, " ")} plan`}
          icon={<Coins className="h-5 w-5" />}
          tone={tokens <= 5 ? "warning" : "default"}
        />
        <Stat label="Channels connected" value={connectedCount} hint={connectedCount === 0 ? "Connect LinkedIn, Facebook or Instagram" : Object.entries(data.channels).filter(([, v]) => v).map(([k]) => k).join(", ")} icon={<Plug className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingPosts items={upcoming} hasBrand={!!brand} />
        </div>
        <div className="space-y-6">
          <SetupChecklist steps={steps} />
          <BrandSnapshot brand={brand} assets={data.brandAssets} />
        </div>
      </div>
    </div>
  );
}
