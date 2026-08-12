# On The Holo

##### Customizable, self-hostable and secure messaging for you and your friends, so the government cannot spy on you.

## Development

1. Copy the ```.env.example``` to `.env` and fill the variables except the PASETO ones.

```
  cp .env.example .env
```

2. Get Paseto public and private keys. Store them at `.env` in their respective fields.

```
  cd app/ && node generateKeys.js
```

3. Start docker for db and redis

```
  sudo docker compose -p holo up -d
```

4. Start the development server

```
  npm run dev
```

## Production

1. Copy the ```.env.example``` to `.env` and fill the variables except the PASETO ones.

```
  cp .env.example .env
```

2. Get Paseto public and private keys. Store them at `.env` in their respective fields.

```
  cd app/ && node generateKeys.js
```

3. Start docker

```
  sudo docker compose -p holo --profile prod up -d --build
```

`--profile prod` will also run the sveltekit app

## After deploying (Optional)

1. Make the anchor tags in `register-form.svelte` point to your terms of service and privacy policy.

## Customizing

Options coming soon

## Code conventions & understanding

- Global constant variables should be in `ROLE_DEFAULT_COLOR` format and always inside the `constants.ts` file.

- Global state should be in `AppState` format and always inside the `stores.svelte.ts` file.

- Database properties should be in `text_channel_id` format.

- This piece of software comes with many utility functions, use them.

## TODO

- Add ratelimits
- Add admin only actions
