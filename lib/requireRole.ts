// lib/requireRole.ts
import { auth } from "@/lib/auth";
import { prisma } from "./prisma";
import { headers } from "next/headers";

export async function requireRole(role: "ADMIN" | "USER") {
        const headersList = await headers();

const session = await auth.api.getSession({
    headers: headersList // Pass the headers from the incoming request
});

  if (!session) {
    return { error: "Unauthorized", status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== role) {
    return { error: "Forbidden", status: 403 };
  }

  return { user };
}