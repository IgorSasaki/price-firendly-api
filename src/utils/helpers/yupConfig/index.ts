import * as yup from 'yup'

import { dateValidation } from '../validations/dateValidation'
import { emailValidation } from '../validations/emailValidation'

declare module 'yup' {
  interface StringSchema {
    dateValidation(message: string): StringSchema
    emailValidation(message: string): StringSchema
  }
}

yup.addMethod(yup.string, 'dateValidation', dateValidation)
yup.addMethod(yup.string, 'emailValidation', emailValidation)

export default yup
