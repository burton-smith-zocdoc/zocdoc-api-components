import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

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
  fs.mkdirp(outDir);

  const report: WriteReport = { written: [], unchanged: [], pruned: [] };

  for (const [name, content] of files) {
    const path = join(outDir, name);
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
