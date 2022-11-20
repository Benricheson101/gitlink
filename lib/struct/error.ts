import URL from 'node:url';

export class RESTError extends Error {
  constructor(
    public readonly method: string,
    public readonly code: number,
    url: string,
    public readonly response?: unknown
  ) {
    const u = URL.parse(url);

    super(`[OUTGOING] \`${method} ${u.pathname}\` responded with code ${code}`);
  }
}
