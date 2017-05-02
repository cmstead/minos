'use strict';

function minos() {
    var signet = require('signet')();

    var isNull = signet.isTypeOf('null');
    var isObject = signet.isTypeOf('object');
    var isString = signet.isTypeOf('string');

    function buildTypePredicate(dataDef) {
        return isObjectInstance(dataDef) ?
            signet.duckTypeFactory(dataDef) :
            signet.isTypeOf(dataDef);
    }

    function validateOn(dataDef) {
        return buildTypePredicate(dataDef);
    }

    function validateAndThrowOn(dataDef) {
        var isValid = validateOn(dataDef);

        return function (value) {
            if (!isValid(value)) {
                throw new Error('Invalid value provided for ' + dataDef);
            }
        }
    }

    function validateRegex(regex) {
        var expression = isString(regex) ? new RegExp(regex) : regex;

        return function (value) {
            return expression.test(value);
        };
    }

    function validateRange(start, end) {
        return signet.isTypeOf('bounded<' + start + '; ' + end + '>');
    }

    function defineValidator(typeKey, typeDef) {
        var typePredicate = validateOn(typeDef);
        signet.extend(typeKey, typePredicate);
    }

    function defineSubValidatorOn(typeName) {
        var assignSubtype = signet.subtype(typeName);

        return function (typeKey, typeDef) {
            var typePredicate = validateOn(typeDef);
            assignSubtype(typeKey, typePredicate);
        };
    }

    function typeByString (typeString){
        return signet.isTypeOf(typeString);
    }

    // Type setup below

    function isObjectInstance(value) {
        return isObject(value) && !isNull(value);
    }

    function isUnacceptableProperty(isAcceptable, obj) {
        return function (key) {
            return !isAcceptable(key);
        }
    }

    function isObjectType(value) {
        var isAcceptable = signet.isTypeOf('variant<string; function>');
        var isPropertyUnacceptable = isUnacceptableProperty(isAcceptable, value);
        var nonConformantProperties = Object.keys(value).filter(isPropertyUnacceptable);

        return isObjectInstance(value) && nonConformantProperties.length === 0;
    }

    signet.subtype('object')('objectType', isObjectType);

    // W3C regex pattern
    var emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    signet.subtype('string')('email', validateRegex(emailRegex));

    return {
        range: signet.enforce('A < B :: A:number, B:number => * => boolean', validateRange),
        regex: signet.enforce('variant<string; regexp> => string => boolean', validateRegex),

        defineValidator: signet.enforce('string, variant<string; function; objectType> => undefined', defineValidator),
        defineSubValidatorOn: signet.enforce('string => string, variant<string; function; objectType> => undefined', defineSubValidatorOn),

        validateAndThrowOn: signet.enforce('variant<string; function; objectType> => * => undefined', validateAndThrowOn),
        validateOn: signet.enforce('variant<string; function; objectType> => * => boolean', validateOn),

        isTypeOf: {
            boolean: signet.enforce('* => boolean', signet.isTypeOf('boolean')),
            function: signet.enforce('* => boolean', signet.isTypeOf('function')),
            object: signet.enforce('* => boolean', signet.isTypeOf('object')),
            string: signet.enforce('* => boolean', signet.isTypeOf('string')),
            symbol: signet.enforce('* => boolean', signet.isTypeOf('symbol')),
            undefined: signet.enforce('* => boolean', signet.isTypeOf('undefined')),
            null: signet.enforce('* => boolean', signet.isTypeOf('null')),

            array: signet.enforce('* => boolean', signet.isTypeOf('array')),
            email: signet.enforce('* => boolean', signet.isTypeOf('email')),
            regexp: signet.enforce('* => boolean', signet.isTypeOf('regexp')),
            int: signet.enforce('* => boolean', signet.isTypeOf('int')),
        }
    };

}

module.exports = minos;