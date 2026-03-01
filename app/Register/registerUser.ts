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
       email: email ?? '',
    password,
    name: name ?? undefined,   // 如果 name 为空，让数据库设为 null
    image: image ?? undefined,
    // 如果模型中有 role 字段且没有默认值，手动提供默认值
    role: 'USER',
    // 其他字段如果有必要，也添加进来
      },
    });

    return { success: true, user: dbUser };
  } catch (err) {
  const errorMessage = err instanceof globalThis.Error ? err.message : "注册失败";
  return { success: false, error: errorMessage };
}
}