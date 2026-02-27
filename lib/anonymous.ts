// lib/anonymous.ts
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

export async function getAnonymousId() {
  const cookieStore = await cookies();
  let anonymousId = cookieStore.get('anonymous_id')?.value;
  if (!anonymousId) {
    anonymousId = randomUUID();
   
    cookieStore.set('anonymous_id', anonymousId, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });
  }
  return anonymousId;
}