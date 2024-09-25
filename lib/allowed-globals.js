/* eslint-disable one-var */
/* eslint-disable @stylistic/js/no-multi-spaces */

/**
 * Add variables here that will be available as globals inside the scope during execution.
 *
 * @const
 * @type {String[]}
 */
module.exports = [
    'Array',           'ArrayBuffer',        'Atomics',
    'BigInt',          'Boolean',            'DataView',
    'Date',            'Function',           'Infinity',
    'JSON',            'Map',                'Math',
    'NaN',             'Number',             'Object',
    'Promise',         'Proxy',              'Reflect',
    'RegExp',          'Set',                'SharedArrayBuffer',
    'String',          'Symbol',             'WeakMap',
    'WeakSet',         'decodeURI',          'decodeURIComponent',
    'encodeURI',       'encodeURIComponent', 'escape',
    'isFinite',        'isNaN',              'parseFloat',
    'parseInt',        'undefined',          'unescape',

    // Error
    'Error',           'EvalError',          'RangeError',
    'ReferenceError',  'SyntaxError',        'TypeError',
    'URIError',

    // Typed Arrays
    'BigInt64Array',   'BigUint64Array',     'Float32Array',
    'Float64Array',    'Int16Array',         'Int32Array',
    'Int8Array',       'Uint16Array',        'Uint32Array',
    'Uint8Array',      'Uint8ClampedArray',

    // URL
    'URL',             'URLSearchParams',

    // Encoding
    'atob',            'btoa',
    'TextDecoder',     'TextDecoderStream',
    'TextEncoder',     'TextEncoderStream',

    // File
    // TODO: Add `File` class once support for node < v20 is dropped
    'Blob',

    // Cryptography
    'Crypto',          'CryptoKey',
    'crypto',          'SubtleCrypto',

    // Stream
    'ByteLengthQueuingStrategy',             'CountQueuingStrategy',
    'CompressionStream',                     'DecompressionStream',
    'ReadableByteStreamController',          'ReadableStream',
    'ReadableStreamBYOBReader',              'ReadableStreamBYOBRequest',
    'ReadableStreamDefaultController',       'ReadableStreamDefaultReader',
    'TransformStream',                       'TransformStreamDefaultController',
    'WritableStream',                        'WritableStreamDefaultController',
    'WritableStreamDefaultWriter'
];
