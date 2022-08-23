import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// export default new Sequelize(
//   'photodrop',
//   'postgres',
//   'guestdxb2022',
//   {
//     host: 'photodropdb.cozbnpykax7t.eu-west-1.rds.amazonaws.com',
//     port: 5432,
//     dialect: 'postgres',
//   },
// );
const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USERNAME!,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    define: {
      timestamps: false,
    },
  },
);
// eslint-disable-next-line import/prefer-default-export
export default sequelize;
