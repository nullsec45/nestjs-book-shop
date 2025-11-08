import { Injectable, Inject,HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import { BookService } from '@/book/book.service';
import { Logger } from 'winston';
import { Order, OrderItem, Prisma } from "@prisma/client";
import { OrderItemValidation } from '@/order/order.validation';
import {
    responseValue, 
    responseValueWithData, 
    responseValueWithPaginate, 
} from '@/utils/response';
import { ResponseData } from '@/types/response';
import { 
    CreateOrderItemRequest,
    UpdateOrderItemRequest,
    UserSummaryResponse,
    AddressResponse,
    OrderSummaryResponse,
    BookSummaryResponse,
    OrderItemResponse,
    SearchOrderItemRequest,
} from '@/model/order.model';
import { ZodError } from 'zod';



@Injectable()
export class OrderService {
    constructor(
        private readonly validationService:ValidationService,
        private readonly prismaService:PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private readonly bookService:BookService,
    ){}


    private async createOrderIfNotExists(
        userId:string,
        shippingAddressId:string
    ):Promise<Order>{
        let order=await this.prismaService.order.findFirst({
            where:{
                user_id:userId,
                status:'CREATED',
            }
        });

        if(!order){
            const code=`ORD-${Date.now()}`;
            order=await this.prismaService.order.create({
                data:{
                    code,
                    user_id:userId,
                    shipping_address_id:shippingAddressId,
                    status:'CREATED',
                    subtotal:0,
                    discount_total:0,
                    grand_total:0,
                },
            });
        }else{
            order=await this.prismaService.order.update({
                where:{id:order.id},
                data:{shipping_address_id:shippingAddressId}
            })
        }

        return order;
    }

    private async recalculateOrderTotals(orderId: string) {
        const order = await this.prismaService.order.findUnique({
            where: { id: orderId },
        });
        if (!order) return;

        const items = await this.prismaService.orderItem.findMany({
            where: { order_id: orderId },
        });

        const subtotal = items.reduce((sum, it) => {
            return sum + Number(it.line_total);  
        }, 0);

        const grandTotal =
            subtotal + Number(order.shipping_cost) - Number(order.discount_total);

        await this.prismaService.order.update({
            where: { id: orderId },
            data: {
            subtotal,
            grand_total: grandTotal,
            },
        });
    }

    async checkOrderItemMustExists(id:string, userId:string, type:string='check'):Promise<OrderItem>{  
        const [order]= await this.prismaService.$transaction([
            this.prismaService.orderItem.findFirst({
                where: {
                    id,
                    order:{
                        user_id:userId
                    }
                },
                include:type === 'detail' ? {
                    order:{
                        include:{
                            user:true
                        },
                    },
                    book:true,
                } : undefined
            }),
        ]);

        return order;
    }

    async isUnique(where: Prisma.OrderItemWhereInput): Promise<boolean> {
        const found = await this.prismaService.orderItem.findFirst({
            where,
            select: { id: true },
        });
        return !Boolean(found);
    }

    private  toOrderItemResponse(
       item: any, 
    ): OrderItemResponse {
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
    
            const user: UserSummaryResponse | undefined = item.order?.user
                ? {
                    name: item.order.user.name,
                }
                : undefined;

            const address:AddressResponse | undefined = item.order?.shipping_address ? 
            {
                label:item.order.shipping_address.label,
                recipient_name:item.order.shipping_address.recipient_name,
                phone:item.order.shipping_address.phone,
                line:item.order.shipping_address.line,
                city:item.order.shipping_address.city,
                province:item.order.shipping_address.province,
            } : undefined;
    
            const order: OrderSummaryResponse | undefined = item.order
                ? {
                    id: item.order.id,
                    code: item.order.code,
                    shipping_address_id: item.order.shipping_address_id,
                    status: item.order.status,
                    subtotal: Number(item.order.subtotal),
                    shipping_cost: Number(item.order.shipping_cost),
                    discount_total: Number(item.order.discount_total),
                    grand_total: Number(item.order.grand_total),
                    user,
                    shipping_address:address
                }
                : undefined;

            return {
                id: item.id,
                order_id: item.order_id,
                book_id: item.book_id,
                qty: item.qty,
                title_snapshot:item.title_snapshot,
                price_snapshot: Number(item.price_snapshot),
                added_at: item.created_at as Date,
                line_total: item.line_total != null ? String(item.line_total) : null,
                book,
                order,
            };
    }

    private toOrderItemResponseList(items: any[]): OrderItemResponse[] {
        return items.map(this.toOrderItemResponse);
    }

    async create(
        request:CreateOrderItemRequest,
        userId:string,
    ){
        try{
            const createRequest = this.validationService.validate(
                OrderItemValidation.CREATE,
                request,
            );

            const book=await this.bookService.checkBookMustExists(createRequest.book_id);

            if (!book) {
                return responseValue(false, HttpStatus.NOT_FOUND, 'Book Not Found');
            }

            const order = await this.createOrderIfNotExists(
                userId,
                createRequest.address_id,
            );

            if (!(await this.isUnique({ AND:[
                {order_id: order.id },
                {
                    order:{
                        user_id:userId
                    }
                },
                {book_id:request.book_id}
            ] }))) {
                return responseValue(false, HttpStatus.CONFLICT, 'Book already exists in this order');
            }

            const priceSnapshot=Number((book as any).price ?? 0);
            const lineTotal=priceSnapshot * createRequest.qty;

            const created=await this.prismaService.orderItem.create({
                data:{
                    order_id: order.id,
                    book_id: createRequest.book_id,
                    title_snapshot: (book as any).title ?? (book as any).name ?? '',
                    price_snapshot: priceSnapshot,
                    qty: createRequest.qty,
                    line_total: lineTotal,
                },
                include:{
                    book:true,
                    order:{
                        include:{
                            user:true,
                            shipping_address:true,
                        }
                    },
                }
            });

            await this.recalculateOrderTotals(order.id);

            const orderData:OrderItemResponse=this.toOrderItemResponse(created);
            return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Created Data', orderData);
        
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

    async search(
        request:SearchOrderItemRequest,
        userId:string
    ){
        try{
            const searchRequest: SearchOrderItemRequest = this.validationService.validate(OrderItemValidation.SEARCH, request);
            const perPage = Math.max(1, Number(searchRequest.size) || 10);
            const page = Math.max(1, Number(searchRequest.page) || 1);
            const skip = (page - 1) * perPage;

            const where:Prisma.OrderItemWhereInput={
                order:{
                    user_id:userId,
                },
                deleted_at:null
            }

            const [orderItems, total] = await this.prismaService.$transaction([
                this.prismaService.orderItem.findMany({
                    where,
                    take: perPage,
                    skip,
                    orderBy:{
                        created_at:searchRequest.orderBy ?? 'asc'
                    },
                    include:{
                        order:{
                            include:{
                                user:true
                            },
                        },
                        book:true,
                    }
                }),
                this.prismaService.orderItem.count({where}),
            ]);

            const items=this.toOrderItemResponseList(orderItems);


            return responseValueWithPaginate(
                true,
                HttpStatus.OK,
                'Successfully Get Order Items',
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
        userId:string,
    ){
        try{
            const checkExist=await this.checkOrderItemMustExists(id, userId,'detail');

            if(!checkExist){
                return responseValue(false, HttpStatus.NOT_FOUND, 'Order Not Found');
            }

            const orderData:OrderItemResponse=this.toOrderItemResponse(checkExist);
            
            return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Get Data', orderData);
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async update(
        request:UpdateOrderItemRequest,
        userId:string,
    ){
        try{
            const updateReq = this.validationService.validate(
                OrderItemValidation.UPDATE,
                request,
            );

            const orderItem = await this.checkOrderItemMustExists(
                updateReq.id,
                userId,
            );

            let priceSnapshot = Number(orderItem.price_snapshot);
            let titleSnapshot = orderItem.title_snapshot;
            if (updateReq.book_id && updateReq.book_id !== orderItem.book_id) {
            const book = await this.bookService.checkBookMustExists(
                updateReq.book_id,
            );
            priceSnapshot = Number((book as any).price ?? 0);
            titleSnapshot = (book as any).title ?? (book as any).name ?? '';
            }

            const lineTotal = priceSnapshot * updateReq.qty;

            const updated = await this.prismaService.orderItem.update({
                where: { 
                    id: updateReq.id, 
                    order:{
                        user_id:userId
                    }
                },
                data: {
                    book_id: updateReq.book_id,
                    qty: updateReq.qty,
                    price_snapshot: priceSnapshot,
                    title_snapshot: titleSnapshot,
                    line_total:lineTotal
                },
                include: {
                    order: true,
                    book: true,
                },
            });

            await this.recalculateOrderTotals(updated.order_id);

            const orderData:OrderItemResponse=this.toOrderItemResponse(updated);

            return responseValueWithData(true, HttpStatus.OK, 'Successfully Updated Data',orderData);
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
        userId:string,
    ){
        try{
            const checkOrderItem=await this.checkOrderItemMustExists(id, userId);

            if (!checkOrderItem) {
                return responseValue(false, HttpStatus.NOT_FOUND, 'Order Not Found');
            }

            await this.prismaService.orderItem.update({
                where:{
                    id:id,
                    order:{
                        user_id:userId
                    }
                },
                data:{
                    deleted_at:new Date()
                }
            });

            return responseValue(true, HttpStatus.OK, 'Successfully Deleted Data');
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }
}
