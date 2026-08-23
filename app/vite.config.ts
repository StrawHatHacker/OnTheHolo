import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
			},
			adapter: adapter(),
			env: {
				// Tell sveltekit to look one directory up for .env file
				dir: '..',
			},
		}),

	],
	// Tell Vite to look one directory up for .env file
	envDir: path.resolve(import.meta.dirname, '..'),
	server: {
		fs: {
			allow: ['..', path.resolve('uploads')],
		},
	},
});
