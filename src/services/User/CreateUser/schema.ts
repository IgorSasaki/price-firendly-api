import yup from '../../../utils/helpers/yupConfig'

export const ValidationSchema = yup.object().shape({
  name: yup.string().trim().required(),
  email: yup.string().trim().required().emailValidation('email is invalid'),
  country: yup.string().trim().required(),
  phone: yup.string().trim().required(),
  password: yup.string().trim().required(),
  dateBirth: yup
    .string()
    .trim()
    .required()
    .dateValidation('dateBirth is invalid format')
})
