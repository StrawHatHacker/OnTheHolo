import type { SSEMessage } from "$lib/types";
import { report } from "$lib/utils";

type SSEEvent = 'message:create' | 'category:create' | 'channel:create';

export type Connection = {
  send: (event: SSEEvent, data: unknown) => void;
};

// userId -> set of active connections (user might have multiple tabs)
const connections = new Map<string, Set<Connection>>();

export const getAllSSEUsers = () => {
  return Array.from(connections.keys()).map(Number);
}

export const registerConnection = (userId: number, conn: Connection) => {
  const uid = userId + '';
  if (!connections.has(uid)) {
    connections.set(uid, new Set());
  }
  connections.get(uid)!.add(conn);
  process.env.NODE_ENV !== 'production' && report.info(`Registered connection for user ${userId}`);
}

export const unregisterConnection = (userId: number, conn: Connection) => {
  const uid = userId + '';
  connections.get(uid)?.delete(conn);
  if (connections.get(uid)?.size === 0) {
    connections.delete(uid);
    process.env.NODE_ENV !== 'production' && report.info(`Unregistered connection for user ${userId}`);
  }
}

export const sendSSEToUsers = <T>(userIds: number[], event: SSEEvent, data: T) => {
  for (const userId of userIds) {
    const uid = userId + '';
    const userConnections = connections.get(uid);
    if (!userConnections) continue; // user not connected, nothing to do
    for (const conn of userConnections) {
      conn.send(event, data);
      process.env.NODE_ENV !== 'production' && report.info(`Sent event ${event} to user ${userId}`);
    }
  }
}