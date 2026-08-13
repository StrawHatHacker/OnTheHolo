import { REDIS_PASSWORD } from '$env/static/private';
import { createClient } from 'redis';

export const redisClient = createClient({
  url: `redis://default:${encodeURIComponent(REDIS_PASSWORD)}@localhost:6379`
});