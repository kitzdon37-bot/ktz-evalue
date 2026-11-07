import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { decodeLogo } from "@/lib/company/logo";

// Logo public d'une entreprise (montré aux candidats). L'adresse change à chaque
// nouveau logo (?v=…), on peut donc le garder longtemps en cache.
export async function GET(_req: NextRequest, { params }: RouteContext<"/logo/[companyId]">) {
  const { companyId } = await params;
  const company = await db.company.findFirst({ where: { id: companyId, deletedAt: null }, select: { logoData: true } });
  const logo = decodeLogo(company?.logoData);
  if (!logo) return new NextResponse("Logo introuvable", { status: 404 });
  return new NextResponse(new Uint8Array(logo.bytes), {
    headers: {
      "content-type": logo.type,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
