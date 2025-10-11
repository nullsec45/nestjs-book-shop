import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import {Logger} from 'winston';
import { CategoryResponse, CreateCategoryRequest, SearchCategoryRequest, UpdateCategoryRequest } from '@/model/category.model';
import {  Category } from "@prisma/client";
import { CategoryValidation } from './category.validation';
import { isUUID } from '@/utils/is-uuid';
import {responseValue, responseValueWithData, responseValueWithPaginate} from '@/utils/response';
import { ResponseData } from '@/types/response';
import { slugWithId } from "@/utils/generate-slug";

@Injectable()
export class CategoryService {
    constructor(
            private validationService:ValidationService,
            @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
            private prismaService:PrismaService,
        ){
        
        }
    
        private categoryResponse(category:Category):CategoryResponse{
            return {
                id:category.id,
                slug:category.slug,
                name:category.name,
                description:category.description,
            }
        }
    
        async checkCategoryMustExists(param:string):Promise<Category>{  
            const where = isUUID(param) ? {id:param,deleted_at:null} : {slug:param, deleted_at:null};
    
            const category=await this.prismaService.category.findFirst({
                where: where as any,
            });
    
    
            return category;
        }
    
        async create(
            request:CreateCategoryRequest
        ):Promise<ResponseData>{
            request.slug=slugWithId(request.name, { uniqueStrategy: "time" });
            const createRequest:CreateCategoryRequest=this.validationService.validate(
                CategoryValidation.CREATE,
                request
            );
    
            const category=await this.prismaService.category.create({
                data:{
                    ...createRequest,
                }
            });
    
            const categoryData=this.categoryResponse(category);
    
            return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Created Data', categoryData);
        }
    
    
        async search(request: SearchCategoryRequest): Promise<ResponseData> {
            const searchRequest: SearchCategoryRequest = this.validationService.validate(CategoryValidation.SEARCH, request);
    
            const filters: any[] = [];
    
            if (searchRequest.name) {
                filters.push({
                OR: [
                    { first_name: { contains: searchRequest.name } },
                    { last_name: { contains: searchRequest.name } },
                ],
                });
            }
    
            if (searchRequest.name) {
                filters.push({
                name: { contains: searchRequest.name },
                });
            }
    
            const perPage = Math.max(1, Number(searchRequest.size) || 10);
            const page = Math.max(1, Number(searchRequest.page) || 1);
            const skip = (page - 1) * perPage;
    
            const [categories, total] = await Promise.all([
                this.prismaService.category.findMany({
                where: { 
                    AND: filters,
                    deleted_at: null
                },
                take: perPage,
                skip,
                // orderBy: { created_at: "desc" },
                }),
                this.prismaService.category.count({
                where: { AND: filters },
                }),
            ]);
    
            const items = categories.map((category) => this.categoryResponse(category));
    
            return responseValueWithPaginate(
                true,
                HttpStatus.OK,
                "Successfully Get Data Categories.",
                items,
                page,
                perPage,
                total
            );
        }
    
        async get(param:string):Promise<ResponseData>{
            const category=await this.checkCategoryMustExists(param);
    
            if (!category) {
                return responseValue(false, HttpStatus.NOT_FOUND, 'Category Not Found');
            }
    
            const categoryData=this.categoryResponse(category);
            return responseValueWithData(true, HttpStatus.OK, 'Successfully Get Data', categoryData);
        }
    
        async update(
            request:UpdateCategoryRequest
        ):Promise<ResponseData>{
            let category=await this.checkCategoryMustExists(request.id);
    
            if (!category) {
                return responseValue(false, HttpStatus.NOT_FOUND, 'Category Not Found');
            }
    
            let slug=category.slug;
            
            if (slug !== request.slug) {
                slug=slugWithId(request.name, { uniqueStrategy: "time" });
                request.slug=slug;
            }
    
            const updateRequest=this.validationService.validate(CategoryValidation.UPDATE,request);
    
    
            category=await this.prismaService.category.update({
                where:{
                    id:category.id,
                },
                data:{
                    ...updateRequest,
                    updated_at:new Date()
                }
            })
    
            const authorData=this.categoryResponse(category);
    
            return responseValueWithData(true, HttpStatus.OK, 'Successfully Updated Data', authorData);
        }
    
        async remove(categoryId:string):Promise<ResponseData>{
            const checkCategory=await this.checkCategoryMustExists(categoryId);
    
            if (!checkCategory) {
                return responseValue(false, HttpStatus.NOT_FOUND, 'Category Not Found');
            }
    
            await this.prismaService.category.update({
                where:{
                    id:categoryId,
                },
                data:{
                    deleted_at:new Date()
                }
            });
    
            return responseValue(true, HttpStatus.OK, 'Successfully Deleted Data');
        }
}
