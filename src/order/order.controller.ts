import { Controller,
    Post,
    HttpCode,
    Body, 
    Get,
    Param, 
    Put, 
    Delete, 
    Query, 
    UseGuards, 
    Res,
    Req,
    ParseIntPipe
} from "@nestjs/common";
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
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'
import { OrderService } from "@/order/order.service";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { Role } from "@/auth/role.enum";


@UseGuards(AuthenticatedGuard)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
@Controller('orders')
export class OrderController {
    constructor(
       private readonly orderService:OrderService
    ){

    }

    @Post()
    async create(
        @Res() response:Response,
        @Body() request:CreateOrderItemRequest,
        @Req() req
    ){        
        const result= await this.orderService.create(request, req.user.id);
        return response.status(result.statusCode).json(result);
    }

    @Get('/:orderId')
    @HttpCode(200)
    async get(
        @Res() response:Response,
        @Param('orderId') orderId :string,
        @Req() req
    ){
        const result=await this.orderService.get(orderId, req.user.id);

        return response.status(result.statusCode).json(result);
    }

    @Put('/:orderId')
    @HttpCode(200)
    async update(
        @Res() response:Response,
        @Param('orderId') orderId:string,
        @Body() request:UpdateOrderItemRequest,
        @Req() req
    ){
        request.id=orderId;
        const result=await this.orderService.update(request, req.user.id);
        
        return response.status(result.statusCode).json(result);
    }

    @Delete('/:orderId')
    @HttpCode(200)
    async remove(
        @Res() response:Response,
        @Param('orderId') orderId:string,
        @Req() req
    ){
        const result=await this.orderService.remove(orderId, req.user.id);
        
        return response.status(result.statusCode).json(result);
    }

    @Get()
    @HttpCode(200)
    async search(
        @Res() response:Response,
        @Query('page',new ParseIntPipe({optional:true})) page:number | undefined,
        @Query('size',new ParseIntPipe({optional:true})) size:number | undefined,
        @Query('status') status:string | undefined,
        @Query('orderBy') orderBy: 'asc' | 'desc' | undefined,
        @Req() req,
    ){
        const request:SearchOrderItemRequest={
            page:page || 1,
            size:size || 10,
            status,
            orderBy,
        }

        const result=await this.orderService.search(request, req.user.id);

        
        return response.status(result.statusCode).json(result);

    }
}