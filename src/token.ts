
import { OsuToken } from "./libosu/types.js";
import { readFileSync, writeFileSync, existsSync } from 'fs';

export interface Token {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}  

const TokenFile = '.token.json';


export function save_token(token: OsuToken)
{ 
  writeFileSync('.token.json', JSON.stringify({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: Date.now() + token.expires_in * 1000
  }))
}

export function read_token(): Token
{
  if (!existsSync())
    throw new Error("Couldn't read token");
  const s = readFileSync('.token.json').toString();
  return JSON.parse(s);
}

export async function getValidToken(): Promise<string> // we directly return the access token
{
  if (!existsSync(TokenFile)) {
    throw new Error("token file doesn't exist");
    return '';
  }

  let token: Token = read_token();

  if (token.expires_at > Date.now() - 30_000) { // we'll count 30 seconds close
    // we need to refresh the token
    const res = await fetch('https://osu.ppy.sh/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.OSU_CLIENT_ID!,
        client_secret: process.env.OSU_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token,
        redirect_uri: new URL('/callback', process.env.HOST_URL!).toString()
      })
    });
  
    if (!res.ok) throw new Error(`Couldn't get token from osu : ${res.statusText}`);

    save_token(await res.json());

    token = read_token();
  }

  return token.access_token;
}