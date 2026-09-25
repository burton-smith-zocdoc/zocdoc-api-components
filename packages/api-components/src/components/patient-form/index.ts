import { project } from '@zocdoc/api-primitive-components';
import { ZdPatientForm } from './patient-form.js';

project.scope.registerComponent(ZdPatientForm);

export { ZdPatientForm };
export type {
  PatientFormErrors,
  PatientFormField,
  PatientSubmitDetail,
  ZdPatientFormEventMap,
} from './patient-form.js';
