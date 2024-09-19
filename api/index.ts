import { app } from '../src/config/app.ts'

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`server running on port ${PORT}`))

export default app
