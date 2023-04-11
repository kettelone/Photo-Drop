import dotenv from 'dotenv'
dotenv.config()
import express, { Express } from 'express'
import cors from 'cors'
import sequelize from './db'
import router from './routes/index'
import apiErrorHandler from './middleware/errorrHandlingMiddleware'

const app: Express = express()
app.use(cors()) // enables to send request from browser
app.use(express.json()) //enables to parse json
app.use('/api', router)
app.use(apiErrorHandler) // Error handler middleware. Shoud be the last middleware

const { PORT } = process.env
const start = async () => {
	try {
		await sequelize.authenticate()
		await sequelize.sync() // checks the db with the schema
		// sync({ force: true }) - deletes everything!!!
		app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
	} catch (e) {
		console.log(e)
	}
}

start()
