import cookie from '@fastify/cookie';
import {fastify} from 'fastify';
import Redis from 'ioredis';

import {getDiscordAuthURL, SessionStore} from 'gitlink';

import {loadAuthRoutes} from './routes/auth';
import {loadUserRoutes} from './routes/user';
import {DISCORD_SCOPES} from 'gitlink/constants';

const main = async () => {
  const server = fastify({
    logger: true,
  });
  await server.register(cookie);

  const redis = new Redis();
  const sessionStore = new SessionStore(redis);

  await server.register(loadAuthRoutes, {prefix: '/auth'});
  await server.register(loadUserRoutes);

  server.get('/login', (_, reply) =>
    reply.redirect(
      302,
      getDiscordAuthURL({
        scopes: DISCORD_SCOPES,
      })
    )
  );

  server.decorate('sessions', sessionStore);
  server.decorateRequest('sessionID', null);
  server.decorateRequest('session', null);

  server.listen(
    {
      host: '0.0.0.0',
      port: 3000,
    },
    (err, addr) => {
      if (err) {
        console.error('Failed to start server:', err);
        throw err;
      }

      console.log(`Server listening on addr=${addr}`);
    }
  );
};

main().catch(console.error);
