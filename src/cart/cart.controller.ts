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
import { CreateCartItemRequest, SearchCartItemRequest, UpdateCartItemRequest } from "@/model/cart.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'
import { CartService } from "@/cart/cart.service";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { Role } from "@/auth/role.enum";

@UseGuards(AuthenticatedGuard)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
@Controller('carts')
export class CartController {
    constructor(
       private readonly cartService:CartService
    ){

    }

    @Post()
    async create(
        @Res() response:Response,
        @Body() request:CreateCartItemRequest,
        @Req() req
    ){        
        const result= await this.cartService.create(request, req.user.id);
        return response.status(result.statusCode).json(result);
    }

    @Get('/:cartId')
    @HttpCode(200)
    async get(
        @Res() response:Response,
        @Param('cartId') cartId :string,
        @Req() req
    ){
        const result=await this.cartService.get(cartId, req.user.id);

        return response.status(result.statusCode).json(result);
    }

    @Put('/:cartId')
    @HttpCode(200)
    async update(
        @Res() response:Response,
        @Param('cartId') cartId:string,
        @Body() request:UpdateCartItemRequest,
        @Req() req
    ){
        request.id=cartId;
        const result=await this.cartService.update(request, req.user.id);
        
        return response.status(result.statusCode).json(result);
    }

    @Delete('/:cartId')
    @HttpCode(200)
    async remove(
        @Res() response:Response,
        @Param('cartId') cartId:string,
        @Req() req
    ){
        const result=await this.cartService.remove(cartId, req.user.id);
        
        return response.status(result.statusCode).json(result);
    }

    @Get()
    @HttpCode(200)
    async search(
        @Res() response:Response,
        @Query('page',new ParseIntPipe({optional:true})) page:number | undefined,
        @Query('size',new ParseIntPipe({optional:true})) size:number | undefined,
        @Req() req,
    ){
        const request:SearchCartItemRequest={
            page:page || 1,
            size:size || 10
        }

        const result=await this.cartService.search(request, req.user.id);

        
        return response.status(result.statusCode).json(result);

    }
}
