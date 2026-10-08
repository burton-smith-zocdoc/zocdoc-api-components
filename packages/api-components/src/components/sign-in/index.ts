import { project } from '@zocdoc/api-primitive-components';
import { ZdSignIn } from './sign-in.js';

project.scope.registerComponent(ZdSignIn);

export { ZdSignIn };
export type { SignInCompleteDetail, ZdSignInEventMap } from './sign-in.js';
