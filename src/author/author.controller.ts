import { Controller,Post,HttpCode,Body, ParseIntPipe,Get,Param, Put, Delete, Query, UseGuards, Res} from "@nestjs/common";
import { AuthorService } from "@/author/author.service";
import { AuthorResponse, CreateAuthorRequest, SearchAuthorRequest, UpdateAuthorRequest } from "@/model/author.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'


@UseGuards(AuthenticatedGuard)
@UseGuards(JwtAuthGuard)
@Controller('authors')
export class AuthorController {
    constructor(
        private authorService:AuthorService
    ){}

    @Post()
    async create(
        @Res() response:Response,
        @Body() request:CreateAuthorRequest
    ){
        const result= await this.authorService.create(request);
       
        return response.status(result.statusCode).json(result);
    }

    @Get('/:param')
    @HttpCode(200)
    async get(
        @Res() response:Response,
        @Param('param') param:string
    ){
        const result=await this.authorService.get(param);

        return response.status(result.statusCode).json(result);
    }

    @Put('/:authorId')
    @HttpCode(200)
    async update(
        @Res() response:Response,
        @Param('authorId') authorId:string,
        @Body() request:UpdateAuthorRequest
    ){
        request.id=authorId;
        const result=await this.authorService.update(request);
     
        return response.status(result.statusCode).json(result);
    }

    @Delete('/:authorId')
    @HttpCode(200)
    async remove(
        @Res() response:Response,
        @Param('authorId') authorId:string
    ){
        const result=await this.authorService.remove(authorId);
        
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
        const request:SearchAuthorRequest={
            name:name,
            page:page || 1,
            size:size || 10
        }

        const result=await this.authorService.search(request);

        
        return response.status(result.statusCode).json(result);

    }
}
