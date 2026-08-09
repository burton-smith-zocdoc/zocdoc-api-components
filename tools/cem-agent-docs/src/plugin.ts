import { generateAgentDocs } from './generate.ts';
import type { AgentDocsConfig, Package } from './types.ts';
import { nodeFileSystem, type FileSystem } from './write.ts';

export interface CemPlugin {
  name: string;
  packageLinkPhase(params: { customElementsManifest: Package }): void;
}

/**
 * The analyzer adapter. Register it LAST in a package's plugin list: by `packageLinkPhase`
 * the jsdoc-tags, cem-inheritance, type-parser, module-path-resolver, css-prefix, and
 * cem-sorter plugins have finished mutating the manifest, so this reads a finished artifact.
 *
 * Register it only in the per-package configs, never at the root — the root run covers both
 * packages, so a root registration would generate every component twice.
 *
 * It writes files and returns nothing. It never mutates the manifest.
 */
export function agentDocsPlugin(
  config: AgentDocsConfig,
  fs: FileSystem = nodeFileSystem
): CemPlugin {
  return {
    name: 'agent-docs',
    packageLinkPhase({ customElementsManifest }) {
      generateAgentDocs(customElementsManifest, config, fs);
    },
  };
}
