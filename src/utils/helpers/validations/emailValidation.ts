import * as yup from 'yup'

import { REGEX_TO_GENERAL_EMAIL_FORMAT } from '../../../constants/regex/generalEmailFormat'

export function emailValidation(message: string) {
  return yup.string().test({
    name: 'emailValidation',
    message,
    test: function (value) {
      const { path, createError } = this

      if (value) {
        const currentEmail = value.toString().trim()

        if (!REGEX_TO_GENERAL_EMAIL_FORMAT.test(currentEmail)) {
          return createError({ path, message })
        }
      }

      return true
    }
  })
}
