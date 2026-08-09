# On The Holo

##### Customizable, self-hostable and secure messaging for you and your friends, so the government cannot spy on you.

## Development

1. Get Paseto public and private keys. Store them at `.env` in their respective fields.
> cd app/ && node generateKeys.js

2. Fill the .env variables

3. Start docker for db and redis
> sudo docker compose -p holo up -d

4. Start the development server
> npm run dev

## Production

1. Get Paseto public and private keys. Store them at `.env` in their respective fields.
> cd app/ && node generateKeys.js

2. Fill the .env variables

3. Start docker
> sudo docker compose -p holo --profile prod up -d --build

`--profile prod` will also run the sveltekit app

## What to do after deploying

1. Make the anchor tags in `register-form.svelte` point to your terms of service and privacy policy.

## TODO

- Add ratelimits