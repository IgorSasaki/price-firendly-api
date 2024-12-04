import { Router } from 'express'

import CreateInvoiceService from '../services/Invoice/CreateInvoice/index.service'

const AppRouter = Router()

AppRouter.post('/invoice', async (request, response) => {
  const requestBody = request.body

  const responseData = await CreateInvoiceService.create(requestBody)

  response.json(responseData)
})

export default AppRouter
