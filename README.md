
> [!CAUTION]
> As of right now, this program is not usable, I am actively developing it and you can see the progress in the [roadmap](#roadmap)

# Osu!Rest

Exposing osu! SignalR referee hub API through a REST API http server
> I struggled with SignalR so you don't have to

___
***Disclaimer:** This is a community-made project, it is not affiliated with, endorsed by or associated with ppy Pty Ltd or osu!.
Users are responsible for adhering to the [osu! API Terms Of Use](https://osu.ppy.sh/docs/#terms-of-use)
and are familiar with the fact that exceeding the API limitations may lead to your access token being revoked or even restricted*
___

## Useful links

the osu!web documentation : https://osu.ppy.sh/docs  
the osu!spectator referee hub documentation : https://ppy.sh/osu-server-spectator/referee-hub-api.html

> [!IMPORTANT]
> the referee hub documentation states that the API is in **active development** and therefore is considered **unstable**, the program may break and be unusable until I fix it

# Roadmap

- [x] handling osu! authentication process
- [ ] locally store the access token and handle token refresh
- [ ] connect to the spectator hub via SignalR
- [ ] handle requests
- [ ] send events

# How to run

For the people who are unfamiliar with nodeJS, after cloning the repository run :
```bash
npm i
```
then look at `package.json` into the `"scripts"` field for scripts that you can run with :
```bash
npm run <script name>
```
## Environment variables

Create a `.env` file in the root directory with the following keys:
```env
OSU_CLIENT_ID=
OSU_CLIENT_SECRET=
HOST_URL=
PORT=
```
see `.env.example` and `src/libosu/auth.ts` for more information
