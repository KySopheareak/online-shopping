
function convertCurrencyToWord(numberStr: string, isKhmer = false, isRiel = false) {
    const splitValue = numberStr.split(".");
    if (splitValue.length > 1) {
        return isKhmer
            ? convertNumberToWord(splitValue[0], true) +
            "ដុល្លារ និង" +
            convertNumberToWord((splitValue[1] + "00").substring(0, 2), true) +
            "សេន"
            : convertNumberToWord(splitValue[0]) +
            " USD and " +
            convertNumberToWord((splitValue[1] + "00").substring(0, 2)) +
            " Cents";
    } else {
        if (isRiel) {
            return isKhmer
                ? convertNumberToWord(splitValue[0], true) + "រៀលគត់"
                : convertNumberToWord(splitValue[0]) + " Riels Only";
        }
        return isKhmer
            ? convertNumberToWord(splitValue[0], true) + "ដុល្លារគត់"
            : convertNumberToWord(splitValue[0]) + " USD Only";
    }
}

export default function convertNumberToWord(numberStr: string, isKhmer: boolean = false) {
    let word = "";
    let beginWithZero = false;
    var isDone = false; // if already translated
    var amount = parseFloat(numberStr);

    if (amount > 0) {
        beginWithZero = numberStr.startsWith("0");
        let numDigits = numberStr.length;
        console.log("digit", numDigits);
        let position = 0;
        let place = "";
        switch (numDigits) {
            case 1: //ones' range
                word = ones(numberStr, isKhmer);
                isDone = true;
                break;
            case 2: //tens' range
                word = tens(numberStr, isKhmer);
                isDone = true;
                break;
            case 3: //hundreds' range
                position = (numDigits % 3) + 1;
                place = isKhmer ? "រយ" : " Hundred ";
                break;
            case 4: //thousands' range
            case 5:
            case 6:
                position = (numDigits % 4) + 1;
                place = isKhmer ? "ពាន់" : " Thousand, ";
                break;
            case 7: //millions' range
            case 8:
            case 9:
                position = (numDigits % 7) + 1;
                place = isKhmer ? "លាន" : " Million, ";
                break;
            case 10: //Billions's range
            case 11:
            case 12:
                position = (numDigits % 10) + 1;
                place = isKhmer ? "ប៊ីលាន" : " Billion, ";
                break;
            case 13: //Billions's range
            case 14:
            case 15:
                position = (numDigits % 13) + 1;
                place = isKhmer ? "ទ្រីលាន" : "  Trillion, ";
                break;
            //add extra case options for anything above Billion...
            default:
                isDone = true;
                break;
        }

        if (!isDone) {
            if (
                numberStr.substring(0, position) !== "0" &&
                numberStr.substring(position) !== "0"
            ) {
                word =
                    convertNumberToWord(numberStr.substring(0, position), isKhmer) +
                    place +
                    convertNumberToWord(numberStr.substring(position), isKhmer);
            } else {
                word =
                    convertNumberToWord(numberStr.substring(0, position), isKhmer) +
                    convertNumberToWord(numberStr.substring(position), isKhmer);
            }
        }

        if (word.trim() === place.trim()) {
            word = "";
        }
    }
    return word.trim();
}

function ones(numberStr: string, isKhmer: boolean) {

    let number = parseInt(numberStr);

    // prevent negative value
    if (number < 1 ||Number.isNaN(number)) {
        number = 0;
    }
    let name = "";
    switch (number) {
        case 1:
            name = isKhmer ? "មួយ" : "One";
            break;
        case 2:
            name = isKhmer ? "ពីរ" : "Two";
            break;
        case 3:
            name = isKhmer ? "បី" : "Three";
            break;
        case 4:
            name = isKhmer ? "បួន" : "Four";
            break;
        case 5:
            name = isKhmer ? "ប្រាំ" : "Five";
            break;
        case 6:
            name = isKhmer ? "ប្រាំមួយ" : "Six";
            break;
        case 7:
            name = isKhmer ? "ប្រាំពីរ" : "Seven";
            break;
        case 8:
            name = isKhmer ? "ប្រាំបី" : "Eight";
            break;
        case 9:
            name = isKhmer ? "ប្រាំបួន" : "Nine";
            break;
    }
    return name;
}

function tens(numberStr: string, isKhmer: boolean) {
    let number = parseInt(numberStr);

    // prevent negative to make it as 32bit interger
    if (number < 1 || Number.isNaN(number)) {
        number = 0;
    }
    let name = "";
    switch (number) {
        case 10:
            name = isKhmer ? "ដប់" : "Ten";
            break;
        case 11:
            name = isKhmer ? "ដប់មួយ" : "Eleven";
            break;
        case 12:
            name = isKhmer ? "ដប់ពីរ" : "Twelve";
            break;
        case 13:
            name = isKhmer ? "ដប់បី" : "Thirteen";
            break;
        case 14:
            name = isKhmer ? "ដប់បួន" : "Fourteen";
            break;
        case 15:
            name = isKhmer ? "ដប់ប្រាំ" : "Fifteen";
            break;
        case 16:
            name = isKhmer ? "ដប់ប្រាំមួយ" : "Sixteen";
            break;
        case 17:
            name = isKhmer ? "ដប់ប្រាំពីរ" : "Seventeen";
            break;
        case 18:
            name = isKhmer ? "ដប់ប្រាំបី" : "Eighteen";
            break;
        case 19:
            name = isKhmer ? "ដប់ប្រាំបួន" : "Nineteen";
            break;
        case 20:
            name = isKhmer ? "ម្ភៃ" : "Twenty";
            break;
        case 30:
            name = isKhmer ? "សាមសិប" : "Thirty";
            break;
        case 40:
            name = isKhmer ? "សែសិប" : "Fourty";
            break;
        case 50:
            name = isKhmer ? "ហាសិប" : "Fifty";
            break;
        case 60:
            name = isKhmer ? "ហុកសិប" : "Sixty";
            break;
        case 70:
            name = isKhmer ? "ជិតសិប" : "Seventy";
            break;
        case 80:
            name = isKhmer ? "ប៉ែតសិប" : "Eighty";
            break;
        case 90:
            name = isKhmer ? "កៅសិប" : "Ninety";
            break;
        default:
            if (number > 0) {
                if (isKhmer)
                    name = tens(numberStr.substring(0,
                        1) + "0", isKhmer) + ones(numberStr.substring(1), isKhmer);
                else
                    name = tens(numberStr.substring(0,
                        1) + "0", isKhmer) + " " + ones(numberStr.substring(1), isKhmer);
            }
            break;
    }
    return name;
}