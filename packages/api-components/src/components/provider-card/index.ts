import { project } from '@powered-by-zocdoc/primitives';
import { ZdProviderCard } from './provider-card.js';

project.scope.registerComponent(ZdProviderCard);

export { ZdProviderCard };
export type { ProfileRequestDetail, ZdProviderCardEventMap } from './provider-card.js';
