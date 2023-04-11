import dotenv from 'dotenv'
import * as pg from 'pg'
import { Sequelize } from 'sequelize'

dotenv.config()

const sequelize = new Sequelize(
	process.env.DB_NAME!,
	process.env.DB_USERNAME!,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		dialect: 'postgres',
		dialectModule: pg,
		define: {
			timestamps: true
		}
	}
)
export default sequelize
