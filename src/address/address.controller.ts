import { 
    Controller,
    Post,
    HttpCode,
    Body, 
    Param, 
    Put, 
    Delete, 
    UseGuards, 
    Res,
    Request,
    Req
} from "@nestjs/common";
import { AddressService } from "@/address/address.service";
import { CreateAddressRequest, UpdateAddressRequest } from "@/model/address.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'

// @UseGuards(AuthenticatedGuard)
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
        @Request() req,
    ) {
        const result= await this.addressService.create(request, req.user.id);
        return response.status(result.statusCode).json(result);
    }

    @Put('/:addressId')
    async update(
        @Res() response:Response,
        @Param('addressId') addressId:string,
        @Body() request:UpdateAddressRequest,
        @Req() req,
    ){
        request.id=addressId;
        const result=await this.addressService.update(request, req.user.id);
        
        return response.status(result.statusCode).json(result);
    }

    @Delete('/:addressId')
    @HttpCode(200)
    async remove(
        @Res() response:Response,
        @Param('addressId') addressId:string,
        @Req() req
    ){
        const result=await this.addressService.remove(addressId, req.user.id);
        
        return response.status(result.statusCode).json(result);
    }
}
