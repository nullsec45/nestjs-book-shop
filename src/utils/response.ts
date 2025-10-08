import { ResponseDataPaginate } from "@/types/response";

export  function responseValue(status:boolean, statusCode:number,message:string){
     return {
        status,
        statusCode,
        message
    }
}

export  function responseValueWithData<T>(status:boolean, statusCode:number, message:string, data:T | T[]){
    return {
        status,
        statusCode,
        message,
        data
    }
}

export function responseValueWithPaginate<T>(
  status: boolean,
  statusCode: number,
  message: string,
  items: T[],
  page: number,
  perPage: number,
  totalItems: number
): ResponseDataPaginate {
  const safePerPage = Math.max(1, Math.floor(perPage || 10));
  const totalPages = Math.max(1, Math.ceil(Math.max(0, totalItems) / safePerPage));
  const safePage = Math.min(Math.max(1, Math.floor(page || 1)), totalPages);

  return {
    status,
    statusCode,
    message,
    data: {
      page: safePage,
      items: Array.isArray(items) ? items : [],
      perPage: safePerPage,
      totalPages,
      totalItems: Math.max(0, totalItems),
    },
  };
}