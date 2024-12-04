import { Router } from 'express'

import ensureAuthenticated from '../middlewares/ensureAuthenticated'
import { CreateUserService } from '../services/User/CreateUser/index.service'
import { UpdateUserService } from '../services/User/UpdateUser/index.service'

const UserRouter = Router()

UserRouter.post('/', async (request, response) => {
  const requestBody = request.body

  const responseData = await CreateUserService.create(requestBody)

  response.json(responseData)
})

UserRouter.put('/', ensureAuthenticated, async (request, response) => {
  const userId = request.user.userId
  const requestBody = request.body

  const responseData = await UpdateUserService.create({
    ...requestBody,
    userId
  })

  response.json(responseData)
})

export default UserRouter
