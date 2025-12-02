// =================================================================
// ARQUIVO: src/pages/api/auth/[...nextauth].ts
// API Route principal do NextAuth
// =================================================================

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export default NextAuth(authOptions);
