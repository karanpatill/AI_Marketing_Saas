import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth, requireWorkspaceAccess } from "@/backend/middlewares/auth";
import { createAdminClient } from "@/lib/supabaseServer";
import { BrandService } from "@/backend/services/BrandService";

const stringList = z.array(z.string().max(200)).max(50);

/** Only these fields can be written by the client; everything else (ids, internal flags) is server-owned. */
const createBrandSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(120),
  website: z.string().max(2048).nullable().optional(),
  industry: z.string().max(120).optional(),
  category: z.string().max(120).optional(),
  sub_category: z.string().max(120).nullable().optional(),
  business_description: z.string().max(4000).optional(),
  mission: z.string().max(2000).optional(),
  vision: z.string().max(2000).nullable().optional(),
  usp: z.string().max(2000).optional(),
  brand_personality: z.string().max(500).optional(),
  brand_values: stringList.optional(),
  products: stringList.optional(),
  services: stringList.optional(),
  pricing: z.string().max(500).optional(),
  target_audience: z.string().max(2000).optional(),
  customer_personas: z.string().max(4000).optional(),
  country: z.string().max(120).optional(),
  languages: stringList.optional(),
  competitors: stringList.optional(),
  platforms: stringList.optional(),
  main_goal: z.string().max(500).optional(),
  approved_moodboard: z.unknown().nullable().optional(),
});

export const GET = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }
  await requireWorkspaceAccess(user.id, workspaceId);

  const service = new BrandService(createAdminClient());
  const data = await service.getBrands(workspaceId);
  return NextResponse.json(data);
});

export const POST = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();
  const { workspaceId, name, ...data } = createBrandSchema.parse(await req.json());

  await requireWorkspaceAccess(user.id, workspaceId);

  const service = new BrandService(createAdminClient());
  const brand = await service.createBrand(workspaceId, name, data);
  return NextResponse.json(brand, { status: 201 });
});
