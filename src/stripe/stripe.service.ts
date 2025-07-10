import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateStripeDto, CreateSubscription } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';
import { errorResponse, response } from 'src/utils/common';
import {
  Fill_All_Details_SignUp,
  Payment_Successful,
  Payment_Failed,
  Subscription_Created,
  Subscription_Id_Not_Exist,
  Subscription_Cancelled,
  Subscription_Already_Cancelled,
} from 'src/utils/constants';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

@Injectable()
export class StripeService {

  // CREATE PAYMENT
  async createPayment(createStripeDto: CreateStripeDto) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: createStripeDto.amount * 100,
        currency: createStripeDto.currency,
        payment_method_types: ['card'],
      });

      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: 'tok_visa',
        },
      });

      const paymentIntentWithMethod = await stripe.paymentIntents.confirm(
        paymentIntent.id,
        { payment_method: paymentMethod.id }
      );

      if (paymentIntentWithMethod.status === 'succeeded') {
        return response(HttpStatus.OK, Payment_Successful, paymentIntentWithMethod);
      } else {
        return response(HttpStatus.OK, Payment_Failed, paymentIntentWithMethod);
      }
    } catch (error) {
      errorResponse(error);
    }
  }

  // CREATE SUBSCRIPTION
  async createSubscription(createSubscription: CreateSubscription) {
    try {
      const customerCreateOnStripe = await stripe.customers.create({
        name: createSubscription.name,
        email: createSubscription.email,
      });

      const customerId = customerCreateOnStripe.id;

      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: 'tok_visa',
        },
      });

      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customerId,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        default_payment_method: paymentMethod.id,
        items: [
          {
            price: createSubscription.priceId,
          },
        ],
      });

      return response(HttpStatus.CREATED, Subscription_Created, subscription.status);
    } catch (error) {
      errorResponse(error);
    }
  }

  // CANCEL SUBSCRIPTION
  async cancelSubscription(subsId: string) {
    try {
      if (!subsId) {
        throw new HttpException(Subscription_Id_Not_Exist, HttpStatus.BAD_REQUEST);
      }

      const subscription = await stripe.subscriptions.retrieve(subsId);

      if (subscription.cancel_at_period_end) {
        throw new HttpException(Subscription_Already_Cancelled, HttpStatus.BAD_REQUEST);
      }

      const cancelSubscription = await stripe.subscriptions.update(subsId, {
        cancel_at_period_end: true,
      });

      return response(HttpStatus.OK, Subscription_Cancelled, {
        customerId: cancelSubscription.customer,
      });
    } catch (error) {
      errorResponse(error);
    }
  }

  // Placeholder methods (optional)
  findAll() {
    return `This action returns all stripe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stripe`;
  }

  update(id: number, updateStripeDto: UpdateStripeDto) {
    return `This action updates a #${id} stripe`;
  }

  remove(id: number) {
    return `This action removes a #${id} stripe`;
  }
}
