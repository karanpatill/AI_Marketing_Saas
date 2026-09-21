import { Fingerprint, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

type Colors = Record<string, string | undefined>;

function pickColors(assets: { logo_studio_data?: { colors?: Colors } } | null): { label: string; hex: string }[] {
  const c = assets?.logo_studio_data?.colors ?? {};
  const candidates: [string, string | undefined][] = [
    ["Primary", c.primary ?? c.primaryHex],
    ["Secondary", c.secondary ?? c.secondaryHex],
    ["Accent", c.accent ?? c.accentHex],
    ["Background", c.background ?? c.backgroundHex],
  ];
  return candidates.filter((x): x is [string, string] => !!x[1] && /^#[0-9a-f]{6}$/i.test(x[1])).map(([label, hex]) => ({ label, hex }));
}

export function BrandSnapshot({
  brand,
  assets,
}: {
  brand: {
    id: string;
    brand_name?: string;
    industry?: string;
    category?: string;
    brand_personality?: string;
    brand_values?: string[];
    usp?: string;
  } | null;
  assets: { logo_url?: string; logo_studio_data?: { colors?: Colors } } | null;
}) {
  if (!brand) {
    return (
      <Card>
        <EmptyState
          icon={<Fingerprint className="h-5 w-5" />}
          title="No brand yet"
          description="Automarc learns your brand from your website and builds a reusable Brand DNA."
          action={
            <ButtonLink href="/onboarding" size="sm">
              Set up brand
            </ButtonLink>
          }
        />
      </Card>
    );
  }

  const colors = pickColors(assets);
  const values = (brand.brand_values ?? []).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Brand snapshot</CardTitle>
          <CardDescription>What every post is generated from</CardDescription>
        </div>
        <ButtonLink href="/dashboard/legacy?tab=dna" variant="ghost" size="sm" trailingIcon={<ArrowRight className="h-4 w-4" />}>
          Edit
        </ButtonLink>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface-2">
            {assets?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assets.logo_url} alt={`${brand.brand_name} logo`} className="h-full w-full object-contain p-1.5" />
            ) : (
              <span className="text-title text-ink-3">{(brand.brand_name || "B").charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-title-sm text-ink">{brand.brand_name}</p>
            <p className="truncate text-body-sm text-ink-3">{[brand.industry, brand.category].filter(Boolean).join(" · ")}</p>
          </div>
        </div>

        {brand.usp && <p className="text-body text-ink-2 line-clamp-2">{brand.usp}</p>}

        {colors.length > 0 && (
          <div>
            <p className="mb-2 text-label text-ink-3">Palette</p>
            <div className="flex gap-2">
              {colors.map((c) => (
                <div key={c.label} className="flex items-center gap-2" title={`${c.label} ${c.hex}`}>
                  <span className="h-7 w-7 rounded-full border border-line shadow-inner" style={{ backgroundColor: c.hex }} />
                  <span className="text-body-sm tabular text-ink-3">{c.hex.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(brand.brand_personality || values.length > 0) && (
          <div>
            <p className="mb-2 text-label text-ink-3">Voice</p>
            <div className="flex flex-wrap gap-1.5">
              {brand.brand_personality && <Badge variant="accent">{brand.brand_personality}</Badge>}
              {values.map((v) => (
                <Badge key={v}>{v}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
