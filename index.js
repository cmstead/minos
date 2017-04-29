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

    function isRegExp(value) {
        return Object.prototype.toString.call(value) === '[object RegExp]';
    }

    signet.subtype('object')('objectType', isObjectType);
    signet.subtype('object')('regexp', isRegExp);

    return {
        range: signet.enforce('A < B :: A:number, B:number => * => boolean', validateRange),
        regex: signet.enforce('variant<string; regexp> => * => boolean', validateRegex),

        defineValidator: signet.enforce('string, variant<string; function; objectType> => undefined', defineValidator),
        defineSubValidatorOn: signet.enforce('string => string, variant<string; function; objectType> => undefined', defineSubValidatorOn),

        validateAndThrowOn: signet.enforce('variant<string; function; objectType> => * => boolean', validateAndThrowOn),
        validateOn: signet.enforce('variant<string; function; objectType> => * => boolean', validateOn)
    };

}

module.exports = minos;