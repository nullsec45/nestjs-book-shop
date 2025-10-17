export class CreateBookCategoryRequest {
  book_id:string;
  category_id:string;
}

export class BookCategoryResponse {
  id:string;
  book_id:string;
  category_id:string;
}

export class UpdateBookCategoryRequest {
  id:string;
  book_id:string;
  category_id:string;
}


export class SearchBookCategoryRequest{
    category?:string;
    title?:string;
    page:number;
    size:number;
}