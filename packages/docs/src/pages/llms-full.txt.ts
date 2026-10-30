import type { APIRoute } from 'astro';
import { renderLlmsFull } from '../../../../tools/site-agent-docs/src/llms.ts';
import { loadSite } from '../llms.ts';

export const GET: APIRoute = async () =>
  new Response(renderLlmsFull(await loadSite()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
