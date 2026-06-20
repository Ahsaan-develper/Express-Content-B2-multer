class AppError extends Error {
    constructor(message , status_code , error_code ){
        super(message);

        this.status_code = status_code;
        this.error_code = error_code;

        Error.captureStackTrace(this , this.constructor);
    }
}




class BadRequestError extends AppError {
    constructor (message = "Bad Request "){
            super(message , 400 , "Bad_Request")
    }
}


class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized User"){
        super (message , 401 , "UNAUTHORIZED");
    }
}


class ForbiddenError extends AppError {
    constructor (message= "Forbidden"){
        super(message , 403 , "FORBIDDEN")
    }
}

class NotFoundError extends AppError {
    constructor (message = "Resource not Found"){
        super(message, 404, "NOT_FOUND");
    }
}

class ConflictError extends AppError {
    constructor(message = "Resource already exist "){
        super(message , 409 , "constructor");
    }
}

class ValidationError extends AppError {
    constructor (message = "Validation failed" , errors={}){
        super (message , 422 , "VALIDATION_ERROR");
        this.errors = errors;
    }
}

class InternalServerError extends AppError {
    constructor(message ="Internal server error"){
        super(message , 500 , "SERVER_ERROR")
    }
}


export { AppError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError , InternalServerError };