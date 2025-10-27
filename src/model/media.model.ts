export class CreateMediaRequest {
  parent_id:string;
  collection_name:string;
  type:string;
}

export class MediaResponse {
  parent_id:string;
  file:string;
}

export class UpdateMediaRequest {
   parent_id:string;
   collection_name:string;
   type:string;
}

export class FileData {
    field_name:string;
    original_name:string;
    encoding:string;
    size:number;
    mime_type:string
}