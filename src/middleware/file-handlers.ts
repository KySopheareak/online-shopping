import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

export default class MulterFormHandler {
  parse = upload.single("file");
}

export class MulterFormHandlerMutiples {
  parse = upload.array("files");
}