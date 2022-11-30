import {encode as encodeQS} from 'node:querystring';

import {fetch} from 'undici';

export const exchangeCode = async (options: {
  clientID: string;
  clientSecret: string;
  code: string;
  endpoint: string;
  redirectURI?: string;
}) => {
  const body = encodeQS({
    code: options.code,
    client_id: options.clientID,
    client_secret: options.clientSecret,
    grant_type: 'authorization_code',
    redirect_uri: options.redirectURI,
  });

  const resp = await fetch(options.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  });

  return resp;
};

export const refreshToken = async (options: {
  refreshToken: string;
  clientID: string;
  clientSecret: string;
  endpoint: string;
  redirectURI?: string;
}) => {
  const body = encodeQS({
    refresh_token: options.refreshToken,
    client_id: options.clientID,
    client_secret: options.clientSecret,
    grant_type: 'refresh_token',
    redirect_uri: options.redirectURI,
  });

  const resp = await fetch(options.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  });

  return resp;
};
