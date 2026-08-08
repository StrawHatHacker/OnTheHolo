import crypto from 'node:crypto';

export class Auth {
    static hashPassword = (password: string, salt: string) => {
        return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    }

    static generateSalt = () => {
        return crypto.randomBytes(32).toString('hex');
    }

    static createToken() {
        return crypto.randomBytes(64).toString('hex');
    }
}

