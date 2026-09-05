
import 'dotenv/config'

import { OsuToken } from './types.js';
import { save_token } from '../token.js';
import { randomBytes } from 'crypto';
import { Express } from 'express'

import open from 'open'


// it is important you register an oauth application in https://osu.ppy.sh/home/account/edit
// and put the client id and secret into a .env file

const OSU_CLIENT_ID = process.env.OSU_CLIENT_ID!;
const OSU_CLIENT_SECRET = process.env.OSU_CLIENT_SECRET!;


// for convenience, I make you put your redirect url into the .env aswell
// remember adding YOUR_URL/callback to the callback urls of your application

const HOST_URL = process.env.HOST_URL!;


// to get the multiplayer.write_manage scope available, we need to authenticate through
// authorization code grant method

// see https://osu.ppy.sh/docs/#authorization-code-grant for details

// for safety reasons, we will be using a state value
export function makeOsuAuthReqLink(state: string): string
{
  const params = new URLSearchParams({
    client_id: OSU_CLIENT_ID,
    redirect_uri: new URL('/callback', HOST_URL).toString(),
    response_type: 'code',
    scope: 'public multiplayer.write_manage',
    state
  }).toString();

  return `https://osu.ppy.sh/oauth/authorize?${params}`
}

// once we have a code, we can exchange it to get the actual access token
// more infos on https://osu.ppy.sh/docs/#authorization-code-grant
export async function exchangeCodeForToken(code: string): Promise<OsuToken>
{
  const res = await fetch('https://osu.ppy.sh/oauth/token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: OSU_CLIENT_ID,
      client_secret: OSU_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: new URL('/callback', HOST_URL).toString()
    })
  });

  if (!res.ok) throw new Error(`Couldn't get token from osu : ${res.statusText}`);

  return await res.json();
}


// we handle the authentication process here

let pendingState: string | null = null;
let resolveSession: (() => void) | null = null;

export function initOsuSession(): Promise<void>
{
  pendingState = randomBytes(16).toString('hex');
  open(makeOsuAuthReqLink(pendingState));

  return new Promise((resolve) => { resolveSession = resolve });
}

export function registerAuthRoutes(app: Express) {
  app.get('/callback', async (req, res) => {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string' || state !== pendingState)
      return res.status(406).send('Invalid query callback');
  
    try {
      const token = await exchangeCodeForToken(code);
      save_token(token);
      pendingState = null;
    
      const result = await fetch('https://osu.ppy.sh/api/v2/me', { // get our information for logging
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.access_token}`
        }
      });
      if (!result.ok)
        throw new Error('Unable to get osu self informations...');
      const { username, id } = await result.json();
      console.log(`Authenticated as ${username} (${id})`);

      resolveSession?.(); // signal "done" to initOsuSession()
      return res.status(200).send('Authorized, you can close the tab');
    }
    catch (err) {
      console.error(err);
      return res.status(500).send('Something went wrong, check logs...');
    }
  });
}