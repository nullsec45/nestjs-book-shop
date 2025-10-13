import { Controller,Post,HttpCode,Body, ParseIntPipe,Get,Param, Put, Delete, Query, UseGuards, Res} from "@nestjs/common";
import { CategoryService } from "@/category/category.service";
import { CreateCategoryRequest, SearchCategoryRequest, UpdateCategoryRequest } from "@/model/category.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'

@UseGuards(AuthenticatedGuard)
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
    constructor(
        private categoryService:CategoryService
    ){}

    @Post()
    async create(
        @Body() request:CreateCategoryRequest
    ){
        const result= await this.categoryService.create(request);
        return {
            data:result
        }
    }

    @Get('/:param')
    @HttpCode(200)
    async get(
        @Res() response:Response,
        @Param('param') param:string
    ){
        const result=await this.categoryService.get(param);

        return response.status(result.statusCode).json(result);
    }

    @Put('/:categoryId')
    @HttpCode(200)
    async update(
        @Res() response:Response,
        @Param('categoryId') categoryId:string,
        @Body() request:UpdateCategoryRequest
    ){
        request.id=categoryId;
        const result=await this.categoryService.update(request);
        
        return response.status(result.statusCode).json(result);
    }

    @Delete('/:categoryId')
    @HttpCode(200)
    async remove(
        @Res() response:Response,
        @Param('categoryId') categoryId:string
    ){
        const result=await this.categoryService.remove(categoryId);
        
        return response.status(result.statusCode).json(result);
    }

    @Get()
    @HttpCode(200)
    async search(
        @Res() response:Response,
        @Query('name') name?:string,
        @Query('page',new ParseIntPipe({optional:true})) page?:number,
        @Query('size',new ParseIntPipe({optional:true})) size?:number,
    ){
        const request:SearchCategoryRequest={
            name:name,
            page:page || 1,
            size:size || 10
        }

        const result=await this.categoryService.search(request);

        
        return response.status(result.statusCode).json(result);

    }
}
