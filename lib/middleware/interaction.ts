import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
} from 'discord-api-types/v10';
import {FastifyReply} from 'fastify';
import {FastifyRequest} from 'fastify';
import {PlatformAlgorithm, verify} from 'discord-verify/node';
import {webcrypto} from 'crypto';

export const verifyInteraction = async (
  req: FastifyRequest<{
    Headers: {
      'x-signature-ed25519': string;
      'x-signature-timestamp': string;
    };
    Body: APIInteraction;
  }>,
  reply: FastifyReply
) => {
  if (req.method !== 'POST') {
    return reply.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['x-signature-ed25519'];
  const ts = req.headers['x-signature-timestamp'];
  const body = JSON.stringify(req.body);

  const isValid = await verify(
    body,
    sig,
    ts,
    process.env.DISCORD_PUBLIC_KEY,
    webcrypto.subtle,
    PlatformAlgorithm.NewNode
  );

  if (!isValid) {
    return reply.status(401).send('Unauthorized');
  }

  if (req.body.type === InteractionType.Ping) {
    return reply.status(200).send({
      type: InteractionResponseType.Pong,
    } as APIInteractionResponse);
  }

  return;
};
