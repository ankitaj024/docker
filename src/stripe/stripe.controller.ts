import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateStripeDto, CreateSubscription } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) { }

  //PAYMENT CREATE AND PAY
  @Post()
  createPayment(@Body() createStripeDto: CreateStripeDto) {
    return this.stripeService.createPayment(createStripeDto);
  }

  //ADD NEW SUBSCRIPTION
  @Post('/subscription')
  createSubscription(@Body() createSubscription: CreateSubscription) {
    return this.stripeService.createSubscription(createSubscription)
  }

  @Delete('/cancel-subscription/:id')
  cancelSubscription(@Param('id') subsId: string) {
    return this.stripeService.cancelSubscription(subsId)
  }



  @Get()
  findAll() {
    return this.stripeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stripeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStripeDto: UpdateStripeDto) {
    return this.stripeService.update(+id, updateStripeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stripeService.remove(+id);
  }
}
