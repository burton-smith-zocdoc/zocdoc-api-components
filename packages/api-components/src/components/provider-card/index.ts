import { project } from '@zocdoc/api-primitive-components';
import { ZdProviderCard } from './provider-card.js';

project.scope.registerComponent(ZdProviderCard);

export { ZdProviderCard };
export type {
  BookSelectDetail,
  ProfileRequestDetail,
  ZdProviderCardEventMap,
} from './provider-card.js';
