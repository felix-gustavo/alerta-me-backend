import { Response, Router } from 'express'

const helloRoute = Router()

helloRoute.get('/', async (_, res: Response) => {
  res.json({ message: 'hello world with Typescript' })
})

export { helloRoute }
