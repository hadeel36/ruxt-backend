CRUX Dashboard Backend

To run, you would need node/npm(https://nodejs.org/en/) and Docker(http://docker.io/) installed. 

To run in development mode

```bash
docker-compose up # in one terminal
npm install # in another terminal
npm run watch
```

To build
```bash
npm run build
```

To start in production mode (set env variables properly)
```bash
npm start
```