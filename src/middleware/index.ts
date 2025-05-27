import {
    handleCors,
    handleBodyRequestParsing,
    handleCompression,
    handlerLogRequest,
} from "./common";

export default [handleCors, handleBodyRequestParsing, handleCompression, handlerLogRequest];