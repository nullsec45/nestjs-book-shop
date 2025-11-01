export class CreateMediaRequest {
  parent_id?:string;
  collection_name:string;
  type:string;
}

export class MediaResponse {
  url:string;
  alt_name:string;
  collection_name:string;
  old_media?:string;
}

export class UpdateMediaRequest {
   id:string;
   parent_id?:string;
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