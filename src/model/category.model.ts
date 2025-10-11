export class CreateCategoryRequest {
  slug:string;
  name:string;
  description?: string;
}

export class CategoryResponse {
  id:string;
  slug:string;
  name:string;
  description?: string;
}

export class UpdateCategoryRequest {
  id:string;
  slug:string;
  name:string;
  description?: string;
}


export class SearchCategoryRequest{
    name?:string;
    page:number;
    size:number;
}