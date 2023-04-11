import Stripe from 'stripe'
import { Response } from 'express'
import { UserAlbum } from '../../models/relations'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2022-08-01'
})

class PaymentService {
	async handlePayment(res: Response, data: { customer: string }) {
		const customer: any = await stripe.customers.retrieve(data.customer)
		if (customer) {
			const { userId, albumId } = customer.metadata as { [key: string]: string }
			const albumPaidExist = await UserAlbum.findOne({
				where: { userId, albumId }
			})
			if (albumPaidExist) {
				albumPaidExist.isPaid = true
				albumPaidExist.save()
				res.send().end()
				return
			}
			const albumPaid = await UserAlbum.create({
				userId,
				albumId,
				isPaid: true
			})
			console.log('albumPaid is: ', albumPaid)
			res.send().end()
		}
	}

	async generatePaymentLink(albumId: string, userId: string, host: string) {
		const albumItem = { id: 1, priceInCents: 500, name: 'Album' }
		const customer = await stripe.customers.create({
			metadata: { userId, albumId }
		})

		const session = await stripe.checkout.sessions.create({
			payment_method_types: [ 'card' ],
			mode: 'payment',
			customer: customer.id,
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: albumItem.name
						},
						unit_amount: albumItem.priceInCents
					},
					quantity: 1
				}
			],
			metadata: { userId: `${userId}`, albumId: `${albumId}` },
			success_url: `${host}/albums/success/${albumId}`,
			cancel_url: `${host}/albums/cancel`
		})
		const { url } = session
		return url
	}
}

export default new PaymentService()
