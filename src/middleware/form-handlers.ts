import { NextFunction, Request, Response } from "express";
import { IncomingForm, Options } from 'formidable';
import { HTTP400Error } from "../utils/http-errors";
import qs from 'qs';
export default class FormHandler {
    public parse(req: Request, res: Response, next: NextFunction) {
        const form = new IncomingForm();
        if (!req.headers["content-type"]?.includes("form-data")) {
            throw new HTTP400Error("content-type must be form-data")
        }
        form.parse(req, (error: any, fields: any, files: any) => {
            //console.log(fields, files);
            if (error) {
                return res.json({ status: -1, message: error.stack });
            } else {

                //! Use the qs module to parse both fields and files. it is useful when they are Array or Object
                req.body = {
                    ...qs.parse(fields),
                    ...qs.parse(files),
                }
                return next();
            }
        });
    }
}


export class FormHandlerMutiples {
    public parse(req: Request, res: Response, next: NextFunction) {
        const option: Options = {
            multiples: true
        };
        const form = new IncomingForm(option);

        if (!req.headers["content-type"]?.includes("form-data")) {
            throw new HTTP400Error("content-type must be form-data")
        }

        form.parse(req, (error: any, fields: any, files: any) => {
            // console.log(fields, files);
            if (error) {
                return res.json({ status: -1, message: error.stack });
            } else {
                // req.body.files = files.files;

                //! Use the qs module to parse both fields and files. it is useful when they are Array or Object
                req.body = {
                    ...qs.parse(fields),
                    ...qs.parse(files),
                }
                return next();
            }
        });
    }
}
