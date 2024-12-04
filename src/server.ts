import dotenv from 'dotenv'
import express, { Express, NextFunction, Request, Response } from 'express'
import serverless from 'serverless-http'

import 'express-async-errors'

import ensureCorsOrigin from './middlewares/ensureCorsOrigin'
import ensureErrors from './middlewares/ensureErrors'
import AppRouter from './routes/index.routes'

dotenv.config()

const app: Express = express()

app.use(ensureCorsOrigin)
app.use(express.json())

app.use(AppRouter)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  ensureErrors(error, req, res, next)
})

module.exports.handler = serverless(app)
