# visits-counter

A small Express service that renders an SVG visit counter badge.

## Usage

Embed the badge on a page whose host is listed in `ALLOWED_HOSTS`:

```html
<img src="https://counter.example.com/counter/my-page" alt="visits" />
```

Each request increments the counter named `my-page` and returns an SVG.

Query parameters:

| Parameter | Default         | Description                                        |
| --------- | --------------- | -------------------------------------------------- |
| `color`   | `black`         | Named color (`red`) or hex (`%23ff0000`)           |
| `height`  | `14`            | Height in px, 1–1000                               |
| `width`   | from the height | Width in px, 1–1000; by default it fits the number |

`GET /` lists all counters.

## Configuration

| Variable        | Default          | Description                                                            |
| --------------- | ---------------- | ---------------------------------------------------------------------- |
| `ALLOWED_HOSTS` | `localhost`      | Comma-separated hosts allowed in `Referer`; subdomains are allowed too |
| `DB_PATH`       | `./data.sqlite3` | SQLite database file (`/data/data.sqlite3` in Docker)                  |
| `PORT`          | `3000`           | HTTP port                                                              |
| `DEBUG`         | unset            | Set to any value to enable request logging                             |

Migrations run automatically on startup.

## Development

```sh
npm install
npm start
npm test
npm run lint
npm run format
```

## Docker

```sh
docker build -t visits-counter .
docker run -d -p 3000:3000 -v counter-data:/data -e ALLOWED_HOSTS=example.com visits-counter
```
