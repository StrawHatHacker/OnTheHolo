import { error, redirect } from "@sveltejs/kit";
import { clsx, type ClassValue } from "clsx";
import { toast } from "svelte-sonner";
import { twMerge } from "tailwind-merge";
import { MAX_TOKEN_AGE_DAYS } from "./constants";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

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
        maxAge: 60 * 60 * 24 * MAX_TOKEN_AGE_DAYS,
    };
}

export const genericRequest = async (url: string, request: RequestInit, fetchFn: typeof fetch = fetch) => {
    const isFormData = request.body instanceof FormData;
    const headers: Record<string, string> = {
        'Accept-Language': typeof navigator !== 'undefined' ? navigator.language : 'en',
    };

    isFormData ?
        headers['Content-Type'] = 'multipart/form-data' :
        headers['Content-Type'] = 'application/json';

    const response = await fetchFn(url, request);

    if (response.status === 401) throw redirect(302, '/');

    if (!response.ok) {
        const data = await response.json();
        if (!data.message) throw new CError(response.status, 'Unexpected error');
        throw new CError(response.status, data.message);
    }

    return await response.json();
}

export const handleRequestError = (e: unknown) => {
    if (e instanceof CError) toast.error(e.message);
    else toast.error('Unexpected error');
}