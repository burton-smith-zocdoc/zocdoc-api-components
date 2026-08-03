import CoreSkeleton from '@charm-ux/core/components/skeleton/skeleton.js';
import { project } from '@charm-ux/core';
import styles from './skeleton.styles.js';

/**
 * Skeleton component for content placeholders.
 *
 * @tag zd-skeleton
 * @summary Placeholder element shown while content is loading.
 */
export class ZdSkeleton extends CoreSkeleton {
  static override styles = [...super.styles, styles] as typeof CoreSkeleton.styles;
}

project.scope.registerComponent(ZdSkeleton);
