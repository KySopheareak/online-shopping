import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import moment from "moment";
import { Types } from "mongoose";
import { Readable } from "stream";
import { BEN_DETAIL_STATUS, CONFIG, COUNTER, PAYMENT_ITEM_TYPE, PAYMENT_STATUS, PENALTY_TYPE, UTIL_STATUS } from "./constants";

const url = require('url');
const mongodb = require('mongodb');

dotenv.config();
export default class CommonUtil {

    public static makeJSONResponseData(status: number, data: any): any {
        if (status === 1) {
            return { status: status, data: data };
        } else {
            return { status: status, message: data };
        }
    }

    public static openDbFromUrl(mongoUrl: string, cb: any) {
        var dbUrl = url.parse(mongoUrl),
            dbName = dbUrl.pathname.slice(1), // no slash
            dbServer = new mongodb.Server(dbUrl.hostname, dbUrl.port, { auto_reconnect: true }),
            db = new mongodb.Db(dbName, dbServer, {});
        db.open(function (err: any, client: any) {
            if (dbUrl.auth) {
                var dbAuths = dbUrl.auth.split(":"),
                    dbUser = dbAuths[0],
                    dbPass = dbAuths[1];
                db.authenticate(dbUser, dbPass, function (err: any) {
                    if (err) {
                        console.error("db wouldn't authenticate");
                        cb(err);
                    }
                    else {
                        cb(null, client);
                    }
                });
            }
            else {
                if (err) {
                    console.error("db wouldn't open");
                    cb(err);
                }
                else {
                    cb(null, client);
                }
            }
        });
    }

    public static copyCollection(source: any, target: any, collectionName: string, cb: any) {
        source.collection(collectionName, function (err1: any, sourceCollection: any) {
            if (err1) {
                console.error("error opening source collection");
                cb(err1);
            }
            else {
                target.collection(collectionName, function (err2: any, targetCollection: any) {
                    if (err2) {
                        console.error("error opening target collection");
                        cb(err2);
                    }
                    else {
                        // Note: if this fails it's because I was lazy and used toArray
                        // try .each() and insert one doc at a time? (do a count() first so you know it's done)
                        sourceCollection.find().toArray(function (err3: any, results: any) {
                            if (err3) {
                                console.error("error finding source results");
                                cb(err3);
                            }
                            else {
                                targetCollection.insert(results, { safe: true }, function (err4: any, docs: any) {
                                    if (err4) {
                                        console.error("error inserting target results");
                                        cb(err4);
                                    }
                                    else {
                                        cb(null, docs.length + " docs inserted");
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    public static convert_accented_characters(str: string) {
        var conversions: any = [];
        conversions['ae'] = 'ä|æ|ǽ';
        conversions['oe'] = 'ö|œ';
        conversions['ue'] = 'ü';
        conversions['Ae'] = 'Ä';
        conversions['Ue'] = 'Ü';
        conversions['Oe'] = 'Ö';
        conversions['A'] = 'À|Á|Â|Ã|Ä|Å|Ǻ|Ā|Ă|Ą|Ǎ';
        conversions['a'] = 'à|á|â|ã|å|ǻ|ā|ă|ą|ǎ|ª';
        conversions['C'] = 'Ç|Ć|Ĉ|Ċ|Č';
        conversions['c'] = 'ç|ć|ĉ|ċ|č';
        conversions['D'] = 'Ð|Ď|Đ';
        conversions['d'] = 'ð|ď|đ';
        conversions['E'] = 'È|É|Ê|Ë|Ē|Ĕ|Ė|Ę|Ě';
        conversions['e'] = 'è|é|ê|ë|ē|ĕ|ė|ę|ě';
        conversions['G'] = 'Ĝ|Ğ|Ġ|Ģ';
        conversions['g'] = 'ĝ|ğ|ġ|ģ';
        conversions['H'] = 'Ĥ|Ħ';
        conversions['h'] = 'ĥ|ħ';
        conversions['I'] = 'Ì|Í|Î|Ï|Ĩ|Ī|Ĭ|Ǐ|Į|İ';
        conversions['i'] = 'ì|í|î|ï|ĩ|ī|ĭ|ǐ|į|ı';
        conversions['J'] = 'Ĵ';
        conversions['j'] = 'ĵ';
        conversions['K'] = 'Ķ';
        conversions['k'] = 'ķ';
        conversions['L'] = 'Ĺ|Ļ|Ľ|Ŀ|Ł';
        conversions['l'] = 'ĺ|ļ|ľ|ŀ|ł';
        conversions['N'] = 'Ñ|Ń|Ņ|Ň';
        conversions['n'] = 'ñ|ń|ņ|ň|ŉ';
        conversions['O'] = 'Ò|Ó|Ô|Õ|Ō|Ŏ|Ǒ|Ő|Ơ|Ø|Ǿ';
        conversions['o'] = 'ò|ó|ô|õ|ō|ŏ|ǒ|ő|ơ|ø|ǿ|º';
        conversions['R'] = 'Ŕ|Ŗ|Ř';
        conversions['r'] = 'ŕ|ŗ|ř';
        conversions['S'] = 'Ś|Ŝ|Ş|Š';
        conversions['s'] = 'ś|ŝ|ş|š|ſ';
        conversions['T'] = 'Ţ|Ť|Ŧ';
        conversions['t'] = 'ţ|ť|ŧ';
        conversions['U'] = 'Ù|Ú|Û|Ũ|Ū|Ŭ|Ů|Ű|Ų|Ư|Ǔ|Ǖ|Ǘ|Ǚ|Ǜ';
        conversions['u'] = 'ù|ú|û|ũ|ū|ŭ|ů|ű|ų|ư|ǔ|ǖ|ǘ|ǚ|ǜ';
        conversions['Y'] = 'Ý|Ÿ|Ŷ';
        conversions['y'] = 'ý|ÿ|ŷ';
        conversions['W'] = 'Ŵ';
        conversions['w'] = 'ŵ';
        conversions['Z'] = 'Ź|Ż|Ž';
        conversions['z'] = 'ź|ż|ž';
        conversions['AE'] = 'Æ|Ǽ';
        conversions['ss'] = 'ß';
        conversions['IJ'] = 'Ĳ';
        conversions['ij'] = 'ĳ';
        conversions['OE'] = 'Œ';
        conversions['f'] = 'ƒ';
        conversions[''] = `\\.|-|_|,|'|’|'|‘|'`;

        for (var i in conversions) {
            var re = new RegExp(conversions[i], "g");
            str = str.replace(re, i);
        }

        return str;
    }

    public static pad(number: number, digit: number) {
        let num: string = '' + number;
        while (num.length < digit) {
            num = '0' + num;
        }
        return num;
    }

    public static checkSum(no: string) {
        const w: Array<number> = [11, 13, 17, 19, 23, 29, 31, 37, 39];
        let total: number = 0;

        for (let i = 0; i < no.length; i++) {
            total += parseInt(no.charAt(i)) * w[i];
        }

        return (total % 10);
    }

    /**
     * Generate Date Form in Khmer
     * @param data 
     * @returns 
     */
    public static getKhmerDate(data: string) {
        let date = moment(data);
        switch (date.format('M')) {
            case '1': return `${CommonUtil.convertToKhNum(date.format('DD'))} មករា ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '2': return `${CommonUtil.convertToKhNum(date.format('DD'))} កុម្ភៈ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '3': return `${CommonUtil.convertToKhNum(date.format('DD'))} មីនា ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '4': return `${CommonUtil.convertToKhNum(date.format('DD'))} មេសា ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '5': return `${CommonUtil.convertToKhNum(date.format('DD'))} ឧសភា ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '6': return `${CommonUtil.convertToKhNum(date.format('DD'))} មិថុនា ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '7': return `${CommonUtil.convertToKhNum(date.format('DD'))} កក្កដា ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '8': return `${CommonUtil.convertToKhNum(date.format('DD'))} សីហា ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '9': return `${CommonUtil.convertToKhNum(date.format('DD'))} កញ្ញា ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '10': return `${CommonUtil.convertToKhNum(date.format('DD'))} តុលា ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '11': return `${CommonUtil.convertToKhNum(date.format('DD'))} វិច្ឆិកា ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '12': return `${CommonUtil.convertToKhNum(date.format('DD'))} ធ្នូ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
        }
    }

    /**
     * Generate Date Form in Khmer
     * @param data 
     * @returns 
     */
    public static getKhmerDateWithLabel(data: string) {
        let date = moment(data);
        switch (date.format('M')) {
            case '1': return `ថ្ងៃទី ${CommonUtil.convertToKhNum(date.format('DD'))} ខែ មករា ឆ្នាំ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '2': return `ថ្ងៃទី ${CommonUtil.convertToKhNum(date.format('DD'))} ខែ កុម្ភៈ ឆ្នាំ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '3': return `ថ្ងៃទី ${CommonUtil.convertToKhNum(date.format('DD'))} ខែ មីនា ឆ្នាំ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '4': return `ថ្ងៃទី ${CommonUtil.convertToKhNum(date.format('DD'))} ខែ មេសា ឆ្នាំ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '5': return `ថ្ងៃទី ${CommonUtil.convertToKhNum(date.format('DD'))} ខែ ឧសភា ឆ្នាំ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '6': return `ថ្ងៃទី ${CommonUtil.convertToKhNum(date.format('DD'))} ខែ មិថុនា ឆ្នាំ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '7': return `ថ្ងៃទី ${CommonUtil.convertToKhNum(date.format('DD'))} ខែ កក្កដា ឆ្នាំ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '8': return `ថ្ងៃទី ${CommonUtil.convertToKhNum(date.format('DD'))} ខែ សីហា ឆ្នាំ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '9': return `ថ្ងៃទី ${CommonUtil.convertToKhNum(date.format('DD'))} ខែ កញ្ញា ឆ្នាំ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '10': return `ថ្ងៃទី ${CommonUtil.convertToKhNum(date.format('DD'))} ខែ តុលា ឆ្នាំ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '11': return `ថ្ងៃទី ${CommonUtil.convertToKhNum(date.format('DD'))} ខែ វិច្ឆិកា ឆ្នាំ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
            case '12': return `ថ្ងៃទី ${CommonUtil.convertToKhNum(date.format('DD'))} ខែ ធ្នូ ឆ្នាំ ${CommonUtil.convertToKhNum(date.format('YYYY'))}`;
        }
    }

    /**
     * Convert Roman Number to Khmer Number
     * @param data 
     * @returns 
     */
    public static convertToKhNum(data: string) {
        let new_text: string = '';
        for (let i = 0; i < data.length; i++) {
            let txt: string = data[i];
            switch (data[i]) {
                case '0': txt = '០'; break;
                case '1': txt = '១'; break;
                case '2': txt = '២'; break;
                case '3': txt = '៣'; break;
                case '4': txt = '៤'; break;
                case '5': txt = '៥'; break;
                case '6': txt = '៦'; break;
                case '7': txt = '៧'; break;
                case '8': txt = '៨'; break;
                case '9': txt = '៩'; break;
            }
            new_text += txt;
        }
        return new_text;
    }


    /**
     * Format Number
     * @param num 
     */
    public static formatNumber(num: number) {
        return num.toLocaleString();
    }


    public static checkPassowrdStrength(password: string) {

        if (!password) {
            console.error("check-password-strength package - requires a password value.")
            return undefined
        }

        let strength = {} // Default

        const strongRegex = new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
        );
        const mediumRegex = new RegExp(
            "^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})"
        );

        if (strongRegex.test(password)) {
            strength = {
                id: 2,
                value: 'Strong'
            }
        } else if (mediumRegex.test(password)) {
            strength = {
                id: 1,
                value: 'Medium'
            }
        } else {
            strength = {
                id: 0,
                value: 'Weak'
            }
        }

        return strength
    }

    public static bufferToStream(binary: any) {
        const readableInstanceStream = new Readable({
            read() {
                this.push(binary);
                this.push(null);
            }
        });
        return readableInstanceStream;
    }

    public static streamToBuffer(stream: any) {
        return new Promise((resolve, reject) => {
            const _buf: Array<any> = [];

            stream.on("data", (chunk: any) => _buf.push(chunk));
            stream.on("end", () => resolve(Buffer.concat(_buf)));
            stream.on("error", (err: any) => reject(err));
        });
    }

    public static base64ToArrayBuffer(base64: string) {
        var binary_string = atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Clean space from string
     * @param str 
     * @returns 
     */
    public static cleanSpace(str: string) {
        str = str.split(' ').join(''); // remove space
        str = str.split('​').join('');  // remove zero-length space
        return str;
    }
}