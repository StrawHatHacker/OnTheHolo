import { REDIS_PASSWORD } from '$env/static/private';
import { createClient } from 'redis';

export const redis = createClient({
  url: `redis://default:${encodeURIComponent(REDIS_PASSWORD)}@localhost:6379`
});

redis.on('error', err => console.log('Redis Client Error', err));

redis.once('connection', (stream) => {
  console.log('Ah, we have our first user!');
});