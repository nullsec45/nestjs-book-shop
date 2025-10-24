import { Injectable, Inject,HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import { BookService } from '@/book/book.service';
import {Logger} from 'winston';
import { CartItem, Prisma } from "@prisma/client";
import { CartItemValidation } from '@/cart/cart.validation';
import {responseValue, responseValueWithData, responseValueWithPaginate, } from '@/utils/response';
import { ResponseData } from '@/types/response';
import { ZodError } from 'zod';
import { CartItemResponse, CreateCartItemRequest, SearchCartItemRequest,UserSummaryResponse, BookSummaryResponse, CartSummaryResponse, UpdateCartItemRequest } from '@/model/cart.model';

@Injectable()
export class CartService {
    constructor(
        private readonly validationService:ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private readonly prismaService:PrismaService,
        private readonly bookService:BookService,
    ){

    }

    async checkOrCreateCart(
        userId:string
    ){
        const user = await this.prismaService.cart.upsert({
            where: {
                user_id:userId,
            },
            create: {
                user_id:userId,
                is_active:true
            },
            update:{}
        });
        
        return user;
    }

    async checkCartMustExists(id:string, userId:string):Promise<CartItem>{  
        const cartItem=await this.prismaService.cartItem.findUnique({
            where: {
                id,
                cart:{
                    user_id:userId
                }
            }
        });

        return cartItem;
    }

    async isUnique(where: Prisma.CartItemWhereInput): Promise<boolean> {
        const found = await this.prismaService.cartItem.findFirst({
            where,
            select: { id: true },
        });
        return !Boolean(found);
    }

   private cartResponse(item: any): CartItemResponse {
        const priceSnapshotNum =
            typeof item.price_snapshot?.toNumber === 'function'
            ? item.price_snapshot.toNumber()
            : Number(item.price_snapshot);

        const book: BookSummaryResponse | undefined = item.book
            ? {
                id: item.book.id,
                slug: item.book.slug,
                title: item.book.title,
                price:
                typeof item.book.price?.toNumber === 'function'
                    ? item.book.price.toNumber()
                    : Number(item.book.price),
            }
            : undefined;

        const user: UserSummaryResponse | undefined = item.cart?.user
            ? {
                name: item.cart.user.name,
            }
            : undefined;

        const cart: CartSummaryResponse | undefined = item.cart
            ? {
                id: item.cart.id,
                is_active: item.cart.is_active,
                user,
            }
            : undefined;

        return {
            id: item.id,
            cart_id: item.cart_id,
            book_id: item.book_id,
            qty: item.qty,
            price_snapshot: priceSnapshotNum,
            added_at: item.added_at, // atau new Date(item.added_at)
            note: item.note ?? null,
            book,
            cart,
        };
    }


    async search(
        request:SearchCartItemRequest,
        userId:string
    ):Promise<ResponseData>{
        try{
            const searchRequest: SearchCartItemRequest = this.validationService.validate(CartItemValidation.SEARCH, request);

            const perPage = Math.max(1, Number(searchRequest.size) || 10);
            const page = Math.max(1, Number(searchRequest.page) || 1);
            const skip = (page - 1) * perPage;

            const where:Prisma.CartItemWhereInput={
                cart:{
                    user_id:userId
                }
            }

            const [cartItems, total] = await this.prismaService.$transaction([
                this.prismaService.cartItem.findMany({
                where,
                take: perPage,
                skip,
                orderBy:{added_at:'desc'},
                include:{
                    cart:{
                        include:{
                            user:true
                        },
                    },
                    book:true,
                }
                }),
                this.prismaService.cartItem.count({where}),
            ]);

            const items:CartItemResponse[] = cartItems.map((item) => this.cartResponse(item));

            return responseValueWithPaginate(
                true,
                HttpStatus.OK,
                'Successfully Get Cart Items',
                items,
                page,
                perPage,
                total
            );
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async get(
        id:string,
        userId:string
    ):Promise<ResponseData>{
        try{
            const checkExist=await this.checkCartMustExists(id, userId);

            if(!checkExist){
                return responseValue(false, HttpStatus.NOT_FOUND, 'Cart Not Found');
            }

            const where:Prisma.CartItemWhereInput={
                id,
                cart:{
                    user_id:userId
                }
            }

            const [cart]= await this.prismaService.$transaction([
                this.prismaService.cartItem.findFirst({
                where,
                include:{
                    cart:{
                        include:{
                            user:true
                        },
                    },
                    book:true,
                }
                }),
            ]);


            const cartData:CartItemResponse=this.cartResponse(cart);

            return responseValueWithData(true, HttpStatus.OK, 'Successfully Get Cart Item', cartData);
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async create(
        request:CreateCartItemRequest,
        userId:string
    ):Promise<ResponseData>{
        try{
            const cart=await this.checkOrCreateCart(userId);

            const createRequest:CreateCartItemRequest=this.validationService.validate(
                CartItemValidation.CREATE,
                request
            );

            const book=await this.bookService.checkBookMustExists(createRequest.book_id);
            const qty = Math.max(1, Number(createRequest.qty) || 1);
            
            if (!book) {
                return responseValue(false, HttpStatus.NOT_FOUND, 'Book Not Found');
            }

            if (!(await this.isUnique({ AND:[
                {cart_id: cart.id },
                {
                    cart:{
                        user_id:userId
                    }
                },
                {book_id:request.book_id}
            ] }))) {
                return responseValue(false, HttpStatus.CONFLICT, 'Cart Already exist');
            }

            const pivot=await this.prismaService.$transaction(async(tx) => {
                return tx.cartItem.create({
                     data: {
                        book: { connect: { id: createRequest.book_id } },
                        cart: { connect: { id: cart.id } },
                        qty,       
                        price_snapshot: Number(book.price) * qty,  
                        note: createRequest.note ?? null,
                    },
                });
            });

            const cartData:CartItemResponse=this.cartResponse(pivot);
            return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Created Data', cartData);
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

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async update(
        request:UpdateCartItemRequest,
        userId:string
    ):Promise<ResponseData>{
        try{
            const checkExist=await this.checkCartMustExists(request.id, userId);

            if(!checkExist){
                return responseValue(false, HttpStatus.NOT_FOUND, 'Cart Not Found');
            }

            const cart=await this.checkOrCreateCart(userId);

            const updateRequest:UpdateCartItemRequest=this.validationService.validate(
                CartItemValidation.UPDATE,
                request
            );

            const book=await this.bookService.checkBookMustExists(updateRequest.book_id);
            const qty = Math.max(1, Number(updateRequest.qty) || 1);
            
            if (!book) {
                return responseValue(false, HttpStatus.NOT_FOUND, 'Book Not Found');
            }

            const pivot=await this.prismaService.$transaction(async(tx) => {
                return tx.cartItem.update({
                    where:{
                        id:request.id
                    },
                    data: {
                        book: { connect: { id: updateRequest.book_id } },
                        cart: { connect: { id: cart.id } },
                        qty,       
                        price_snapshot: Number(book.price) * qty,  
                        note: updateRequest.note ?? null,
                    },
                    include: {
                        cart: { include: { user: true } },
                        book: true,                                      
                    },
                });
            });

            const cartData:CartItemResponse=this.cartResponse(pivot);
            return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Updated Data', cartData);
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

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async remove(
        id:string,
        userId:string
    ):Promise<ResponseData>{
        try{
            const checkCartMustExists=await this.checkCartMustExists(id, userId);

            if (!checkCartMustExists) {
                return responseValue(false, HttpStatus.NOT_FOUND, 'Cart Not Found');
            }

            await this.prismaService.cartItem.delete({
                where:{
                    id:id,
                    cart:{
                        user_id:userId
                    }
                },
            });

            return responseValue(true, HttpStatus.OK, 'Successfully Deleted Data');
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }
}
