import 'dotenv/config'
import 'express-async-errors'
import './firebase.ts'
import * as configRoutes from './configRoutes.ts'
import cors from 'cors'
import { errorMiddleware } from '../middlewares/errorMiddleware.ts'
import express from 'express'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

configRoutes.setup(app)
app.use(errorMiddleware)

export { app }
