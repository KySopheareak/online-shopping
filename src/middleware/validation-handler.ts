import { Request, Response, NextFunction } from 'express';
import { validationResult, Result, ValidationError } from 'express-validator';

export default class ValidationHandler {
    public validate(req: Request, res: Response, next: NextFunction) {
        const result: any = validationResult(req)

        if (!result.isEmpty()) {
            let errors = result.errors
            let error: any = {};
            // Reformat the return error
            for (let key of Object.keys(errors)) {
                error[errors[key].param] = [];
            }
            for (let key of Object.keys(errors)) {
                error[errors[key].param].push(errors[key].msg)
            }
            return res.json({ status: 0, message: 'Bad Request', errors: error });
        }
        return next();
    }

    public customError = (result: any | Result<ValidationError>) => {
        let errors = result.errors as any;
        let customError: any = {};
        // Reformat the return error
        for (let key of Object.keys(errors)) {
            customError[errors[key].param] = [];
        }
        for (let key of Object.keys(errors)) {
            customError[errors[key].param].push(errors[key].msg)
        }
        return customError;
    }
}
