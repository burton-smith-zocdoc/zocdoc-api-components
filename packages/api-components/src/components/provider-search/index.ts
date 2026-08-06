import { project } from '@powered-by-zocdoc/primitives';
import { ZdProviderSearch } from './provider-search.js';

project.scope.registerComponent(ZdProviderSearch);

export { ZdProviderSearch };
export type { ProviderResultsDetail, ZdProviderSearchEventMap } from './provider-search.js';
