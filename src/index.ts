
import { initOsuSession, registerAuthRoutes } from './libosu/auth.js';
import express from 'express'


export const app = express();
registerAuthRoutes(app);

const PORT = process.env.PORT!;


app.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}.`);
});

// we have to wait for the authentication process
// because we don't have a valid access token
await initOsuSession();

// TODO