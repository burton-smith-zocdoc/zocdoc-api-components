import CoreSkeleton from '@charm-ux/core/components/skeleton/skeleton.js';
import { project } from '@charm-ux/core';
import styles from './skeleton.styles.js';

/**
 * A placeholder shown while content is loading.
 *
 * @tag zd-skeleton
 */
export class ZdSkeleton extends CoreSkeleton {
  static override styles = [...super.styles, styles] as typeof CoreSkeleton.styles;
}

project.scope.registerComponent(ZdSkeleton);
