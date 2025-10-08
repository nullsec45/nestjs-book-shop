export class CreateAuthorRequest {
  slug:string;
  name:string;
  bio?: string;
}

export class AuthorResponse {
  slug:string;
  name:string;
  bio?: string;
}

export class UpdateAuthorRequest {
  id:string;
  slug:string;
  name:string;
  bio?: string;
}


export class SearchAuthorRequest{
    name?:string;
    page:number;
    size:number;
}