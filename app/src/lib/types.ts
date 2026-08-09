export type GlobalLocals = {
	lastUser: {
		username: string;
	} | null;
};

export type PasetoSignPayload = {
	sub: string;
	username: string;
};

export type PasetoVerifiedPayload = PasetoSignPayload & {
	iat: number;
	exp: number;
};

export type NewUser = {
	username: string;
	email: string;
	password: string;
	salt: string;
};
