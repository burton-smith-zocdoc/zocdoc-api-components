import { project } from '@powered-by-zocdoc/primitives';
import { ZdPatientForm } from './patient-form.js';

project.scope.registerComponent(ZdPatientForm);

export { ZdPatientForm };
export type { PatientFormErrors, PatientFormField } from './patient-form.js';
