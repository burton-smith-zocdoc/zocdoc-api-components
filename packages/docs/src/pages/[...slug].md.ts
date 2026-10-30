import type { APIRoute, GetStaticPaths } from 'astro';
import { loadPages } from '../llms.ts';

/** Every page in `llms.txt` as markdown, at its HTML URL with `.md` in place of the slash. */
export const getStaticPaths = (async () =>
  [...(await loadPages())].map(([slug, page]) => ({
    params: { slug },
    props: { markdown: page.markdown },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(props.markdown as string, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
