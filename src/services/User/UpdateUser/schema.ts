import yup from '../../../utils/helpers/yupConfig'

export const ValidationSchema = yup.object().shape({
  name: yup.string().trim(),
  email: yup.string().trim().emailValidation('email is invalid'),
  country: yup.string().trim(),
  phone: yup.string().trim(),
  dateBirth: yup.string().trim().dateValidation('dateBirth is invalid format')
})
