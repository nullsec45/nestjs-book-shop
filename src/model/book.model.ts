import { CategoryResponse } from "@/model/category.model";
import { AuthorResponse } from "./author.model";

export class CreateBookRequest {
  slug:string;
  isbn?:string;
  title:string;
  description?: string;
  price:number;
  pages:number;
  language?:string;
  publisher?:string;
  published_at?:Date;
  stock_cached:number;
}

export class BookResponse {
  id:string;
  slug:string;
  isbn?:string;
  title:string;
  description?: string;
  price:number;
  pages:number;
  language:string;
  publisher:string;
  published_at?:Date;
  stock_cached:number;
  categories?:CategoryResponse[];
  authors?:AuthorResponse[];
}

export class UpdateBookRequest {
  id:string;
  slug:string;
  isbn?:string;
  title:string;  
  description?: string;
  price:number;
  pages:number;
  language:string;
  publisher:string;
  published_at?:Date;
  stock_cached:number;
}


export class SearchBookRequest{
    title?:string;
    page:number;
    size:number;
}