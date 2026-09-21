import { NextRequest, NextResponse } from "next/server";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { createAdminClient } from "@/lib/supabaseServer";
import { DashboardService } from "@/backend/services/DashboardService";

/**
 * GET /api/dashboard/init?workspaceId=&brandDnaId=
 *
 * Single endpoint that returns everything the dashboard needs in one round-trip.
 * Data assembly lives in DashboardService so the server-rendered overview page shares it.
 */
export const GET = withApiWrapper(async (req: NextRequest) => {
  const user = await requireAuth();
  const { searchParams } = req.nextUrl;

  const service = new DashboardService(createAdminClient());
  const overview = await service.getOverview(user, {
    workspaceId: searchParams.get("workspaceId"),
    brandDnaId: searchParams.get("brandDnaId"),
  });

  return NextResponse.json(overview);
});
