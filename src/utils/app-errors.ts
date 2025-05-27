export class ClientError extends Error {
    readonly statusCode = 0;
    
    constructor(message: string) {
        super(message);
    } 
}
export class ServerError extends Error {
    readonly statusCode = -1;

    constructor(message: string) {
        super(message);
    } 
}