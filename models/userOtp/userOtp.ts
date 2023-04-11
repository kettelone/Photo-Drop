import { UserOTPInstance } from './interface'
import { DataTypes } from 'sequelize' // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../../db'

export const UserOTP = sequelize.define<UserOTPInstance>('userOTP', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	phone: { type: DataTypes.STRING, unique: true },
	otp: { type: DataTypes.STRING },
	otpCreated: { type: DataTypes.BIGINT }
})
