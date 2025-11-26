// Response Model

/** 
*@param {String} type 
* @param {String} message
* @param {Object} data
* @param {Object} displayMessage
* @param {Number} code
* @param {Object} additionalData
* @return {Object} Response Object {code:number, message: string, data:any, displayMessage:any}
*/

export const Response  = (type,message,data,displayMessage,code,additionalData) =>{
    let defaultCode = type == 'success' ? 200 : 500
    return {
        code: code || defaultCode,
        message,
        data,
        displayMessage,
        additionalData
    }
}