// lib/anonymous.ts (服务端)
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

export async function getAnonymousId() {
  const cookieStore = await cookies();
  let anonymousId = cookieStore.get('anonymous_id')?.value;

  if (!anonymousId) {
    anonymousId = randomUUID();
    // 设置cookie，注意 path 和 httpOnly（如果不需要前端访问，可设为 true）
    cookieStore.set('anonymous_id', anonymousId, {
      maxAge: 60 * 60 * 24 * 30, // 30天
      path: '/',
      httpOnly: false, // 如果前端需要读取，设为 false；否则 true 更安全
      sameSite: 'lax',
    });
  }
  return anonymousId;
}