import { Router } from 'express'

import CreateInvoiceService from '../services/Invoice/CreateInvoice/index.service'

const InvoicesRouter = Router()

InvoicesRouter.post('/', async (request, response) => {
  const requestBody = request.body

  const responseData = await CreateInvoiceService.create(requestBody)

  response.json(responseData)
})

export default InvoicesRouter
