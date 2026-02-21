export function safeImage(input?: string | null): { isDirect: boolean; src: string } {
  const raw = String(input || "").trim();
  if (!raw) return { isDirect: false, src: "" };

  let url = raw.replace(/^['"]|['"]$/g, "").trim();

  // Google Drive common conversion
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (driveMatch) {
    url = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }

  // Ensure protocol
  if (url.startsWith("//")) url = "https:" + url;
  if (!/^https?:\/\//i.test(url) && url.startsWith("www.")) url = "https://" + url;

  const extMatch = /\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i;
  const googleusercontent = /lh3\.googleusercontent\.com/i;

  const isValid = extMatch.test(url) || googleusercontent.test(url);

  return { isDirect: isValid, src: url };
}
