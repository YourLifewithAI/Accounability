/**
 * The platform extension point. Each accountability module registers here with
 * its route, nav metadata, and status. The flagship "Money & Power" module ships
 * enabled; the Hyperlocal Hub and Live Fact-Checker ship as enabled:false stubs
 * that already appear in the nav. Building module 2 or 3 later = flesh out its
 * route folder and flip `enabled` to true. No shell changes required.
 */

export interface ModuleDefinition {
  slug: string;
  title: string;
  tagline: string;
  /** Inline emoji used as a lightweight nav/card icon (no icon dependency). */
  icon: string;
  href: string;
  enabled: boolean;
}

export const MODULES: ModuleDefinition[] = [
  {
    slug: "money",
    title: "Money & Power",
    tagline:
      "Look up a member of Congress and see who funds them and where federal money flows.",
    icon: "💰",
    href: "/money",
    enabled: true,
  },
  {
    slug: "local",
    title: "Hyperlocal Hub",
    tagline:
      "A geofenced neighborhood feed for proposed developments, local meetings, and organizing.",
    icon: "📍",
    href: "/local",
    enabled: false,
  },
  {
    slug: "factcheck",
    title: "Live Fact-Checker",
    tagline:
      "Real-time claim detection and verification during debates and speeches.",
    icon: "🔎",
    href: "/factcheck",
    enabled: false,
  },
];

export function getModule(slug: string): ModuleDefinition | undefined {
  return MODULES.find((m) => m.slug === slug);
}
