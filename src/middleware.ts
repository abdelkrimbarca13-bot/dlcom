import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

    // Protection supplémentaire par rôle si besoin d'URLs spécifiques
    if (isAdminPage && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protéger toutes les routes sauf login et api/auth
export const config = {
  matcher: ["/((?!api/auth|login).*)"],
};
