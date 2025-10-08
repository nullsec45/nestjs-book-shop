import { Controller,Post,HttpCode,Body, ParseIntPipe,Get,Param, Put, Delete, Query, UseGuards, Res} from "@nestjs/common";
import { AuthorService } from "@/author/author.service";
import { AuthorResponse, CreateAuthorRequest, SearchAuthorRequest, UpdateAuthorRequest } from "@/model/author.model";
import { WebResponse } from "@/model/web.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'
import { slugWithId } from "@/utils/generate-slug";


@UseGuards(AuthenticatedGuard)
@UseGuards(JwtAuthGuard)
@Controller('author')
export class AuthorController {
    constructor(
        private authorService:AuthorService
    ){}

    @Post()
    async create(
        @Body() request:CreateAuthorRequest
    ){
        request.slug=slugWithId(request.name, { uniqueStrategy: "time" })
        const result= await this.authorService.create(request);
        return {
            data:result
        }
    }

    @Get('/:authorId')
    @HttpCode(200)
    async get(
        @Res() response:Response,
        @Param('authorId',ParseIntPipe) authorId:string
    ){
        const result=await this.authorService.get(authorId);
        // return {
        //     data:result
        // }

        //   const result=await this.authService.register(request);

      return response.status(result.statusCode).json(result);
    }

    @Put('/:authorId')
    @HttpCode(200)
    async update(
        @Param('authorId',ParseIntPipe) authorId:string,
        @Body() request:UpdateAuthorRequest
    ):Promise<WebResponse<AuthorResponse>>{
        request.id=authorId;
        const result=await this.authorService.update(request);
        return {
            data:result
        }
    }

    @Delete('/:authorId')
    @HttpCode(200)
    async remove(
        @Param('authorId',ParseIntPipe) authorId:string
    ):Promise<WebResponse<boolean>>{
        await this.authorService.remove(authorId);
        
        return {
            data:true
        }
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
