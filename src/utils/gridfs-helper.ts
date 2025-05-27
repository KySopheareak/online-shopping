const { createModel } = require('mongoose-gridfs');
const ObjectId = require("mongoose").Types.ObjectId;
import fs from 'fs';

export default class GrifFSHelper {

    /**
     * Store file into DB
     * @param file 
     * @param model_name 
     * @param metadata 
     * @returns 
     */
    public readonly saveToDB = async (file: any, model_name: string, metadata: any) => {
        const model = this.model(model_name);
        const readStream = fs.createReadStream(file.path);
        const options = {
            filename: file.name ? file.name : file.originalname,
            contentType: file.type ? file.type : file.mimetype,
            metadata: metadata
        };

        return new Promise((resolve, reject) => {
            model.write(options, readStream, (err: any, f: any) => {
                if (err) {
                    console.error(new Date(), err);
                    reject(err);
                }
                
                if (file.path) fs.unlinkSync(file.path);
                resolve(f);
            });
        });
    }

    /**
     * Remove file from DB
     * @param id 
     * @param model_name 
     * @returns 
     */
    public readonly deleteFromDB = async (id: string, model_name: string) => {
        const model = this.model(model_name);

        return new Promise((resolve) => {
            model.unlink({ _id: ObjectId(id) }, (error: any) => {
                if (error) resolve(false);
                else resolve(true);
            });
        });
    }

    /**
     * Init model
     * @param model_name 
     * @returns 
     */
    private model = (model_name: string) => {
        const model = createModel({ modelName: model_name });
        return model;
    }
}