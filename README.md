# Minos

Minos is a simple, extensible, rich data validation and integrity checker for Javascript built for managing 
data contracts in web APIs. Much like the incarnation of King Minos from Dante's Inferno judged the souls
entering the inferno, Minos judges the data entering your programmatic domain.

Built on the Signet type library, Minos supports function, string and object style definitions of data 
types.  Types can be as simple as number, string and object or as complex as ranged numbers, variant 
types, nullables and deeply-nested object definitions.  All types defined by name may be referenced
by name throughout all other definitions, making deep object definition easy without creating giant
pyramids of doom.

## Example

```
    function validatePassword (passwordStr) {
        var letterPattern = /[A-Z]+/;
        var numberPattern = /\d+/;
        var symbolPattern = /[^A-Za-z0-9]+/;

        return letterPattern.test(passwordStr) &&
            numberPattern.test(passwordStr) &&
            symbolPattern.test(passwordStr);
    }

    // This is an example of a simple US address
    var addressDefinition = {
        street: 'boundedString<3; 150>',
        city: 'boundedString<3; 150>',
        state: 'formattedString<^[A-Z]{2}$>',
        zipCode: 'formattedString</^\d{5}(-\d{4})?$>'
    };

    var userDefinition = {
        username: minos.regex(/^\w{3,}$/),
        password: validatePassword,
        address: minos.validateOn(addressDefinition)
    };

    minos.defineValidator('userInfo', userDefinition);

    // performs deep object value check and throws on failure
    minos.validateAndThrowOn('userInfo')(userInputValue);
```

## API:

- range
    - Checks if value is within a given range
    - Type signature: `A < B :: A:number, B:number => * => boolean`
    - Examples:
        - `minos.range(1, 10)(9); // true`
        - `minos.range(-10, -5)(3); // false`
- regex
    - Verifies if string conforms to regular expression
    - Type signature: `variant<string; regexp> => string => boolean`
    - Examples:
        - `minos.validateRegex(/^\d+$/)('1234a'); // false`
        - `minos.validateRegex('[^abcde]*')('foo'); // true`
- defineValidator
    - Defines a new, named, validator type
    - Type signature: `string, variant<string; function; objectType> => undefined`
    - Examples:
        - `minos.defineValidator('onlyBar', 'formattedString<^bar$>')`;
        - `minos.defineValidator('greaterThanFive', function (value) { return value > 5; });`
        - `minos.defineValidator('fooBarFiveValidator', { foo: 'onlyBar', num: 'greaterThanFive'});`
- defineSubValidatorOn
    - Define a new validator type which inherits from a parent validator -- aside from the inheritance call,
    defineSubValidatorOn works identically to defineValidator
    - Type signature: `string => string, variant<string; function; objectType> => undefined`
    - Example:
        - `minos.defineSubValidator('int')('intGreaterThanFive', function (value) { return value > 5; });`
- validateAndThrowOn
    - Validate using a validator definition and throw if validation fails
    - Type signature: `variant<string; function; objectType> => * => undefined`
    - Examples:
        - `minos.validateAndThrowOn('fooBarFiveValidator')({}); // throws error including type and value information`
        - `minos.validateAndThrowOn(function (value) { return typeof value !== object; })(5); // throws no error`
- validateOn
    - Validate using a validator definition
    - Type signature: `variant<string; function; objectType> => * => boolean`
    - Examples:
        - `minos.validateAndThrowOn('fooBarFiveValidator')({}); // false`
        - `minos.validateAndThrowOn(function (value) { return typeof value !== object; })(5); // true`
- isTypeOf -- A set of pre-built type functions for convenience
    - array -- `minos.isTypeOf.array(value);`
    - boolean -- `minos.isTypeOf.boolean(value);`
    - email -- `minos.isTypeOf.email(value);`
    - function -- `minos.isTypeOf.function(value);`
    - int -- `minos.isTypeOf.int(value);`
    - null -- `minos.isTypeOf.null(value);`
    - object -- `minos.isTypeOf.object(value);`
    - regexp -- `minos.isTypeOf.regexp(value);`
    - string -- `minos.isTypeOf.string(value);`
    - symbol -- `minos.isTypeOf.symbol(value);`
    - undefined -- `minos.isTypeOf.undefined(value);`

