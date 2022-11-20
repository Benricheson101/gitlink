import {encode as encodeQS} from 'node:querystring';

export const getGitHubAuthURL = ({
  scopes,
  state,
}: {
  scopes: string[];
  state: string;
}) => {
  const qs = encodeQS({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope: scopes.join(' '),
    state,
  });

  return `https://github.com/login/oauth/authorize?${qs}`;
};

export const getDiscordAuthURL = ({
  responseType = 'code',
  scopes,
  state,
}: {
  responseType?: string;
  scopes: string[];
  state?: string;
}) => {
  const qs = encodeQS({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: responseType,
    scope: scopes.join(' '),
    prompt: 'none',
    state,
  });

  return `https://discord.com/oauth2/authorize?${qs}`;
};
