import cookie from '@fastify/cookie';
import 'dotenv/config';
import {fastify} from 'fastify';
import Redis from 'ioredis';

import {SessionStore} from 'gitlink';

import {loadAuthRoutes} from './routes/auth';
import {loadInteractionRoutes} from './routes/interaction';
import {loadRedirectRoutes} from './routes/redirects';
import {loadUserRoutes} from './routes/user';

const main = async () => {
  const server = fastify({
    logger: true,
  });
  await server.register(cookie);

  const redis = new Redis({
    host: process.env.REDIS_HOST,
  });
  const sessionStore = new SessionStore(redis);

  await server.register(loadRedirectRoutes);
  await server.register(loadAuthRoutes, {prefix: '/auth'});
  await server.register(loadInteractionRoutes);
  await server.register(loadUserRoutes);

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
