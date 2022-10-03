import { Request, Response } from 'express';
import Stripe from 'stripe';
import { UserAlbum } from '../../../models/model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-08-01',
});

class StripeController {
  async webhook(request: Request, response: Response) :Promise<void> {
    // This is your Stripe CLI webhook secret for testing your endpoint locally.
    let endpointSecret;
    // endpointSecret = 'whsec_fc1fa7e0c71ba97e7bae2601821dbe0b4e425c3173c9a4f530880bd9abab910b';
    const sig = request.headers['stripe-signature'];

    let data:Stripe.Event.Data.Object;
    let eventType:string;
    if (endpointSecret) {
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(request.body, sig!, endpointSecret);
        console.log('Webhook verified');
      } catch (err) {
        console.log('⚠️  Webhook signature verification failed.');
        response.sendStatus(400);
        return;
      }
      data = event.data.object;
      eventType = event.type;
    } else {
      data = request.body.data.object;
      eventType = request.body.type;
    }
    // Handle the event
    if (eventType === 'checkout.session.completed') {
      try {
        // data.customer - string
        // @ts-ignore
        const customer :string = await stripe.customers.retrieve(data.customer);
        if (customer) {
          // @ts-ignore
          const userId = customer.metadata.userId as number;
          // @ts-ignore
          const { albumId } = customer.metadata as number;
          try {
            const albumPaidExist = await UserAlbum.findOne({ where: { userId, albumId } });
            if (albumPaidExist) {
              // @ts-ignore
              albumPaidExist.isPaid = true;
              albumPaidExist.save();
            } else {
              const albumPaid = await UserAlbum.create({ userId, albumId, isPaid: true });
              console.log('albumPaid is: ', albumPaid);
            }
          } catch (e) {
            console.log(e);
          }
          console.log({ userId, albumId });
        }
      } catch (e) {
        console.log(e);
      }
    }
    // Return a 200 response to acknowledge receipt of the event
    response.send().end();
  }
}

export default new StripeController();
