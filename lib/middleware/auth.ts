import {FastifyReply, FastifyRequest} from 'fastify';
import {errorResponse} from 'lib/util';

export const requireAuth = async (req: FastifyRequest, reply: FastifyReply) => {
  const sessions = req.server.sessions;

  const sessionID = req.cookies.sessionID;
  if (!sessionID) {
    return reply.code(401).send(errorResponse('unauthorized'));
  }

  const session = await sessions.get(sessionID);
  if (!session) {
    return reply.code(401).send(errorResponse('unauthorized'));
  }

  req.sessionID = sessionID;
  req.session = session;

  return;
};
