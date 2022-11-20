import {encode as encodeQS} from 'node:querystring';

import {Octokit} from '@octokit/rest';
import {Endpoints} from '@octokit/types';
import {fetch} from 'undici';

const getLastPageNumber = (linkHeader: string) => {
  const LAST_PAGE_REGEX =
    /<https:\/\/[a-z0-9./?&=_]+[?&]page=(\d+)>;\srel="last"/;

  const lastPageMatch = linkHeader.match(LAST_PAGE_REGEX);
  if (!lastPageMatch) {
    console.error('failed to find last page');
    return 0;
  }

  return parseInt(lastPageMatch[1]) || 1;
};

export class GitHubRESTClient {
  constructor(readonly octokit: Octokit) {}

  async getUser(): Promise<Endpoints['GET /user']['response']> {
    return this.octokit.users.getAuthenticated();
  }

  async getUserRepos() {
    return this.octokit.paginate('GET /user/repos');
  }

  async getStarredRepoCount() {
    const r = await this.octokit.request({url: '/user/starred?per_page=1'});
    const linkHeader = r.headers.link;

    if (!linkHeader) {
      return 0;
    }

    const pages = getLastPageNumber(linkHeader);
    return pages - 1;
  }

  async getRepoStats() {
    const allRepos = await this.octokit.paginate('GET /user/repos', {
      affiliation: 'owner,collaborator,organization_member',
    });

    const stats = allRepos.reduce(
      (a, c) => {
        a.starsReceived += c.stargazers_count;
        a.timesForked += c.forks;

        if (c.fork) {
          a.reposForked += 1;
        }

        return a;
      },
      {starsReceived: 0, timesForked: 0, reposForked: 0}
    );

    return stats;
  }

  static async login(code: string) {
    const {access_token} = await this.exchangeCode(code);

    const octokit = new Octokit({
      auth: access_token,
      userAgent: 'GitLink',
      request: {
        fetch,
      },
    });

    return new this(octokit);
  }

  static async exchangeCode(code: string) {
    const ENDPOINT = 'https://github.com/login/oauth/access_token';

    const resp = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'GitLink',
        Accept: 'application/vnd.github+json',
      },
      body: encodeQS({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }).then(r => r.json() as Promise<GitHubCodeExchangeResponse>);

    return resp;
  }
}

export interface GitHubCodeExchangeResponse {
  access_token: string;
  token_type: 'bearer';
  scope: string;
}
