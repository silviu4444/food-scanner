import { CookieSerializeOptions } from '@fastify/cookie';

export function getCookieOptions(
  options: CookieSerializeOptions
): CookieSerializeOptions {
  return {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : undefined,
    ...options
  };
}
