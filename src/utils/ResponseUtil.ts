import { Request, Response } from "express";

export default class ResponseUtil {

    /**
     * For response success to client
     * @param res Request
     * @param message String
     * @param data JSONObject 
     * @param pagination JSONObject (Supplies when data is array and has more data)
     */
    public static success(res: Response, data: any = null, message: String = 'Success', pagination?: any) {
        return res.json({
            status: 1,
            message: message,
            data: data,
            pagination: pagination
        });
    }

    /**
     * For response error to client
     * @param res Request
     * @param errorCode number 
     * @param message error message
     * @param data JSON Object data response back
     */
    public static fail(res: Response, errorCode: number, message: String, data: any = null) {
        return res.json({
            status: errorCode,
            message: message,
            data: data
        });
    }

    /**
     * For response error to client
     * @param res Request
     * @param errorCode number 
     * @param message error message
     * @param data JSON Object data response back
     * @param registration_id application number
     * @param is_return_error for show message to user or not
     */
    public static failwithLog(
        req: Request,
        res: Response,
        errorCode: number,
        message: string,
        source: string,
        error: any = null,
        is_return_error = false) {

        let dataRes = {
            status: errorCode,
            message: message,
            errors: is_return_error ? error : error.response ? error.response.data : error.message
        };

        console.log(`ERROR: ${req.path}`);
        console.log('Message: ', error.response ? error.response.data : error.message);

        // console.log(error.);
        return res.json(dataRes);
    }

    /**
     * Save log when request success
     * @param req 
     * @param res 
     * @param success_code 
     * @param message 
     * @param data 
     * @param _id 
     * @param source 
     * @param updated_by 
     * @returns 
     */
    public static successWithLog(
        req: Request,
        res: Response,
        success_code: number,
        message: string,
        data: any = null,
        _id: any = null,
        source: any = null,
        updated_by: any = null) {

        let dataRes = {
            status: success_code,
            message: message,
            data: data
        };

        return res.json(dataRes);
    }
}