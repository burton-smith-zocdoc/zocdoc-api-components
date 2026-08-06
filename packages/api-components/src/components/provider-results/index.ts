import { project } from '@powered-by-zocdoc/primitives';
import { ZdProviderResults } from './provider-results.js';

project.scope.registerComponent(ZdProviderResults);

export { ZdProviderResults };
export type {
  PageChangeDetail,
  ProviderDaySelectDetail,
  ProviderSelectDetail,
  ZdProviderResultsEventMap,
} from './provider-results.js';
