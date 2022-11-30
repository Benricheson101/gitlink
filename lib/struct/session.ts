import crypto from 'node:crypto';

import {Redis} from 'ioredis';

export const generateSessionID = () =>
  crypto.randomBytes(16).toString('base64url');

const TTL = 60 * 60 * 24 * 30; // 30 days

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
    const session = await this.client
      .pipeline()
      .get(this.#prefix(id))
      .expire(this.#prefix(id), TTL)
      .exec();

    console.log(session);

    if (
      !session ||
      !session[0] ||
      session?.[0]?.[0] instanceof Error ||
      !session?.[0]?.[1]
    ) {
      return null;
    }

    return JSON.parse(session[0][1] as string) as SessionData;
  }

  async set(id: string, data: SessionData) {
    const res = await this.client.setex(
      this.#prefix(id),
      TTL,
      JSON.stringify(data)
    );

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
