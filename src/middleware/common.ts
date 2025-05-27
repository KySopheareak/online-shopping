import compression from "compression";
import cors from "cors";
import express, { Router } from "express";
import moment from "moment";
import morgan from "morgan";
import multer from "multer";

export const handleCors = (router: Router) =>
    router.use(cors({ credentials: true, origin: true }));

export const handleBodyRequestParsing = (router: Router) => {
    router.use(express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }));
    router.use(express.json({ limit: "10mb" }));
};

export const handleCompression = (router: Router) => {
    router.use(compression());
};

export const handlerLogRequest = (router: Router) => {
    //log when request 
    morgan.token('date', function () {
        return moment().format('YYYY-MM-DD HH:mm:ss Z');
    });
    router.use(morgan('combined'));
}
