import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/editor(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Allow OTP-authenticated users through (they have an otp_session cookie)
    const otpSession = req.cookies.get("otp_session");
    if (otpSession?.value) {
      return; // OTP user — skip Clerk protection
    }
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
  ],
};
