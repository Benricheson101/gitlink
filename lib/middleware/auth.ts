import {FastifyReply, FastifyRequest} from 'fastify';

import {DISCORD_SCOPES} from '../constants';
import {DiscordRESTClient, RESTError} from '../struct';
import {errorResponse, getDiscordAuthURL} from '../util';

export const requireAuth =
  (redirToLogin = false) =>
  async (req: FastifyRequest, reply: FastifyReply) => {
    const sessions = req.server.sessions;
    const loginURL = getDiscordAuthURL({scopes: DISCORD_SCOPES});

    const sessionID = req.cookies.sessionID;
    if (!sessionID) {
      if (redirToLogin) {
        return reply.redirect(302, loginURL);
      }

      return reply.status(401).send(errorResponse('unauthorized'));
    }

    const session = await sessions.get(sessionID);
    if (!session) {
      if (redirToLogin) {
        return reply.redirect(302, loginURL);
      }
      return reply.status(401).send(errorResponse('unauthorized'));
    }

    if (session.expiresAt <= Date.now()) {
      const dClient = new DiscordRESTClient(session);

      try {
        await dClient.refresh();
        await sessions.set(sessionID, dClient.toSessionData());
      } catch (e) {
        if (e instanceof RESTError) {
          console.error('Failed to refresh session token:', e);
          await sessions.delete(sessionID);

          if (redirToLogin) {
            return reply.redirect(302, loginURL);
          }

          return reply.status(401).send('unauthorized');
        }

        return reply.status(500).send();
      }
    }

    req.sessionID = sessionID;
    req.session = session;

    return;
  };
