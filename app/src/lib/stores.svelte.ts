import { UserCollection } from './resources.svelte';

export const Users = new UserCollection();

Users.set('1', {
	id: '1',
	username: 'Panos',
	email: 'panos@example.com',
});
Users.set('2', {
	id: '2',
	username: 'Teo',
	email: 'panos@example.com',
});
Users.set('3', {
	id: '3',
	username: 'Titos',
	email: 'panos@example.com',
});

export const Channels = $state([]);
