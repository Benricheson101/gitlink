import {FastifyInstance, FastifyPluginOptions} from 'fastify';

import {getGitHubAuthURL, requireAuth} from 'gitlink';
import {GITHUB_SCOPES} from 'gitlink/constants';

const REDIRECTS: {[path: string]: string} = {
  '': 'https://github.com/benricheson101/GitLink',
  support: 'https://discord.gg/ABwYM9y6Sm',
  privacy: 'https://github.com/Benricheson101/gitlink/blob/main/PRIVACY.yml',
  invite: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=268435456&scope=bot%20applications.commands`,
};

export const loadRedirectRoutes = (
  server: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: () => void
) => {
  server.get<{
    Params: {
      slug: string;
    };
  }>('/:slug', async (req, reply) => {
    const slug = req.params.slug;

    if (!(slug in REDIRECTS)) {
      return reply.status(404).send('Not Found');
    }

    return reply.redirect(302, REDIRECTS[slug]);
  });

  // checks if the user is already logged in to Discord
  // allowing them to skip the Discord auth flow, and
  // going straight to GitHub
  server.get(
    '/login',
    {
      preHandler: [requireAuth(true)],
    },
    (req, reply) => {
      const sID = req.sessionID!;

      return reply.redirect(
        302,
        getGitHubAuthURL({
          scopes: GITHUB_SCOPES,
          state: sID,
        })
      );
    }
  );

  done();
};
