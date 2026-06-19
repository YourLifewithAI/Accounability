import type { MetadataRoute } from "next";
import { listPoliticians } from "@/lib/data";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/money", "/methodology", "/local", "/factcheck"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    }),
  );

  const politicianRoutes = listPoliticians().map((p) => ({
    url: `${base}/money/politician/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...politicianRoutes];
}
