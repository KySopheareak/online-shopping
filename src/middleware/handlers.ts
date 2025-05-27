import { NextFunction, Request, Response, Router } from "express";
import { ValidationChain } from "express-validator";
import FormHandler, { FormHandlerMutiples } from "./form-handlers";
import MulterFormHandler, { MulterFormHandlerMutiples} from "./file-handlers";
import ValidationHandler from "./validation-handler";

type Wrapper = (router: Router) => void;

type Handler = (req: Request, res: Response, next: NextFunction) => any;

type Route = {
  path: string;
  method: string;
  validators?: ValidationChain[];
  authenticate?: boolean;
  authenticateEnterpriseUser?: boolean;
  authenticateViaQuery?: boolean;
  authenticateEnterpriseUserViaQuery?: boolean;
  authenticateResetPasswordEnterpriseUser?: boolean;
  authorized_roles?: string[];
  file?: boolean;
  file_multiple?: boolean;
  form_data?: boolean;
  form_data_multiple_file?: boolean;
  handler: Handler | Handler[];
  camDigiKeyRoles?: string[];
  authorizeApps?: string[];
  allowFromOrigin?: boolean;
  authenticationRefreshToken?: boolean;
  authenticationRefreshTokenEnterpriseUser?: boolean;
  authenticationBankToken?: boolean;
  authNSSFToken?: boolean;
  authenticateFile?: boolean;
};

export const applyMiddleware = (middleware: Wrapper[], router: Router) => {
  for (const f of middleware) {
    f(router);
  }
};

export const applyRoutes = (
  basePath: String,
  routes: Route[],
  router: Router
) => {
  for (const route of routes) {
    const {
      method,
      path,
      validators,
      file,
      file_multiple,
      form_data,
      form_data_multiple_file,
      handler,
    } = route;

    let middleware = [];
    middleware.push(basePath + path);

    if (file) {
      middleware.push(new MulterFormHandler().parse);
    }

    if (file_multiple) {
      middleware.push(new MulterFormHandlerMutiples().parse);
    }

    if (form_data) {
      middleware.push(new FormHandler().parse);
    }

    if (form_data_multiple_file) {
      middleware.push(new FormHandlerMutiples().parse);
    }

    if (validators) {
      middleware.push(validators, new ValidationHandler().validate);
    }

    middleware.push(handler);
    (router as any)[method](...middleware);
  }
};
