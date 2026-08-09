// scripts/generate-paseto-key.ts — run once, copy output into .env
// Put secretKey in your private env (.env, never exposed to client) and publicKey wherever you verify tokens.

import { V4 } from 'paseto';

const key = await V4.generateKey('public', { format: 'paserk' });

console.log(key);
