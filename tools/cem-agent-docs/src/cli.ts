import { generateAgentDocs } from './generate.ts';
import type { Package } from './types.ts';
import { nodeFileSystem, type FileSystem, type WriteReport } from './write.ts';

function parseArgs(argv: string[]): { manifest: string; packageName: string; out: string } {
  const get = (flag: string): string => {
    const i = argv.indexOf(flag);
    if (i === -1 || i + 1 >= argv.length) throw new Error(`agent-docs: missing ${flag}`);
    return argv[i + 1];
  };
  return { manifest: get('--manifest'), packageName: get('--package'), out: get('--out') };
}

export function runCli(argv: string[], fs: FileSystem = nodeFileSystem): WriteReport {
  const { manifest, packageName, out } = parseArgs(argv);
  const raw = fs.read(manifest);
  if (raw === null) throw new Error(`agent-docs: manifest not found at "${manifest}"`);
  const parsed = JSON.parse(raw) as Package;
  return generateAgentDocs(parsed, { packageName, outDir: out }, fs);
}

// Direct-run entry: `node cli.js --manifest ... --package ... --out ...`
if (import.meta.url === `file://${process.argv[1]}`) {
  const report = runCli(process.argv.slice(2));
  console.log(`agent-docs: ${report.written.length} written, ${report.pruned.length} pruned`);
}
