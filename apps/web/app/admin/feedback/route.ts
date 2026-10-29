// Fail closed before rendering/streaming until server-side admin authentication exists.
export async function GET(){return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});}
