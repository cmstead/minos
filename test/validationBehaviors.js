'use strict';

var minos = require('../index')();
var assert = require('chai').assert;

describe('Minos Validation Behaviors', function () {
    
    describe('validateOn', function () {
        
        it('should validate against a predefined type string', function () {
            var validateInt = minos.validateOn('int');
            
            assert.isTrue(validateInt(5));
            assert.isFalse(validateInt(7.8));
        });

        it('should validate against a type function', function () {
            var validateInt = minos.validateOn(function(value) { return typeof value !== 'object'; });

            assert.isTrue(validateInt('foo'));
            assert.isFalse(validateInt({}));
        });

        it('should validate against an object type definition', function () {
            var objType = {
                foo: 'int',
                bar: function (value) { return typeof value !== 'string'; }
            };

            var validateInt = minos.validateOn(objType);

            assert.isTrue(validateInt({ foo: 123, bar: {} }));
            assert.isFalse(validateInt({ foo: 'testing', bar: {} }));
            assert.isFalse(validateInt({ foo: 123, bar: 'bad!' }));
        });

    });

    describe('validateAndThrowOn', function () {
        
        it('should throw an error on bad check', function () {
            var objType = {
                foo: 'int',
                bar: function (value) { return typeof value !== 'string'; }
            };

            var throwOnBadObject = minos.validateAndThrowOn(objType);

            assert.throws(throwOnBadObject.bind(null, {}));
        });

    });

    describe('defineValidator', function () {
        
        it('should register a new type for validation', function () {
            
            minos.defineValidator('testValidator', function (value) {
                return value === 'foo';
            });

            var isFoo = minos.validateOn('testValidator');

            assert.isTrue(isFoo('foo'));
            assert.isFalse(isFoo('bar'));

        });
    });

    describe('defineSubValidatorOn', function () {
        
        it('should register a new type for validation', function () {
            
            minos.defineSubValidatorOn('string')('testSubValidator', function (value) {
                return value === 'foo';
            });

            var isFoo = minos.validateOn('testSubValidator');

            assert.isTrue(isFoo('foo'));
            assert.isFalse(isFoo('bar'));

        });

    });

});