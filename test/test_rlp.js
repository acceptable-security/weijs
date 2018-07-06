const assert = require('assert');
const WeiRLP = require('../src/account/WeiRLP');

describe('WeiRLP', function() {

    describe('#encode', function() {
        function testEncoding(description, arg, actual) {
            it(description, function () {
                const encoding = WeiRLP.encode(arg);
                assert(encoding.equals(Buffer.from(actual)));
            });
        }

        // Test cases taken from
        // https://github.com/ethereum/wiki/wiki/RLP
        testEncoding('should encode a string', 'dog', [ 0x83, 0x64, 0x6f, 0x67 ]);
        testEncoding('should encode a list of strings', ['cat', 'dog'], [ 0xc8, 0x83, 0x63, 0x61, 0x74, 0x83, 0x64, 0x6f, 0x67 ]);
        testEncoding('should encode the empty string', undefined, [ 0x80 ]);
        testEncoding('should encode the empty list', [], [ 0xc0 ]);
        testEncoding('should encode the integer 0', 0, [ 0x80 ]);
        testEncoding('should encode the integer 15', 15, [ 0x0F ]);
        testEncoding('should encode the integer 1024', 1024, [ 0x82, 0x04, 0x00 ]);
        testEncoding('should encode the set theoretical representation of three', [ [], [[]], [ [], [[]] ] ], [ 0xc7, 0xc0, 0xc1, 0xc0, 0xc3, 0xc0, 0xc1, 0xc0 ]);
        testEncoding('should encode the string "Lorem ipsum dolor sit amet, consectetur adipisicing elit"', "Lorem ipsum dolor sit amet, consectetur adipisicing elit", [ 0xb8, 0x38, 0x4c, 0x6f, 0x72, 0x65, 0x6d, 0x20, 0x69, 0x70, 0x73, 0x75, 0x6d, 0x20, 0x64, 0x6f, 0x6c, 0x6f, 0x72, 0x20, 0x73, 0x69, 0x74, 0x20, 0x61, 0x6d, 0x65, 0x74, 0x2c, 0x20, 0x63, 0x6f, 0x6e, 0x73, 0x65, 0x63, 0x74, 0x65, 0x74, 0x75, 0x72, 0x20, 0x61, 0x64, 0x69, 0x70, 0x69, 0x73, 0x69, 0x63, 0x69, 0x6e, 0x67, 0x20, 0x65, 0x6c, 0x69, 0x74]);
    });

    describe('#decode', function() {
        
    });
});