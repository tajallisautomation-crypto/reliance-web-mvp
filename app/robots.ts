import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.SITE_URL || "https://reliance.tajallis.com.pk";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/p/", "/c/"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
