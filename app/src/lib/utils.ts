import { error, redirect } from '@sveltejs/kit';
import { clsx, type ClassValue } from 'clsx';
import { toast } from 'svelte-sonner';
import { twMerge } from 'tailwind-merge';
import { TERMINAL_COLORS, type ChannelTypeValues } from '$lib/constants';
import { AppState } from '$lib/stores.svelte';
import { SETTINGS } from './settings';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Helper class for throwing custom errors.
 * That way we can distinguish between our error and random errors.
 * We show these errors to the client.
 * We don't want to return DB `Error`s to the client.
 */
export class CError {
	status: number;
	message: string;

	constructor(status: number, message: string) {
		this.status = status;
		this.message = message;
	}
}

export const createCookieSettings = () => {
	return {
		path: '/', // The cookie is accessible across the entire site
		httpOnly: true, // Crucial: Prevents client-side JavaScript access (mitigates XSS)
		sameSite: 'strict' as const, // Crucial: Provides protection against CSRF
		secure: process.env.NODE_ENV === 'production', // Use 'secure' only in production (requires HTTPS)
		maxAge: 60 * 60 * 24 * SETTINGS.MAX_TOKEN_AGE_DAYS,
	};
};

export const genericRequest = async <T>(
	url: string,
	request: RequestInit,
	fetchFn: typeof fetch = fetch
): Promise<T> => {
	const isFormData = request.body instanceof FormData;
	const headers: Record<string, string> = {
		'Accept-Language': typeof navigator !== 'undefined' ? navigator.language : 'en',
	};

	isFormData
		? (headers['Content-Type'] = 'multipart/form-data')
		: (headers['Content-Type'] = 'application/json');

	const response = await fetchFn(url, request);

	if (response.status === 401) throw redirect(302, '/');

	if (!response.ok) {
		const data = await response.json();
		if (!data.message) throw new CError(response.status, 'Unexpected error');
		throw new CError(response.status, data.message);
	}

	return await response.json() as T;
};

export const handleRequestError = (e: unknown) => {
	if (e instanceof CError) toast.error(e.message);
	else if (e instanceof Error) toast.error('Unexpected error');
	else console.error(e);
};

export const report = {
	info: (msg: string) =>
		console.log(`${TERMINAL_COLORS.cyan}---\nℹ ${msg}\n---${TERMINAL_COLORS.reset}`),
	success: (msg: string) =>
		console.log(`${TERMINAL_COLORS.green}---\n✓ ${msg}\n---${TERMINAL_COLORS.reset}`),
	warn: (msg: string) =>
		console.log(`${TERMINAL_COLORS.yellow}---\n⚠ ${msg}\n---${TERMINAL_COLORS.reset}`),
	error: (msg: string) =>
		console.log(`${TERMINAL_COLORS.red}---\n✗ ${msg}\n---${TERMINAL_COLORS.reset}`),
};

export class DateHelper {
	static toReadable(date: Date | string) {
		let d: Date;

		if (typeof date === 'string') d = new Date(date);
		else d = date;

		return new Date(d).toLocaleString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		});
	}
}

export class AppHelper {
	static openAddCategoryDialog() {
		AppState.isCreateCategoryDialogOpen = true;
	}

	static openAddChannelDialog(channelType: ChannelTypeValues, forCategoryId: number) {
		AppState.isAddChannelDialogOpen = true;
		AppState.addChannelDialogOptions = { channelType, forCategoryId };
	}
}