import { project } from '@zocdoc/api-primitive-components';
import { ZdProviderSearch } from './provider-search.js';

project.scope.registerComponent(ZdProviderSearch);

export { ZdProviderSearch };
export type { ProviderResultsDetail, ZdProviderSearchEventMap } from './provider-search.js';
