import type { RequestHandler } from './$types';
import { registerConnection, unregisterConnection, type Connection } from '$lib/server/sse';
import { Auth } from '$lib/server/auth';
import { isRateLimited } from '$lib/server/ratelimits';

export const GET: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  isRateLimited(Auth.getClientIp(request, getClientAddress), 'normal');

  const session = await Auth.verifySession(cookies);
  const userId = session.user.id;

  let id = 0;
  let closed = false;
  let conn: Connection;
  let heartbeat: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return; // guard against late sends
        try {
          controller.enqueue(
            `id: ${id++}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`
          );
        } catch (err) {
          // controller closed between our check and enqueue — swallow it
          closed = true;
        }
      };

      conn = { send };
      registerConnection(userId, conn);

      controller.enqueue(`retry: 3000\n\n`);

      // keep the connection alive through proxy/LB idle timeouts
      heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(`: heartbeat\n\n`);
        } catch {
          closed = true;
        }
      }, 30000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        unregisterConnection(userId, conn);
        try {
          controller.close();
        } catch {
          // already closed, ignore
        }
      };

      request.signal.addEventListener('abort', cleanup);
    },
    cancel() {
      // fires if the stream is cancelled from the ReadableStream side
      closed = true;
      clearInterval(heartbeat);
      unregisterConnection(userId, conn);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
};