import '@types/node';

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
      GITHUB_REDIRECT_URI: string;

      DISCORD_CLIENT_ID: string;
      DISCORD_CLIENT_SECRET: string;
      DISCORD_REDIRECT_URI: string;
      DISCORD_PUBLIC_KEY: string;
    }
  }
}
