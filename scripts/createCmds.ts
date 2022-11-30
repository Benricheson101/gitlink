import {RESTPutAPIApplicationCommandsJSONBody} from 'discord-api-types/v10';
import 'dotenv/config';
import {fetch} from 'undici';

const cmds: RESTPutAPIApplicationCommandsJSONBody = [
  {
    name: 'ping',
    description: 'Pong!',
  },
  {
    name: 'refresh',
    description: 'Refresh your GitHub statistics',
  },
  {
    name: 'support',
    description: 'Get a link to join the support server',
  },
];

const main = async () => {
  const created = await fetch(
    `https://discord.com/api/v10/applications/${process.env.DISCORD_CLIENT_ID}/commands`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      },

      body: JSON.stringify(cmds),
    }
  ).then(r => r.json());

  console.dir(created, {depth: null});
};

main().catch(console.error);
