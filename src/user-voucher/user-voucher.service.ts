import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import { 
    CreateUserVoucherRequest, 
    UpdateUserVoucherRequest, 
    UserVoucherResponse,
    SearchUserVoucherRequest 
} from '@/model/user-voucher.model';
import { UserVoucherValidation } from '@/user-voucher/user-voucher.validation';
import {responseValue, responseValueWithData, responseValueWithPaginate} from '@/utils/response';
import { ResponseData } from '@/types/response';
import { LogService } from '@/common/logger.service';
import { VoucherService } from '@/voucher/voucher.service';
import { Prisma,  UserVoucher } from '@prisma/client';
import { ZodError } from 'zod';
import { isUUID } from '@/utils/is-uuid';
import { UserService } from '@/user/user.service';

@Injectable()
export class UserVoucherService {
    constructor(
        private readonly validationService:ValidationService,
        private readonly logger:LogService,
        private readonly prismaService:PrismaService,
        private readonly voucherService:VoucherService,
        private readonly userService:UserService,
    ){}

    async checkUserVoucherMustExists(id:string){
        const userVoucher=await this.prismaService.userVoucher.findFirst({
            where:{
                id,
                deleted_at:null,
            }
        });

        return userVoucher;
    }
           
    async isUnique(where: Prisma.UserVoucherWhereInput): Promise<boolean> {
        const found = await this.prismaService.userVoucher.findFirst({
            where,
            select: { id: true },
        });

        return !Boolean(found);
    }
    
    private userVoucherResponse(userVoucher:UserVoucher):UserVoucherResponse{
        return {
            id:userVoucher.id,
            user_id:userVoucher.user_id,
            voucher_id:userVoucher.voucher_id,
            total:userVoucher.total,
        }
    }

    async create(
        request:CreateUserVoucherRequest,
    ):Promise<ResponseData>{
       try{
            const createRequest:CreateUserVoucherRequest=this.validationService.validate(
                UserVoucherValidation.CREATE, 
                request
            );

            if(!isUUID(createRequest.user_id)){
                this.logger.warn('user-voucher.create.conflict', {
                    module: 'user-voucher',
                    action: 'create',
                    reason: 'Invalid input: user_id bad input',
                    user_id: createRequest.user_id,
                });

                return responseValueWithData(false, HttpStatus.UNPROCESSABLE_ENTITY, 'validation fail',{
                    errors:[
                        {
                            "path": "user_id",
                            "code": "invalid_type",
                            "message": "Invalid input: user_id bad input"
                        }
                    ]
                });
            }

            if(!isUUID(createRequest.voucher_id)){
                this.logger.warn('user-voucher.create.conflict', {
                    module: 'user-voucher',
                    action: 'create',
                    reason: 'Invalid input: voucher_id bad input',
                    voucher_id: createRequest.voucher_id,
                });

                return responseValueWithData(false, HttpStatus.UNPROCESSABLE_ENTITY, 'validation fail',{
                    errors:[
                        {
                            "path": "voucher_id",
                            "code": "invalid_type",
                            "message": "Invalid input: voucher_id bad input"
                        }
                    ]
                });
            }

            const voucher=await this.voucherService.checkVoucherMustExists(createRequest.voucher_id);

            if(!voucher){
                this.logger.warn('user-voucher.create.error', {
                    module: 'user-voucher',
                    action: 'create',
                    reason: 'Voucher not found',
                    voucher_id: createRequest.voucher_id,
                });

                return responseValue(false,HttpStatus.NOT_FOUND, "Voucher Not Found");
            }

            const user=await this.userService.checkUserMustExists(createRequest.user_id);

            if(!user){
                this.logger.warn('user-voucher.create.error', {
                    module: 'user-voucher',
                    action: 'create',
                    reason: 'User not found',
                    user_id: createRequest.user_id,
                });

                return responseValue(false,HttpStatus.NOT_FOUND, "User Not Found");
            }

            if (!(await this.isUnique({ AND:[{user_id: createRequest.user_id,},{voucher_id:createRequest.voucher_id},{deleted_at:null}]}  ))) {
                this.logger.warn('user-voucher.create.conflict', {
                    module: 'user-voucher',
                    action: 'create',
                    reason: 'user voucher already exists',
                    user_id: createRequest.user_id,
                    voucher_id:createRequest.voucher_id,
                });
                
                return responseValue(false, HttpStatus.CONFLICT, 'User Voucher Already in Database');
            }

            const created=await this.prismaService.userVoucher.create(
                {
                    data:{
                        ...createRequest
                    }
                }
            );

            this.logger.log('user-voucher.create.success', {
                module: 'user-voucher',
                action: 'create',
                payload:{
                    ...createRequest
                }
            });

            const userVoucherData=this.userVoucherResponse(created);

            return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Created Data', userVoucherData);
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

            this.logger.error('user-voucher.create.error', {
                module: 'user-voucher',
                action: 'create',
                error: error.message,
                stack: error.stack,
            });

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
       }
    }

    // async search(request:SearchUserVoucherRequest):Promise<ResponseData>{
    //     try{
    //         const searchRequest: SearchUserVoucherRequest = this.validationService.validate(UserVoucherValidation.SEARCH, request);

    //         const perPage = Math.max(1, Number(searchRequest.size) || 10);
    //         const page = Math.max(1, Number(searchRequest.page) || 1);
    //         const skip = (page - 1) * perPage;

    //         const [userVouchers, total] = await Promise.all([
    //             this.prismaService.userVoucher.findMany({
    //                 where : { 
    //                     deleted_at:null 
    //                 },
    //                 take: perPage,
    //                 skip,
    //             }),
    //             this.prismaService.userVoucher.count({
    //                 where:{ 
    //                     deleted_at:null 
    //                 },
    //             }),
    //         ]);

    //         const items = userVouchers.map((usvoucher) => this.userVoucherResponse(usvoucher));

    //         this.logger.log('user-voucher.search.success', {
    //             module: 'user-voucher',
    //             action: 'search',
    //             query_params:{
    //                 page,
    //                 perPage,
    //                 total,
    //             }
    //         });

    //         return responseValueWithPaginate(
    //             true,
    //             HttpStatus.OK,
    //             "Successfully Get Data User Vouchers",
    //             items,
    //             page,
    //             perPage,
    //             total
    //         );
    //     }catch(error){
    //         this.logger.error('user-voucher.search.error', {
    //             module: 'user-voucher',
    //             action: 'search',
    //             error: error.message,
    //             stack: error.stack,
    //         });

    //         return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
    //     }
    // }

    // async get(id:string):Promise<ResponseData>{
    //     try{
    //         const checkUserVoucher=await this.checkUserVoucherMustExists(id);

    //         if(!checkUserVoucher){
    //             this.logger.warn('user-voucher.create.error', {
    //                 module: 'user-voucher',
    //                 action: 'create',
    //                 reason: 'User voucher not found',
    //                 id,
    //             });

    //             return responseValue(false,HttpStatus.NOT_FOUND,"User Voucher Not Found");
    //         }

    //         const userVoucherData=this.userVoucherResponse(checkUserVoucher);

    //         this.logger.log('user-voucher.get-detail.success', {
    //             module: 'user-voucher',
    //             action: 'get-detail',
    //             id,
    //         });

    //         return responseValueWithData(true, HttpStatus.OK, "Successfully Get Data User Voucher", userVoucherData);
    //     }catch(error){
    //         this.logger.error('user-voucher.get.error', {
    //             module: 'user-voucher',
    //             action: 'get',
    //             error: error.message,
    //             stack: error.stack,
    //         });

    //         return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
    //     }
    // }

    async update(
        request:UpdateUserVoucherRequest
    ):Promise<ResponseData>{
        try{
            const updateRequest:UpdateUserVoucherRequest=this.validationService.validate(
                UserVoucherValidation.UPDATE, 
                request
            );

             if(!isUUID(updateRequest.user_id)){
                return responseValueWithData(false, HttpStatus.UNPROCESSABLE_ENTITY, 'validation fail',{
                    errors:[
                        {
                            "path": "user_id",
                            "code": "invalid_type",
                            "message": "Invalid input: user_id bad input"
                        }
                    ]
                });
            }


            if(!isUUID(updateRequest.voucher_id)){
                return responseValueWithData(false, HttpStatus.UNPROCESSABLE_ENTITY, 'validation fail',{
                    errors:[
                        {
                            "path": "voucher_id",
                            "code": "invalid_type",
                            "message": "Invalid input: voucher_id bad input"
                        }
                    ]
                });
            }


            const voucher=await this.voucherService.checkVoucherMustExists(updateRequest.voucher_id);

            if(!voucher){
                this.logger.warn('user-voucher.update.error', {
                    module: 'user-voucher',
                    action: 'update',
                    reason: 'Voucher not found',
                    voucher_id:updateRequest.voucher_id,
                });

                return responseValue(false,HttpStatus.NOT_FOUND, "Voucher Not Found");
            }

            const checkUserVoucher=await this.checkUserVoucherMustExists(updateRequest.id);

            if(!checkUserVoucher){
                this.logger.warn('user-voucher.update.error', {
                    module: 'user-voucher',
                    action: 'update',
                    reason: 'User voucher not found',
                    id:updateRequest.id,
                });

                return responseValue(false,HttpStatus.NOT_FOUND,"User Voucher Not Found");
            }

            const updated=await this.prismaService.userVoucher.update(
                {
                    where:{
                        id:updateRequest.id
                    },
                    data:{
                        ...updateRequest
                    }
                }
            );

            this.logger.log('user-voucher.update.success', {
                module: 'user-voucher',
                action: 'update',
                payload:{
                    ...updateRequest
                }
            });


            const userVoucherData=this.userVoucherResponse(updated);

            return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Created Data', userVoucherData);
        }catch(error){
            this.logger.error('user-voucher.update.error', {
                module: 'user-voucher',
                action: 'update',
                error: error.message,
                stack: error.stack,
            });

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async remove(id:string):Promise<ResponseData>{
        try{
            const checkUserVoucher=await this.checkUserVoucherMustExists(id);

            if (!checkUserVoucher) {
                this.logger.warn('user-voucher.update.error', {
                    module: 'user-voucher',
                    action: 'remove',
                    reason: 'Voucher not found',
                    id,
                });


                return responseValue(false, HttpStatus.NOT_FOUND, 'User Voucher Not Found');
            }

            await this.prismaService.userVoucher.update({
                where:{
                    id,
                },
                data:{
                    deleted_at:new Date()
                }
            });

            this.logger.log('user-voucher.remove.success', {
                module: 'user-voucher',
                action: 'remove',
                id,
            });

            return responseValue(true, HttpStatus.OK, 'Successfully Deleted Data');
        }catch(error){
            this.logger.error('user-voucher.remove.error', {
                module: 'user-voucher',
                action: 'remove',
                error: error.message,
                stack: error.stack,
            });

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }
}
