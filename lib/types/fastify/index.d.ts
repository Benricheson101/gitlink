import {SessionData, SessionStore} from '../../struct/session';

declare module 'fastify' {
  export interface FastifyInstance {
    // added in src/index.ts
    /**
     * auth session storage
     */
    sessions: SessionStore;
  }

  export interface FastifyRequest {
    // added in lib/middleware/auth.ts
    /**
     * the session ID of the current request, available when using `requireAuth` middleware
     */
    sessionID: string | null;
    /**
     * the current session data, available when using `requireAuth` middleware
     */
    session?: SessionData | null;
  }
}
