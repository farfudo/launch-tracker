import {NextResponse} from 'next/server';
export function proxy(){const response=NextResponse.next();response.headers.set('Cache-Control','no-store');response.headers.set('X-Robots-Tag','noindex, nofollow');response.headers.set('Referrer-Policy','no-referrer');response.headers.set('X-Content-Type-Options','nosniff');return response;}
export const config={matcher:['/admin/:path*','/api/admin/:path*']};
