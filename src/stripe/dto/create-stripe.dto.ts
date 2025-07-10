import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateStripeDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    @IsString()
    currency: string;
}

export class CreateSubscription {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    priceId: string;
}