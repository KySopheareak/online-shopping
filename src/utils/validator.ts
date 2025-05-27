import { Request } from 'express';
import { validationResult } from 'express-validator';

export const validate = (request: Request) => {
    return validationResult(request).isEmpty() ? null : validationResult(request).array()[0].msg;
}
