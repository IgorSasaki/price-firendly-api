import { Router } from 'express'

import { SessionClass } from '../services/Auth/Session/index.service'

const AuthRouter = Router()

AuthRouter.post('/', async (request, response) => {
  const requestBody = request.body

  const responseData = await SessionClass.create(requestBody)

  response.json(responseData)
})

export default AuthRouter
