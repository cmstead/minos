'use strict';

var minos = require('../index')();
var assert = require('chai').assert;

describe('Minos Special Type Behaviors', function () {

    describe('range', function () {

        it('should validate properly against a numeric range', function () {
            var isBetween1And10 = minos.range(1, 10);

            assert.isTrue(isBetween1And10(8));
            assert.isTrue(isBetween1And10(1));
            assert.isTrue(isBetween1And10(10));
            assert.isFalse(isBetween1And10(12));
        });

    });    

    describe('regex', function () {

        it('should validate against a regex string', function () {
            var isRegexMatch = minos.regex('^test.*');

            assert.isTrue(isRegexMatch('test foo'));
            assert.isFalse(isRegexMatch('tes t foo'));
        });

        it('should validate against a RegExp pattern', function () {
            var isRegexMatch = minos.regex(/^test.*/);

            assert.isTrue(isRegexMatch('test bar'));
            assert.isFalse(isRegexMatch('tes t bar'));
        });

    });

});