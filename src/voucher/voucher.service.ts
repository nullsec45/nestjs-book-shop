import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import { 
    CreateVoucherRequest, 
    UpdateVoucherRequest, 
    VoucherResponse,
    SearchVoucherRequest 
} from '@/model/voucher.model';
import { VoucherValidation } from '@/voucher/voucher.validation';
import {responseValue, responseValueWithData, responseValueWithPaginate} from '@/utils/response';
import { ResponseData } from '@/types/response';
import { LogService } from '@/common/logger.service';
import { Prisma, VoucherDiscount } from '@prisma/client';
import { ZodError } from 'zod';

@Injectable()
export class VoucherService {
    constructor(
        private readonly validationService:ValidationService,
        private readonly logger:LogService,
        private prismaService:PrismaService,
    ){

    }

    async checkVoucherMustExists(id:string, userId?:string, type:string='check'){
        const where = userId && type === 'detail'
            ? {
                AND:[
                    {
                       OR:[
                            {
                                id,
                               all_user: true ,
                            },
                            {
                                id,
                                userVoucher: { some: { user_id: userId } },
                                deleted_at: null,
                            }
                       ] 
                    }
                ]
            }
            : { id,  deleted_at: null };

        const voucher = await this.prismaService.voucherDiscount.findFirst({
            where,
            include: userId && type === 'detail' ? { userVoucher: true } : undefined
        });

        return voucher;
    }
       
    async isUnique(where: Prisma.VoucherDiscountWhereInput): Promise<boolean> {
        const found = await this.prismaService.voucherDiscount.findFirst({
            where,
            select: { id: true },
        });
        return !Boolean(found);
    }

    private voucherResponse(voucher:VoucherDiscount):VoucherResponse{
        return {
            id:voucher.id,
            code:voucher.code,
            discount:voucher.discount,
            upper_limit:voucher.upper_limit ?  Number(voucher.upper_limit) : 0,
            description:voucher.description,
            all_user:voucher.all_user,
            start_date:voucher.start_date,
            end_date:voucher.end_date,
        }
    }

    async create(request:CreateVoucherRequest):Promise<ResponseData>{
        try{
           const createRequest:CreateVoucherRequest=this.validationService.validate(
                VoucherValidation.CREATE,
                request
            );

            if (!(await this.isUnique({ AND:[{code: request.code},{deleted_at:null}]}  ))) {
                this.logger.warn('voucher.create.conflict', {
                    module: 'voucher',
                    action: 'create',
                    reason: 'code already exists',
                    title: request.code,
                });
                
                return responseValue(false, HttpStatus.CONFLICT, 'Voucher Discount Already in Database');
            }


            const voucher=await this.prismaService.voucherDiscount.create({
                data:{
                    ...createRequest,
                    upper_limit: createRequest.upper_limit ? Prisma.Decimal(createRequest.upper_limit) : 0,
                }
            });

            this.logger.error('voucher.create.success', {
                module: 'voucher',
                action: 'create',
                payload:{
                    ...createRequest,
                }
            });

            const voucherData=this.voucherResponse(voucher);

            return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Created Data', voucherData);
        }catch(error){
            if (error instanceof ZodError) {
                const details = error.issues.map(i => ({
                    path: i.path.join('.'),
                    code: i.code,
                    message: i.message,
                }));

                return {
                    status: false,
                    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    message: 'validation fail',
                    errors: details 
                } as ResponseData;
            }

            this.logger.error('voucher.create.error', {
                module: 'voucher',
                action: 'create',
                error: error.message,
                stack: error.stack,
            });

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async search(request: SearchVoucherRequest, userId?:string):Promise<ResponseData> {
        try{
            const searchRequest: SearchVoucherRequest = this.validationService.validate(VoucherValidation.SEARCH, request);

            const filters: any[] = [];

            if (searchRequest.discount) {
                filters.push({
                    discount: { contains: searchRequest.discount } 
                });
            }
            const perPage = Math.max(1, Number(searchRequest.size) || 10);
            const page = Math.max(1, Number(searchRequest.page) || 1);
            const skip = (page - 1) * perPage;

            const where: Prisma.VoucherDiscountWhereInput = userId ? {
                AND: [
                    ...filters,
                    { deleted_at: null },
                    {
                        OR: [
                            { 
                                all_user: true 
                            },
                            {
                                userVoucher: { some: { user_id: userId } }
                            },
                        ],
                    }
                ]
            } : 
            {
                AND: [
                    ...filters,
                    { deleted_at: null }
                ]
            }

            const [vouchers, total] = await Promise.all([
                this.prismaService.voucherDiscount.findMany({
                    where,
                    take: perPage,
                    skip,
                }),
                this.prismaService.voucherDiscount.count({
                    where,
                }),
            ]);

            const items = vouchers.map((voucher) => this.voucherResponse(voucher));

            this.logger.log('voucher.search.success', {
                module: 'book',
                action: 'search',
                query_params:{
                    discount: searchRequest.discount ?? null,
                    upper_limit:searchRequest.upper_limit ?? null,
                    page,
                    perPage,
                    total,
                }
            });

            return responseValueWithPaginate(
                true,
                HttpStatus.OK,
                "Successfully Get Data Vouchers",
                items,
                page,
                perPage,
                total
            );
        }catch(error){
            this.logger.error('voucher.search.error', {
                module: 'voucher',
                action: 'search',
                error: error.message,
                stack: error.stack,
            });

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async get(id:string, userId?:string):Promise<ResponseData>{
        try{
            const voucher=await this.checkVoucherMustExists(id, userId,'detail');

            if (!voucher) {
                this.logger.warn('voucher.get.error', {
                    module: 'voucher',
                    action: 'get',
                    reason: 'Voucher not found',
                    id
                });
                
                return responseValue(false, HttpStatus.NOT_FOUND, 'Voucher Not Found');
            }
        
            const voucherData=this.voucherResponse(voucher);

            this.logger.log('voucher.get.success', {
                module: 'book',
                action: 'get',
                id,
            });

            return responseValueWithData(true, HttpStatus.OK, 'Successfully Get Data', voucherData);
        }catch(error){
            this.logger.error('voucher.get.error', {
                module: 'voucher',
                action: 'get',
                error: error.message,
                stack: error.stack,
            });

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async update(request:UpdateVoucherRequest){
        try{
            const updateRequest:UpdateVoucherRequest=this.validationService.validate(
                VoucherValidation.UPDATE,
                request
            );

            const checkVoucher=await this.checkVoucherMustExists(request.id);

            if (!checkVoucher) {
                this.logger.warn('voucher.update.error', {
                    module: 'voucher',
                    action: 'update',
                    reason: 'voucher not found',
                    id: request.id,
                });

                return responseValue(false, HttpStatus.NOT_FOUND, 'Voucher Not Found');
            }

            const voucher=await this.prismaService.voucherDiscount.update({
                where:{
                    id:request.id,
                },
                data:{
                    ...updateRequest,
                    upper_limit: updateRequest.upper_limit ? Prisma.Decimal(updateRequest.upper_limit) : 0,
                }
            });

            this.logger.error('book.update.success', {
                module: 'book',
                action: 'update',
            });

            const voucherData=this.voucherResponse(voucher);

            return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Updated Data', voucherData);
        }catch(error){
            if (error instanceof ZodError) {
                const details = error.issues.map(i => ({
                    path: i.path.join('.'),
                    code: i.code,
                    message: i.message,
                }));

                return {
                    status: false,
                    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    message: 'validation fail',
                    errors: details 
                } as ResponseData;
            }

            this.logger.error('voucher.update.error', {
                module: 'voucher',
                action: 'update',
                error: error.message,
                stack: error.stack,
            });

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async remove(
        id:string
    ){
        try{
            const checkVoucher=await this.checkVoucherMustExists(id);

            if (!checkVoucher) {
                this.logger.warn('voucher.get.error', {
                    module: 'voucher',
                    action: 'get',
                    reason: 'Voucher not found',
                    id
                });

                return responseValue(false, HttpStatus.NOT_FOUND, 'Voucher Not Found');
            }

            await this.prismaService.voucherDiscount.update({
                where:{
                    id,
                },
                data:{
                    deleted_at:new Date()
                }
            });

            return responseValue(true, HttpStatus.OK, 'Successfully Deleted Data');
        }catch(error){
            this.logger.error('voucher.remove.error', {
                module: 'voucher',
                action: 'remove',
                error: error.message,
                stack: error.stack,
            });

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }
}
