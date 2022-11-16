import Stripe from 'stripe';
import { Response } from 'express';
import { UserAlbum } from '../../../models/model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-08-01',
});

class StripeService {
  async handlePayment(res:Response, data :{ customer:string }) {
    const customer: any = await stripe.customers.retrieve(data.customer);
    if (customer) {
      const { userId, albumId } = customer.metadata as { [key: string]: string };
      const albumPaidExist = await UserAlbum.findOne({ where: { userId, albumId } });
      if (albumPaidExist) {
        albumPaidExist.isPaid = true;
        albumPaidExist.save();
        res.send().end();
        return;
      }
      const albumPaid = await UserAlbum.create({ userId, albumId, isPaid: true });
      console.log('albumPaid is: ', albumPaid);
      res.send().end();
    }
  }
}

export default new StripeService();
