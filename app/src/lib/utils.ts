import { error, redirect } from '@sveltejs/kit';
import { clsx, type ClassValue } from 'clsx';
import { toast } from 'svelte-sonner';
import { twMerge } from 'tailwind-merge';
import { MEDIA_FOLDERS, USER_ACTIVITY_STATUS, TERMINAL_COLORS, type ChannelTypeValues, type USER_ACTIVITY_STATUS_VALUES, type MediaPurposeValues, MEDIA_PURPOSE } from '$lib/constants';
import { AppState } from '$lib/stores.svelte';
import { SETTINGS } from '$lib/settings';
import type { CategoryFull, ChannelWithMessages, User } from '$lib/types';

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
		console.log(`${TERMINAL_COLORS.cyan}${msg}${TERMINAL_COLORS.reset}`),
	success: (msg: string) =>
		console.log(`${TERMINAL_COLORS.green}${msg}${TERMINAL_COLORS.reset}`),
	warn: (msg: string) =>
		console.log(`${TERMINAL_COLORS.yellow}${msg}${TERMINAL_COLORS.reset}`),
	error: (msg: string) =>
		console.log(`${TERMINAL_COLORS.red}${msg}${TERMINAL_COLORS.reset}`),
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

/**
 * Store objects should be passed wrapped in $state.snapshot()
 * to eliminate references to the original object
 */
export class AppHelper {
	// ------ USER ------

	static openEditUserDialog() {
		AppState.isEditUserDialogOpen = true;
	}

	static closeEditUserDialog() {
		AppState.isEditUserDialogOpen = false;
	}

	// ------ CATEGORIES ------

	static openAddCategoryDialog() {
		AppState.isAddCategoryDialogOpen = true;
		console.log('openAddCategoryDialog');
	}

	static closeAddCategoryDialog() {
		AppState.isAddCategoryDialogOpen = false;
	}

	static openEditCategoryDialog(category: CategoryFull) {
		AppState.isEditCategoryDialogOpen = true;
		// Removing channels->messages for performance, we don't need them
		// Since category is a clone anyway
		category = { ...category, channels: [] };
		AppState.categoryToEdit = category;
	}

	static closeEditCategoryDialog() {
		AppState.isEditCategoryDialogOpen = false;
		AppState.categoryToEdit = null;
	}

	static openDeleteCategoryDialog(category: CategoryFull) {
		AppState.isDeleteCategoryDialogOpen = true;
		AppState.categoryToDelete = category;
	}

	static closeDeleteCategoryDialog() {
		AppState.isDeleteCategoryDialogOpen = false;
		AppState.categoryToDelete = null;
	}

	// ------ CHANNELS ------

	static openAddChannelDialog(channelType: ChannelTypeValues, forCategoryId: number) {
		AppState.isAddChannelDialogOpen = true;
		AppState.addChannelDialogOptions = { channelType, forCategoryId };
	}

	static closeAddChannelDialog() {
		AppState.isAddChannelDialogOpen = false;
		AppState.addChannelDialogOptions = null;
	}

	static openEditChannelDialog(channel: ChannelWithMessages) {
		AppState.isEditChannelDialogOpen = true;
		AppState.channelToEdit = channel;
	}

	static closeEditChannelDialog() {
		AppState.isEditChannelDialogOpen = false;
		AppState.channelToEdit = null;
	}

	static openDeleteChannelDialog(channel: ChannelWithMessages) {
		console.log(channel);
		AppState.isDeleteChannelDialogOpen = true;
		AppState.channelToDelete = channel;
	}

	static closeDeleteChannelDialog() {
		AppState.isDeleteChannelDialogOpen = false;
		AppState.channelToDelete = null;
	}

	// ------ OTHER ------

	static openSettingsDialog() {
		AppState.isSettingsDialogOpen = true;
	}
}

/**
 * Returns the color class for the user activity status
 */
export const getUserActivityColor = (status: USER_ACTIVITY_STATUS_VALUES | (number & {})) => {
	switch (status) {
		case USER_ACTIVITY_STATUS.Online:
			return 'status-online';
		case USER_ACTIVITY_STATUS.Away:
			return 'status-away'
		case USER_ACTIVITY_STATUS.Offline:
			return 'status-offline'
		case USER_ACTIVITY_STATUS.Do_Not_Disturb:
			return 'status-dnd'
		default:
			return 'status-offline'
	}
}

export const createMediaFormdata = (file: File, purpose: MediaPurposeValues) => {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('purpose', purpose.toString());
	return formData;
}

export const getMediaUrl = (filename: string, purpose: MediaPurposeValues) => {
	let folder = '';
	if (purpose === MEDIA_PURPOSE.profileImage) folder = MEDIA_FOLDERS.profileImages;
	else if (purpose === MEDIA_PURPOSE.bannerImage) folder = MEDIA_FOLDERS.bannerImages;

	return `uploads/${folder}/${filename}`;
}