export class CreateBookAuthorRequest {
  book_id:string;
  author_id:string;
  ord?: number;
}

export class BookAuthorResponse {
  id:string;
  book_id:string;
  author_id:string;
  ord?: number;
}

export class UpdateBookAuthorRequest {
  id:string;
  book_id:string;
  author_id:string;
  ord?: number;
}


export class SearchBookAuthorRequest{
    author?:string;
    name?:string;
    page:number;
    size:number;
}