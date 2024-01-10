// NodeJS Build
const NODE_FIX = 'import { createRequire as createImportMetaRequire } from "module"; import.meta.require ||= (id) => createImportMetaRequire(import.meta.url)(id);\n';
const nodeBuild = await Bun.build({
  entrypoints: ['./index.ts'],
  target: 'node',
  minify: true,
  outdir: '../docker/',
  naming: '[dir]/[name].m[ext]'
});

// Write output files
for (const result of nodeBuild.outputs) {
  const fileContent = NODE_FIX + await result.text();
  await Bun.write(result.path, fileContent);
}
