import crypto from 'node:crypto';

import {Redis} from 'ioredis';

export const generateSessionID = () =>
  crypto.randomBytes(16).toString('base64url');

// TODO: expire sessions?

export class SessionStore {
  constructor(private client: Redis) {}

  #prefix(id: string) {
    return `session:${id}`;
  }

  async create(data: SessionData): Promise<string | null> {
    const sID = generateSessionID();
    const isSet = await this.set(sID, data);

    return isSet ? sID : null;
  }

  async get(id: string) {
    const session = await this.client.get(this.#prefix(id));
    if (!session) {
      return null;
    }

    return JSON.parse(session) as SessionData;
  }

  async set(id: string, data: SessionData) {
    const res = await this.client.set(this.#prefix(id), JSON.stringify(data));

    return res === 'OK';
  }

  async delete(id: string) {
    await this.client.del(this.#prefix(id));
  }
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  scopes: string[];
  expiresAt: number;
  userID?: string;
}
