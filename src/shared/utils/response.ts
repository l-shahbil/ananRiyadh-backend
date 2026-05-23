

export const successResponse = (data:unknown,message = "OK")=>({
    success:true,
    message,
    data
})

export const errorResponse =(message:string,errors?:unknown)=>({
    success:false,
    message,
    errors:errors??null
})