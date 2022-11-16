/*
1.Stripe Checkout
https://stripe.com/docs/payments/checkout
*/

import { Request, Response } from 'express';
import Stripe from 'stripe';
import stripeService from '../../../services/AppUserService/stripeService/stripeService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-08-01',
});

class StripeController {
  async webhook(req: Request, res: Response): Promise<void> {
    let data:{ customer:string };
    let eventType: string;

    // webhook invoked from stripe server
    if (req.body.data.object) {
      data = req.body.data.object;
      eventType = req.body.type;
    } else {
    // webhook invoked from local machine
      try {
        const sig = req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_ENDPOINT_SECRET!);
        data = event.data.object as { customer:string };
        eventType = event.type;
        console.log('Webhook verified');
      } catch (e) {
        console.log('⚠️ Webhook signature verification failed.');
        res.sendStatus(400);
        return;
      }
    }
    // Handle the event
    if (eventType === 'checkout.session.completed') {
      await stripeService.handlePayment(res, data);
      return;
    }
    res.status(403).send().end();
  }
}

export default new StripeController();
