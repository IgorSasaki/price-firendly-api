import { Router } from 'express'

import AuthRouter from './auth.routes'
import InvoicesRouter from './invoices.routes'
import UserRouter from './users.routes'

const AppRouter = Router()

AppRouter.use('/auth', AuthRouter)
AppRouter.use('/invoices', InvoicesRouter)
AppRouter.use('/users', UserRouter)

export default AppRouter
