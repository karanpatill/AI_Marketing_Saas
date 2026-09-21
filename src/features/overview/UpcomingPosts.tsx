import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { CalendarDays, ArrowRight, Layers, Image as ImageIcon, Clapperboard } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export type CalendarItem = {
  id: string;
  date: string;
  title: string;
  post_type?: string | null;
  platform?: string | null;
  status?: string | null;
};

const STATUS: Record<string, { label: string; variant: "default" | "success" | "warning" | "info" | "error" }> = {
  planned: { label: "Planned", variant: "default" },
  generating: { label: "Generating", variant: "info" },
  generated: { label: "Ready", variant: "success" },
  ready: { label: "Ready", variant: "success" },
  scheduled: { label: "Scheduled", variant: "info" },
  published: { label: "Published", variant: "success" },
  failed: { label: "Failed", variant: "error" },
};

function typeIcon(type?: string | null) {
  const t = (type || "").toLowerCase();
  if (t.includes("carousel")) return Layers;
  if (t.includes("video") || t.includes("reel")) return Clapperboard;
  return ImageIcon;
}

function dayLabel(iso: string) {
  const d = parseISO(iso);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEE, d MMM");
}

export function UpcomingPosts({ items, hasBrand }: { items: CalendarItem[]; hasBrand: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Upcoming posts</CardTitle>
          <CardDescription>Next items on your content calendar</CardDescription>
        </div>
        <ButtonLink href="/dashboard/legacy?tab=campaigns" variant="ghost" size="sm" trailingIcon={<ArrowRight className="h-4 w-4" />}>
          Open calendar
        </ButtonLink>
      </CardHeader>

      {items.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" />}
          title={hasBrand ? "Nothing scheduled yet" : "Set up your brand first"}
          description={
            hasBrand
              ? "Generate a 30-day strategy and Automarc will fill your calendar with posts tailored to your brand."
              : "Your calendar is built from your Brand DNA. Finish onboarding to unlock it."
          }
          action={
            <ButtonLink href={hasBrand ? "/dashboard/legacy?tab=campaigns" : "/onboarding"} variant="tonal" size="sm">
              {hasBrand ? "Plan this month" : "Start onboarding"}
            </ButtonLink>
          }
        />
      ) : (
        <ul className="divide-y divide-line">
          {items.map((item) => {
            const Icon = typeIcon(item.post_type);
            const status = STATUS[(item.status || "planned").toLowerCase()] ?? STATUS.planned;
            return (
              <li key={item.id} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-surface-2/60">
                <div className="w-[88px] shrink-0">
                  <p className="text-body-sm font-medium text-ink">{dayLabel(item.date)}</p>
                  <p className="text-body-sm text-ink-3">{format(parseISO(item.date), "yyyy")}</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-2 text-ink-2">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body text-ink">{item.title}</p>
                  <p className="truncate text-body-sm text-ink-3">
                    {[item.post_type, item.platform].filter(Boolean).join(" · ") || "Post"}
                  </p>
                </div>
                <Badge variant={status.variant} dot>
                  {status.label}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
