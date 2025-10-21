import { 
    Controller,
    Post,
    HttpCode,
    Body, 
    ParseIntPipe,
    Get,
    Param, 
    Put, 
    Delete, 
    Query, 
    UseGuards, 
    Res
} from "@nestjs/common";
import { AddressService } from "@/address/address.service";
import { CreateAddressRequest, UpdateAddressRequest } from "@/model/address.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'
import { BookAuthorService } from "@/book-author/book-author.service";

@UseGuards(AuthenticatedGuard)
@UseGuards(JwtAuthGuard)
@Controller('address')
export class AddressController {
    constructor(
        private readonly addressService:AddressService,
    ){}

    @Post()
    async create(
        @Res() response:Response,
        @Body() request:CreateAddressRequest,
    ) {
        const result= await this.addressService.create(request);
        return response.status(result.statusCode).json(result);
    }

    @Put('/:bookAuthorId')
    async update(
        @Res() response:Response,
        @Param('bookAuthorId') bookAuthorId:string,
        @Body() request:UpdateAddressRequest,
    ){
        request.id=bookAuthorId;
        const result=await this.addressService.update(request);
        
        return response.status(result.statusCode).json(result);
    }

    @Delete('/:bookAuthorId')
    @HttpCode(200)
    async remove(
        @Res() response:Response,
        @Param('bookAuthorId') bookAuthorId:string
    ){
        const result=await this.addressService.remove(bookAuthorId);
        
        return response.status(result.statusCode).json(result);
    }
}
