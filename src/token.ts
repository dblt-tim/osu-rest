
import { OsuToken } from "./libosu/types.js";


export interface Token {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}  


export function save_token(token: OsuToken)
{ 
  // TODO
}

export function read_token(): Token
{
  // TODO
  return {access_token: '', refresh_token: '', expires_at: 0}; // placeholder
}

export function getValidToken(): string // we directly return the access token
{
  // TODO
  return ''; // placeholder
}