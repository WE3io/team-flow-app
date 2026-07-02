/**
 * Health check for Coolify's zero-downtime rolling deploys (handoff §8,
 * unit eng-coolify-singleimage). Returns 200 when the app can serve.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ status: 'ok' }, { status: 200 });
}
