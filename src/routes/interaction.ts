import {
  APIInteraction,
  APIInteractionResponse,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
} from 'discord-api-types/v10';
import {FastifyInstance, FastifyPluginOptions} from 'fastify';

import {verifyInteraction} from 'gitlink';

export const loadInteractionRoutes = (
  server: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: () => void
) => {
  server.post<{
    Headers: {
      'x-signature-ed25519': string;
      'x-signature-timestamp': string;
    };
    Body: APIInteraction;
  }>(
    '/interactions',
    {
      preHandler: [verifyInteraction],
      schema: {
        headers: {
          type: 'object',
          properties: {
            'X-Signature-Ed25519': {type: 'string'},
            'X-Signature-Timestamp': {type: 'string'},
          },
          required: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      },
    },
    async (req, reply) => {
      const i = req.body;

      switch (i.type) {
        case InteractionType.ApplicationCommand: {
          switch (i.data.type) {
            case ApplicationCommandType.ChatInput: {
              switch (i.data.name) {
                case 'ping': {
                  return reply.status(200).send({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                      flags: MessageFlags.Ephemeral,
                      content: ':ping_pong: Pong!',
                    },
                  } as APIInteractionResponse);
                }

                case 'refresh': {
                  return reply.status(200).send({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                      flags: MessageFlags.Ephemeral,
                      content:
                        'To update your stats, re-authorize your Discord account by visiting: https://gitlink.dev/login',
                    },
                  } as APIInteractionResponse);
                }
              }

              break;
            }
          }

          break;
        }
      }

      // should never happen
      return reply.status(400).send();
    }
  );

  done();
};
