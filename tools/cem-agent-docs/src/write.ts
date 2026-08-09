import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve, sep } from 'node:path';

/**
 * The only filesystem surface the generator uses. A port rather than direct `node:fs` calls
 * so tests run entirely in memory — no temp directories, and no way for a test to write into
 * the real skills tree.
 */
export interface FileSystem {
  read(path: string): string | null;
  write(path: string, content: string): void;
  remove(path: string): void;
  list(path: string): string[];
  mkdirp(path: string): void;
}

export const nodeFileSystem: FileSystem = {
  read(path) {
    return existsSync(path) ? readFileSync(path, 'utf-8') : null;
  },
  write(path, content) {
    writeFileSync(path, content, 'utf-8');
  },
  remove(path) {
    // Pruning only ever targets `*.md` files, but a directory named `notes.md` is possible on
    // disk. Recursively deleting a directory tree is a far worse failure than leaving a stray
    // one behind, so this skips directories rather than adding `recursive: true`.
    if (existsSync(path) && statSync(path).isDirectory()) return;
    rmSync(path, { force: true });
  },
  list(path) {
    return existsSync(path) ? readdirSync(path) : [];
  },
  mkdirp(path) {
    mkdirSync(path, { recursive: true });
  },
};

export function memoryFileSystem(
  seed: Record<string, string> = {}
): FileSystem & { files: Map<string, string> } {
  const files = new Map(Object.entries(seed));
  return {
    files,
    read(path) {
      return files.get(path) ?? null;
    },
    write(path, content) {
      files.set(path, content);
    },
    remove(path) {
      files.delete(path);
    },
    list(path) {
      const prefix = `${path}/`;
      return [...files.keys()]
        .filter((key) => key.startsWith(prefix) && !key.slice(prefix.length).includes('/'))
        .map((key) => key.slice(prefix.length));
    },
    mkdirp() {
      // Directories are implicit in a flat map.
    },
  };
}

export interface WriteReport {
  written: string[];
  unchanged: string[];
  pruned: string[];
}

/**
 * Resolve `name` against `outDir` and confirm the result is still contained within it.
 * `outDir` is the only directory this module has write authority over, so a `files` map key
 * such as `../evil.md` must be rejected rather than silently escaping it.
 */
function resolveContained(outDir: string, name: string): string {
  const path = join(outDir, name);
  const resolvedOutDir = resolve(outDir);
  const resolvedPath = resolve(path);
  if (resolvedPath !== resolvedOutDir && !resolvedPath.startsWith(resolvedOutDir + sep)) {
    throw new Error(`Refusing to write "${name}": resolves outside outDir "${outDir}"`);
  }
  return path;
}

/**
 * Write the generated pages and remove orphans.
 *
 * Byte-identical content is not rewritten: `analyze` runs on every build, and touching
 * unchanged files would dirty the tree and make the CI freshness check useless.
 *
 * Pruning is confined to `*.md` directly inside `outDir`, which is `references/` — never the
 * directory holding the hand-written `SKILL.md`.
 */
export function writeDocs(
  outDir: string,
  files: Map<string, string>,
  fs: FileSystem
): WriteReport {
  // Resolve and validate every path before touching the filesystem, so one bad name in the
  // map can't cause a partial write of the entries that come before it in iteration order.
  const paths = new Map<string, string>();
  for (const name of files.keys()) {
    paths.set(name, resolveContained(outDir, name));
  }

  fs.mkdirp(outDir);

  const report: WriteReport = { written: [], unchanged: [], pruned: [] };

  for (const [name, content] of files) {
    const path = paths.get(name)!;
    if (fs.read(path) === content) {
      report.unchanged.push(path);
      continue;
    }
    fs.write(path, content);
    report.written.push(path);
  }

  for (const name of fs.list(outDir)) {
    if (!name.endsWith('.md') || files.has(name)) continue;
    const path = join(outDir, name);
    fs.remove(path);
    report.pruned.push(path);
  }

  report.written.sort();
  report.unchanged.sort();
  report.pruned.sort();
  return report;
}
