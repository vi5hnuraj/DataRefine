import { default as nextAuthMiddleware } from "next-auth/middleware";

export default function proxy(req: any) {
  return nextAuthMiddleware(req as any);
}

export const config = {
  // Protect all routes inside /history, /results, and /dashboard
  matcher: ["/history/:path*", "/results/:path*", "/dashboard/:path*"],
};
