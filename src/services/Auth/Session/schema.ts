import yup from '../../../utils/helpers/yupConfig'

export const ValidationSchema = yup.object().shape({
  email: yup.string().trim().required().emailValidation('email is invalid'),
  password: yup.string().trim().required()
})
