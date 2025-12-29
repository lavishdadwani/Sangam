export const emailRegex = /^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;


export const validateIfsc = /^[A-Z]{4}0[A-Z0-9]{6}$/;


export const validateAccNumber = /^\d{9,18}$/;


export const validateSwiftCode = /^[a-zA-Z0-9]{8,11}$/;


export const validateAlphanumeric = /^[\w\-&.()/\s]*$/;


export const validateAddress = /^[\w,\-&.()/\s]*$/;


export const validateVehicleNo = /^[a-zA-Z0-9\-_]{0,15}$/;


export const validateGST = /^[a-zA-Z0-9]{15}$/;


export const validateName = /^[a-zA-Z/&.-/\s]*$/;


export const validateNumber = /^[0-9]*$/;


export const validatePAN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;


export const validateTAN = /^[a-zA-Z0-9]{10}$/;


export const validatePhone = /^[0-9]{10}$/;


export const validatePincode = /^[0-9]{6}$/;


export const validateIMEI = /^[0-9]{15}$/;


export const validateUserName = /^(?=[a-zA-Z0-9._]{2,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/;


export const validateUpi = /^[a-zA-Z0-9\.\-]{2,256}\@[a-zA-Z][a-zA-Z]{2,64}$/;


export const validatePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

