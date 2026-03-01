// app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { admin } from "better-auth/plugins/admin";

export const auth = betterAuth({

database: prismaAdapter(prisma, { provider: "postgresql" }), //  "postgresql"
socialProviders: { 
github: { 
clientId: process.env.GITHUB_CLIENT_ID as string, 
clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
}, 
}, 
emailAndPassword: {
  minPasswordLength: 3,  // 
    maxPasswordLength: 128, 
enabled: true, // ← must be true so email+password sign‑up works
},
plugins: [
admin({
defaultRole: "USER",
adminRoles: ["ADMIN"],

}),
],
 

});





 



