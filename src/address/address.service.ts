import { HttpException, Inject, Injectable, HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import { AuthService } from '@/auth/auth.service';
import { AddressResponse, CreateAddressRequest, UpdateAddressRequest } from '@/model/address.model';
import {Logger} from 'winston';
import { AddressValidation } from '@/address/address.validation';
import { Prisma, Address } from '@prisma/client';
import { ResponseData } from '@/types/response';
import {responseValue, responseValueWithData} from '@/utils/response';

@Injectable()
export class AddressService {
    constructor(
        private readonly validationService:ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private readonly prismaService:PrismaService,
        private readonly authService:AuthService,
    ){}

    private addressResponse(address:Address):AddressResponse{
        return {
            id:address.id,
            label:address.label,
            recipient_name:address.recipient_name,
            phone:address.phone,
            line:address.line,
            city:address.city,
            province:address.province,
            is_default:address.is_default
        }
    }

    async checkAddressMustExists(id:string, userId:string):Promise<Address>{  
        const address=await this.prismaService.address.findFirst({
            where: {
                AND:[
                    {
                        id,
                    },
                    {
                        user_id:userId
                    }
                ]
            },
        });

        return address;
    }

    async create(
        request:CreateAddressRequest,
        userId:string
    ):Promise<ResponseData>{
        const createRequest:CreateAddressRequest=this.validationService.validate(
            AddressValidation.CREATE,
            request
        );

        const user=await this.authService.checkUserMustExists(userId);

        if (!user) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'User Not Found');
        }

        const address=await this.prismaService.address.create({
            data:{
                ...createRequest,
                user_id:userId,
            }
        });

        const addressData=this.addressResponse(address);

        return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Created Data', addressData);
    }

    async update(
        request:UpdateAddressRequest,
        userId:string
    ):Promise<ResponseData>{
        let checkAddress=await this.checkAddressMustExists(request.id,userId);

        if (!checkAddress) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Address Not Found');
        }

        const user=await this.authService.checkUserMustExists(userId);

        if (!user) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'User Not Found');
        }

        const updateRequest=this.validationService.validate(AddressValidation.UPDATE,request);

        const address=await this.prismaService.address.update({
            where:{
                id:checkAddress.id,
            },
            data:{
                ...updateRequest,
                updated_at:new Date()
            }
        })

        const addressData=this.addressResponse(address);

        return responseValueWithData(true, HttpStatus.OK, 'Successfully Updated Data', addressData);
    }

     async remove(
        addressId:string,
        userId:string
    ):Promise<ResponseData>{
        const checkAddress=await this.checkAddressMustExists(addressId, userId);

        if (!checkAddress) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Address Not Found');
        }

       await this.prismaService.address.delete({
            where:{
                id:addressId,
            },
        });

        return responseValue(true, HttpStatus.OK, 'Successfully Deleted Data');
    }
}