import {ApplicationRoleConnectionMetadata} from 'discord-api-types/v10';
import {ApplicationRoleConnectionMetadataType} from 'gitlink/constants';

import {fetch} from 'undici';

const main = async () => {
  const metadata: ApplicationRoleConnectionMetadata = [
    {
      key: 'account_created_at',
      name: 'Creation Date',
      description: 'The minimum GitHub account age (days)',
      type: ApplicationRoleConnectionMetadataType.DateTimeGreaterThan,
    },
    {
      key: 'owned_repos',
      name: 'Owned Repositories',
      description: 'The minimum number of repositories the user must own',
      type: ApplicationRoleConnectionMetadataType.NumberGreaterThan,
    },
    {
      key: 'stars_given',
      name: 'Stars Given',
      description: 'The minimum number of repos the user must have starred',
      type: ApplicationRoleConnectionMetadataType.NumberGreaterThan,
    },
    {
      key: 'stars_received',
      name: 'Stars Received',
      description:
        'The minimum number of total stars the user must have recieved on all of their repos',
      type: ApplicationRoleConnectionMetadataType.NumberGreaterThan,
    },
    // {
    //   key: 'is_verified',
    //   name: 'GitLink Verified',
    //   description:
    //     'The user must have linked their GitHub account with GitLink',
    //   type: ApplicationRoleConnectionMetadataType.BooleanEqual,
    // },
    // {
    //   key: 'hireable',
    //   name: 'Hireable',
    //   description: 'The user\'s profile must be marked as "Available for Hire"',
    //   type: ApplicationRoleConnectionMetadataType.BooleanEqual,
    // },
    // {
    //   key: 'followers',
    //   name: 'Followers',
    //   description: 'The minimum number of followers the user must have',
    //   type: ApplicationRoleConnectionMetadataType.NumberGreaterThan,
    // },
  ];

  const created = await fetch(
    `https://discord.com/api/v10/applications/${process.env.DISCORD_CLIENT_ID}/role-connections/metadata`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      },

      body: JSON.stringify(metadata),
    }
  ).then(r => r.json());

  console.dir(created, {depth: null});
};

main().catch(e => console.dir(e, {depth: null}));
