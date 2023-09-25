import 'dotenv/config'
import 'express-async-errors'
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import * as configRoutes from './configRoutes'
import { errorMiddleware } from '../middlewares/errorMiddleware'
import './firebase'

const app = express()

app.use(cors())
app.use(express.json())

configRoutes.setup(app)
app.use(errorMiddleware)

export { app }
