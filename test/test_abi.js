const assert = require('assert');
const WeiABIType = require('../src/contract/abi/WeiABIType.js');

const AllFields = [
    "isDynamicType",
    "isSimpleType",
    "isDynamicArray",
    "isInt",
    "intSigned",
    "intSize",
    "isStaticBytes",
    "byteCount",
    "isFixed",
    "fixedSigned",
    "fixedUpper",
    "fixedLower",
    "isAddress",
    "isBool",
    "isTuple"
];

const TestData = [
    {
        abi: {
            name: "testString",
            indexed: false,
            type: "string",
            components: []
        },
        fields: {
            isDynamicType: true,
            simpleType: "string"
        },
        static: false
    },
    {
        abi: {
            name: "testBytes",
            indexed: false,
            type: "bytes",
            components: []
        },
        fields: {
            isDynamicType: true,
            simpleType: "bytes"
        },
        static: false
    },
    {
        abi: {
            name: "testSizeNumber",
            indexed: false,
            type: "uint32",
            components: []
        },
        fields: {
            isInt: true,
            intSigned: false,
            intSize: 32,
            isSimpleType: true
        },
        static: true
    },
    {
        abi: {
            name: "testSizeNumber",
            indexed: false,
            type: "uint9",
            components: []
        },
        error: true
    },
    {
        abi: {
            name: "testNumber",
            indexed: false,
            type: "int",
            components: []
        },
        fields: {
            isInt: true,
            intSigned: true,
            intSize: 256,
            isSimpleType: true
        },
        static: true
    },
    {
        abi: {
            name: "testSizeNumber",
            indexed: false,
            type: "int32",
            components: []
        },
        fields: {
            isInt: true,
            intSigned: true,
            intSize: 32,
            isSimpleType: true
        },
        static: true
    },
    {
        abi: {
            name: "testSizeNumber",
            indexed: false,
            type: "int9",
            components: []
        },
        error: true
    },
    {
        abi: {
            name: "testArray",
            indexed: false,
            type: "uint256[2]",
            components: []
        },
        fields: {
            isStaticArray: true,
            arrayLength: 2,
            isSimpleType: false,
            isInt: true,
            intSigned: false,
            intSize: 256
        },
        static: true
    },
    {
        abi: {
            name: "testArray",
            indexed: false,
            type: "uint256[]",
            components: []
        },
        fields: {
            isDynamicArray: true,
            isSimpleType: false,
            isInt: true,
            intSigned: false,
            intSize: 256
        },
        static: false
    },
    {
        abi: {
            name:"`testBytes32",
            indexed: false,
            type: "bytes32",
            components: []
        },
        fields: {
            isStaticBytes: true,
            byteCount: 32,
            isSimpleType: true
        },
        static: true
    },
    {
        abi: {
            name: "testAddress",
            indexed: false,
            type: "address",
            components: []
        },
        fields: {
            isAddress: true,
            intSigned: false,
            intSize: 160,
            isSimpleType: true
        },
        static: true
    },
    {
        abi: {
            name: "testBool",
            indexed: false,
            type: "bool",
            components: []
        },
        fields: {
            isBool: true,
            intSigned: false,
            intSize: 8,
            isSimpleType: true
        },
        static: true
    },
    {
        abi: {
            name: "testTuple",
            indexed: false,
            type: "tuple",
            components: []
        },
        fields: {
            isTuple: true,
            isSimpleType: true
        },
        static: true
    }
];

describe('WeiABIType', function () {
    describe('#parseType', function () {
        // Test each data point
        for ( const data of TestData ) {
            const abi = data.abi;
            const correct = data.fields;

            it(`should${data.error ? ' not' : '' } parse a ${abi.type}`, function () {
                if ( data.error ) {
                    assert.throws(function () { new WeiABIType(abi); });
                    return;
                }

                // Else create and check that correct objects are correct
                // and that nothing else is added
                const type = new WeiABIType(abi);

                for ( const part in correct ) {
                    assert.equal(type[part], correct[part], abi['type'] + ' should have field ' + part + ' with value ' + JSON.stringify(correct[part]));
                }

                for ( const field of AllFields ) {
                    if ( field in correct ) {
                        continue;
                    }

                    assert(!type[field], abi['type'] + ' has unwanted field ' + field);
                }
            });
        }
    });

    describe('#isStatic', function () {
        // Test each data point
        for ( const data of TestData ) {
            const abi = data.abi;

            // This is already tested
            if ( data.error ) {
                continue;
            }

            it(`should determine staticness of ${abi.type}`, function () {
                // Else create and check that correct objects are correct
                // and that nothing else is added
                const type = new WeiABIType(abi);
                assert.equal(type.isStatic, data.static);
            });
        }
    });

    describe('#parse', function () {

    });
});