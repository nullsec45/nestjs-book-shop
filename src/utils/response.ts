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