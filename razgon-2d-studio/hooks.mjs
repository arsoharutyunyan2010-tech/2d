import { pathToFileURL } from 'node:url'; import path from 'node:path';
export async function resolve(spec, ctx, next) {
  const STUDIO = process.env.RAZGON_STUDIO, PROJECT = process.env.RAZGON_PROJECT;
  if (spec.startsWith('/engine/')) return next(pathToFileURL(path.join(STUDIO, spec.slice(1))).href, ctx);
  if (spec.startsWith('/node_modules/')) return next(pathToFileURL(path.join(STUDIO, spec.slice(1))).href, ctx);
  if (spec.startsWith('/project/')) return next(pathToFileURL(path.join(PROJECT, spec.slice(9))).href, ctx);
  return next(spec, ctx);
}
