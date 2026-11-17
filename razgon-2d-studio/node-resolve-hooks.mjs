// node-resolve-hooks.mjs — lets scene files keep the plugin's web-style imports
//   '/engine/core.js'  ->  <studio>/engine/core.js
//   '/project/...'     ->  the current project directory
// Register with: module.register('./node-resolve-hooks.mjs', import.meta.url)
import { pathToFileURL } from 'node:url';
import path from 'node:path';

let STUDIO = process.cwd();
let PROJECT = process.cwd();
export function init({ studio, project }) { STUDIO = studio; PROJECT = project; }

export function resolve(specifier, context, next) {
  if (specifier.startsWith('/engine/')) return next(pathToFileURL(path.join(STUDIO, specifier.slice(1))).href, context);
  if (specifier.startsWith('/node_modules/')) return next(pathToFileURL(path.join(STUDIO, specifier.slice(1))).href, context);
  if (specifier.startsWith('/project/')) return next(pathToFileURL(path.join(PROJECT, specifier.slice(9))).href, context);
  return next(specifier, context);
}
