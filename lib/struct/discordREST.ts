import {
  ApplicationUserRoleConnection,
  APIUser as DiscordUser,
} from 'discord-api-types/v10';
import {fetch} from 'undici';

import {exchangeCode, refreshToken} from '../util/oauth';
import {RESTError} from './error';
import {SessionData} from './session';

const DEFAULT_HEADERS = {
  'User-Agent': 'GitLink',
};

const authHeaders = (c: DiscordRESTClient) => ({
  Authorization: `Bearer ${c.accessToken}`,
  ...DEFAULT_HEADERS,
});

export class DiscordRESTClient {
  static readonly clientID = process.env.DISCORD_CLIENT_ID;
  static readonly clientSecret = process.env.DISCORD_CLIENT_SECRET;
  static readonly redirectURI = process.env.DISCORD_REDIRECT_URI;
  static readonly baseURL = 'https://discord.com/api/v10';

  accessToken: string;
  refreshToken: string;
  scopes: string[];
  expiresAt: number;

  constructor(readonly options: SessionData) {
    this.accessToken = options.accessToken;
    this.refreshToken = options.refreshToken;
    this.scopes = options.scopes;
    this.expiresAt = options.expiresAt;
  }

  async getUser() {
    if (!this.scopes.includes('identify')) {
      return null;
    }

    const ENDPOINT = `${DiscordRESTClient.baseURL}/users/@me`;

    const res = await fetch(ENDPOINT, {
      method: 'GET',
      headers: {
        ...authHeaders(this),
      },
    });

    // TODO: handle errors
    if (!res.ok) {
      const err = await res.json();
      console.error(
        '[DISCORD] Request to `GET /users/@me` responded with code',
        res.status + ':'
      );

      console.dir(err, {depth: null});

      throw new RESTError('GET', res.status, res.url, err);
    }

    const user = (await res.json()) as DiscordUser;
    return user;
  }

  async updateUserMedatada(
    metadata: GitLinkMetadata,
    username: string | null = null
  ) {
    const ENDPOINT = `${DiscordRESTClient.baseURL}/users/@me/applications/${process.env.DISCORD_CLIENT_ID}/role-connection`;

    const body: ApplicationUserRoleConnection<GitLinkMetadata> = {
      // TODO: should this be "GitLink"?
      platform_name: 'GitHub',
      platform_username: username,
      metadata,
    };

    const res = await fetch(ENDPOINT, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        ...authHeaders(this),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error(
        '[DISCORD] Request to `GET /users/@me/applications/:id/role-connection` responded with code',
        res.status + ':'
      );

      console.dir(err, {depth: null});

      throw new RESTError('PUT', res.status, res.url, err);
    }

    const json = await res.json();
    return json;
  }

  async refresh() {
    const res = await refreshToken({
      refreshToken: this.refreshToken,
      clientID: DiscordRESTClient.clientID,
      clientSecret: DiscordRESTClient.clientSecret,
      endpoint: `${DiscordRESTClient.baseURL}/oauth2/token`,
      redirectURI: DiscordRESTClient.redirectURI,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new RESTError('POST', res.status, res.url, data);
    }

    const data = (await res.json()) as DiscordOAuthCodeExchangeResponse;
    const at = res.headers.get('date') || new Date();
    const date = new Date(at);

    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.scopes = data.scope.split(' ');
    this.expiresAt = data.expires_in * 1000 + date.getTime();

    return data;
  }

  toSessionData(): SessionData {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      scopes: this.scopes,
      expiresAt: this.expiresAt,
    };
  }

  static async exchangeCode(code: string) {
    const res = await exchangeCode({
      code,
      clientID: this.clientID,
      clientSecret: this.clientSecret,
      endpoint: `${this.baseURL}/oauth2/token`,
      redirectURI: this.redirectURI,
    });

    // TODO: handle error
    if (!res.ok) {
      const data = await res.json();
      throw new RESTError('POST', res.status, res.url, data);
    }

    const data = (await res.json()) as DiscordOAuthCodeExchangeResponse;

    const at = res.headers.get('date') || new Date();
    const date = new Date(at);

    return new this({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      scopes: data.scope.split(' '),
      expiresAt: date.getTime() + data.expires_in * 1000,
    });
  }
}

export interface DiscordOAuthCodeExchangeResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: 'Bearer';
}

export type GitLinkMetadata = {
  stars_given: string; // int
  stars_received: string; // int
  owned_repos: string; // number
  account_created_at: string; // date
};
