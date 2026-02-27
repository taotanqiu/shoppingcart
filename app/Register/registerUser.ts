"use server";

import { prisma } from "@/lib/prisma";


 
interface RegisterUserInput {
  name?: string;
  email: string;
  password: string;
  image?: string;
}

export async function registerUserAction({ name, email, password, image }: RegisterUserInput) {
  try {






  
    const dbUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
        Image,
      },
    });

    return { success: true, user: dbUser };
  } catch (error) {
    return { success: false, error: error?.message || "注册失败" };
  }
}