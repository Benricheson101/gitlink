import {FastifyInstance, FastifyPluginOptions} from 'fastify';

import {
  DiscordRESTClient,
  GitHubRESTClient,
  errorResponse,
  GitLinkMetadata,
  getGitHubAuthURL,
  requireAuth,
} from 'gitlink';

import {GITHUB_SCOPES} from 'gitlink/constants';

export const loadAuthRoutes = (
  server: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: () => void
) => {
  server.get<{Querystring: {code: string}}>(
    '/discord/callback',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            code: {type: 'string'},
          },
          required: ['code'],
        },
      },
    },

    async (req, reply) => {
      const code = req.query.code;
      const client = await DiscordRESTClient.exchangeCode(code);
      const sID = await req.server.sessions.create({
        accessToken: client.accessToken,
        refreshToken: client.refreshToken,
        scopes: client.scopes,
        expiresAt: client.expiresAt,
      });

      // TODO: handle
      if (!sID) {
        return reply.code(500).send(errorResponse('Failed to create session'));
      }

      reply.setCookie('sessionID', sID, {
        path: '/',
        httpOnly: true,
        secure: true,
      });

      return reply.redirect(
        302,
        getGitHubAuthURL({
          scopes: GITHUB_SCOPES,
          state: sID,
        })
      );
    }
  );

  server.get<{Querystring: {code: string; state: string}}>(
    '/github/callback',
    {
      preHandler: [requireAuth],
      schema: {
        querystring: {
          type: 'object',
          properties: {
            code: {type: 'string'},
            state: {type: 'string'},
          },
          required: ['code', 'state'],
        },
      },
    },

    async (req, reply) => {
      const {code, state} = req.query;

      const session = req.session!;
      const sessionID = req.sessionID!;

      if (sessionID !== state) {
        return reply
          .status(400)
          .send(errorResponse('invalid state or session ID'));
      }

      const ghClient = await GitHubRESTClient.login(code);

      const dClient = new DiscordRESTClient({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
        scopes: session.scopes,
      });

      const getData = [
        ghClient.getUser(),
        ghClient.getStarredRepoCount(),
        ghClient.getRepoStats(),
      ] as const;

      try {
        const [{data: ghUser}, starredCount, repoStats] = await Promise.all<
          typeof getData
        >(getData);

        const metadata: GitLinkMetadata = {
          stars_given: starredCount?.toString() || '0',
          stars_received: repoStats?.starsReceived?.toString() || '0',
          account_created_at: ghUser.created_at,
          owned_repos: (
            (ghUser.owned_private_repos || 0) + ghUser.public_repos
          ).toString(),
        };

        try {
          await dClient.updateUserMedatada(metadata, ghUser.login);
          return reply.redirect(302, '/success');
        } catch (err) {
          return err;
        }
      } catch (err) {
        return err;
      }
    }
  );

  done();
};
