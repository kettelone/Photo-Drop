import { Optional, Model } from 'sequelize'

interface UserOTPAttributes {
	id: string
	phone: string
	otp: string
	otpCreated: number
}

interface UserOTPCreationAttributes
	extends Optional<UserOTPAttributes, 'id' | 'otpCreated'> {}
export interface UserOTPInstance
	extends Model<UserOTPAttributes, UserOTPCreationAttributes>,
		UserOTPAttributes {}
