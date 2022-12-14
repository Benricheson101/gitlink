import {FastifyInstance, FastifyPluginOptions} from 'fastify';

import {
  DiscordRESTClient,
  RESTError,
  errorResponse,
  requireAuth,
  successResponse,
} from 'gitlink';

export const loadUserRoutes = (
  server: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: () => void
) => {
  server.get(
    '/user',
    {preHandler: [requireAuth(false)]},
    async (req, reply) => {
      const session = req.session!;
      const dRest = new DiscordRESTClient(session);

      try {
        const user = await dRest.getUser();

        // this shouldn't happen
        if (!user) {
          return reply.status(500).send(errorResponse('invalid scope'));
        }

        return reply.status(200).send(successResponse(user));
      } catch (err) {
        if (err instanceof RESTError) {
          if (err.code === 401) {
            await req.server.sessions.delete(req.sessionID!);
            reply.clearCookie('sessionID');
            return reply.status(401).send(errorResponse('unauthorized'));
          }

          return reply.status(err.code).send(errorResponse(err.message));
        }

        return reply.status(500).send(errorResponse('unhandled error'));
      }
    }
  );

  done();
};
