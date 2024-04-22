import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import * as configRoutes from './configRoutes'
import { errorMiddleware } from '../middlewares/errorMiddleware'
import 'express-async-errors'
import './firebase'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

configRoutes.setup(app)
app.use(errorMiddleware)

export { app }
