import * as yup from 'yup'

import { REGEX_TO_DATE_BIRTH_FORMAT } from '../../../constants/regex/dateBirthFormat'

export function dateValidation(message: string) {
  return yup.string().test({
    name: 'dateValidation',
    message,
    test: function (value) {
      const { path, createError } = this

      if (value) {
        const currentDate = value.toString().trim()

        if (!REGEX_TO_DATE_BIRTH_FORMAT.test(currentDate)) {
          return createError({ path, message })
        }
      }

      return true
    }
  })
}
