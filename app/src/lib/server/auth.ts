import type { PasetoSignPayload, PasetoVerifiedPayload } from '$lib/types';
import { SECRET_PASETO_KEY } from '$env/static/private';
import { PUBLIC_PASETO_KEY } from '$env/static/public';
import crypto from 'node:crypto';
import { V4 } from 'paseto';

export class Auth {
    static hashPassword = (password: string, salt: string) => {
        return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    }

    static generateSalt = () => {
        return crypto.randomBytes(32).toString('hex');
    }

    static async createPrivateKey(user: PasetoSignPayload) {
        return await V4.sign({ sub: user.sub, username: user.username }, SECRET_PASETO_KEY, { expiresIn: '30 days' });
    }

    static async verifyPrivateKey(token: string): Promise<PasetoVerifiedPayload> {
        return await V4.verify(token, PUBLIC_PASETO_KEY);
    }
}

