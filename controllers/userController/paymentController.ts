/*
1.Stripe Checkout
https://stripe.com/docs/payments/checkout
*/

import { Request, Response, NextFunction } from 'express'
import Stripe from 'stripe'
import APIError from '../../errors/APIError'
import paymentService from '../../services/userService/paymentService'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2022-08-01'
})

class PaymentController {
	async webhook(req: Request, res: Response): Promise<void> {
		let data: { customer: string }
		let eventType: string

		// webhook invoked from stripe server
		if (req.body.data.object) {
			data = req.body.data.object
			eventType = req.body.type
		} else {
			// webhook invoked from local machine
			try {
				const sig = req.headers['stripe-signature']
				const event = stripe.webhooks.constructEvent(
					req.body,
					sig!,
					process.env.STRIPE_ENDPOINT_SECRET!
				)
				data = event.data.object as { customer: string }
				eventType = event.type
				console.log('Webhook verified')
			} catch (e) {
				console.log('⚠️ Webhook signature verification failed.')
				res.sendStatus(400)
				return
			}
		}
		// Handle the event
		if (eventType === 'checkout.session.completed') {
			await paymentService.handlePayment(res, data)
			return
		}
		res.status(403).send().end()
	}

	async generatePayment(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		let host = req.headers.origin as string
		// for testing from Postman
		if (!host) {
			host = 'http://localhost:3000/'
		}
		const { albumId, userId } = req.query as { [key: string]: string }
		// TODO: create separate service fot the below(Controller- Service separation)
		try {
			const paymentLink = await paymentService.generatePaymentLink(
				albumId,
				userId,
				host
			)

			if (paymentLink) {
				res.json(paymentLink)
				return
			}
			throw Error
		} catch (e) {
			next(APIError.internal('Internal error while generating payment'))
		}
	}
}

export default new PaymentController()
