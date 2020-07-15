'use strict';

/* global globalThis */

const {
    JSON: { stringify: intrinsicJSONStringify },
    Map,
    Object: { create: intrinsicObjectCreate },
    Reflect: { apply: intrinsicReflectApply },
    SyntaxError
} = globalThis;
/**
 * @template T
 * @typedef {T extends (this: infer S, ...args: infer P) => infer R ? {($this: S, ...args: P): R, name:string} : never} Uncurried
 */
/**
 * @template {Function} T
 * @param {T} fn
 * @returns {Uncurried<T>}
 */
const unwindThis = (fn) => {
    /**
     * @param {Parameters<Uncurried<fn>>[0]} $this
     * @param {Parameters<Uncurried<fn>>} args
     * @returns {ReturnType<Uncurried<fn>>}
     */
    const unwound = ($this, ...args) => intrinsicReflectApply(fn, $this, args);
    // @ts-expect-error
    return unwound;
};
const intrinsicMapIteratorPrototypeNext = unwindThis(new Map().entries().next);
const {
    iterator: SymbolIterator,
    match: SymbolMatch,
    matchAll: SymbolMatchAll,
    replace: SymbolReplace,
    search: SymbolSearch,
    split: SymbolSplit
} = Symbol;
const intrinsicMapPrototypeDelete = unwindThis(Map.prototype['delete']);
const intrinsicMapPrototypeEntries = unwindThis(Map.prototype.entries);
const intrinsicMapPrototypeGet = unwindThis(Map.prototype.get);
const intrinsicMapPrototypeHas = unwindThis(Map.prototype.has);
const intrinsicMapPrototypeKeys = unwindThis(Map.prototype.keys);
const intrinsicMapPrototypeSet = unwindThis(Map.prototype.set);
const intrinsicMapPrototypeValues = unwindThis(Map.prototype.values);
const intrinsicRegExpPrototypeExec = unwindThis(RegExp.prototype.exec);
const intrinsicRegExpPrototypeSymbolMatch = RegExp.prototype[Symbol.match];
const intrinsicRegExpPrototypeSymbolMatchAll
  = RegExp.prototype[Symbol.matchAll];
const intrinsicRegExpPrototypeSymbolReplace = RegExp.prototype[Symbol.replace];
const intrinsicRegExpPrototypeSymbolSearch = RegExp.prototype[Symbol.search];
const intrinsicRegExpPrototypeSymbolSplit = RegExp.prototype[Symbol.split];
const intrinsicStringPrototypeCharAt = unwindThis(String.prototype.charAt);
const intrinsicStringPrototypeIndexOf = unwindThis(String.prototype.indexOf);
const intrinsicStringPrototypeReplace = unwindThis(String.prototype.replace);
const intrinsicStringPrototypeSearch = unwindThis(String.prototype.search);
const intrinsicStringPrototypeSlice = unwindThis(String.prototype.slice);
// eslint-disable-next-line max-len
const intrinsicStringPrototypeToLowerCase = unwindThis(String.prototype.toLowerCase);

/**
 *
 * @param {RegExp} pattern
 */
const hardenRegExp = (pattern) => {
    // @ts-expect-error
    // eslint-disable-next-line no-param-reassign
    pattern[SymbolMatch] = intrinsicRegExpPrototypeSymbolMatch;
    // @ts-expect-error
    // eslint-disable-next-line no-param-reassign
    pattern[SymbolMatchAll] = intrinsicRegExpPrototypeSymbolMatchAll;
    // @ts-expect-error
    // eslint-disable-next-line no-param-reassign
    pattern[SymbolReplace] = intrinsicRegExpPrototypeSymbolReplace;
    // @ts-expect-error
    // eslint-disable-next-line no-param-reassign
    pattern[SymbolSearch] = intrinsicRegExpPrototypeSymbolSearch;
    // @ts-expect-error
    // eslint-disable-next-line no-param-reassign
    pattern[SymbolSplit] = intrinsicRegExpPrototypeSymbolSplit;
    return pattern;
};

const NotHTTPTokenCodePoint = hardenRegExp(/[^!#$%&'*+\-.^_`|~A-Za-z0-9]/g);
const NotHTTPQuotedStringCodePoint = hardenRegExp(/[^\t\u0020-~\u0080-\u00FF]/g);

const END_BEGINNING_WHITESPACE = hardenRegExp(/[^\r\n\t ]|$/);
const START_ENDING_WHITESPACE = hardenRegExp(/[\r\n\t ]*$/);

const ASCII_LOWER = hardenRegExp(/[A-Z]/g);
/**
 * @param {string} str
 */
const toASCIILower = (str) => intrinsicStringPrototypeReplace(
    str,
    ASCII_LOWER,
    (c) => intrinsicStringPrototypeToLowerCase(c)
);

/**
 * @param {string} production
 * @param {string} str
 * @param {number} invalidIndex
 */
const throwSyntaxError = (production, str, invalidIndex) => {
    const indexMsg = invalidIndex === -1 ? '' : ` at ${invalidIndex}`;
    const msg = `The MIME syntax for a ${production} in ${intrinsicJSONStringify(str)} is invalid${indexMsg}`;
    throw new SyntaxError(msg);
};

const SOLIDUS = '/';
const SEMICOLON = ';';
/**
 * @param {string} str
 */
const parseTypeAndSubtype = (str) => {
    // Skip only HTTP whitespace from start
    let position = intrinsicStringPrototypeSearch(
        str,
        END_BEGINNING_WHITESPACE
    );
    // read until '/'
    const typeEnd = intrinsicStringPrototypeIndexOf(str, SOLIDUS, position);
    const trimmedType
    = typeEnd === -1
        ? intrinsicStringPrototypeSlice(str, position)
        : intrinsicStringPrototypeSlice(str, position, typeEnd);
    const invalidTypeIndex = intrinsicStringPrototypeSearch(
        trimmedType,
        NotHTTPTokenCodePoint
    );
    if (trimmedType === '' || invalidTypeIndex !== -1 || typeEnd === -1) {
        throwSyntaxError('type', str, invalidTypeIndex);
    }
    // skip type and '/'
    position = typeEnd + 1;
    const type = toASCIILower(trimmedType);
    // read until ';'
    const subtypeEnd = intrinsicStringPrototypeIndexOf(
        str,
        SEMICOLON,
        position
    );
    const rawSubtype
    = subtypeEnd === -1
        ? intrinsicStringPrototypeSlice(str, position)
        : intrinsicStringPrototypeSlice(str, position, subtypeEnd);
    position += rawSubtype.length;
    if (subtypeEnd !== -1) {
    // skip ';'
        position += 1;
    }
    const trimmedSubtype = intrinsicStringPrototypeSlice(
        rawSubtype,
        0,
        intrinsicStringPrototypeSearch(rawSubtype, START_ENDING_WHITESPACE)
    );
    const invalidSubtypeIndex = intrinsicStringPrototypeSearch(
        trimmedSubtype,
        NotHTTPTokenCodePoint
    );
    if (trimmedSubtype === '' || invalidSubtypeIndex !== -1) {
        throwSyntaxError('subtype', str, invalidSubtypeIndex);
    }
    const subtype = toASCIILower(trimmedSubtype);
    const target = intrinsicObjectCreate(null);
    target.type = type;
    target.subtype = subtype;
    target.parametersStringIndex = position;
    return target;
};

const EQUALS_SEMICOLON_OR_END = hardenRegExp(/[;=]|$/);
const QUOTED_VALUE_PATTERN = hardenRegExp(/^(?:([\\]$)|[\\][\s\S]|[^"])*(?:(")|$)/u);
const QUOTED_CHARACTER = hardenRegExp(/[\\]([\s\S])/gu);
/**
 *
 * @param {string} str
 * @param {number} initialPosition
 * @param {Map<string, string>} paramsMap
 */
// eslint-disable-next-line max-statements
const parseParametersString = (str, initialPosition, paramsMap = new Map()) => {
    let position = initialPosition;
    const endOfSource
    = intrinsicStringPrototypeSearch(
        intrinsicStringPrototypeSlice(str, position),
        START_ENDING_WHITESPACE
    ) + position;
    while (position < endOfSource) {
    // Skip any whitespace before parameter
        position += intrinsicStringPrototypeSearch(
            intrinsicStringPrototypeSlice(str, position),
            END_BEGINNING_WHITESPACE
        );
        // Read until ';' or '='
        const afterParameterName
      = intrinsicStringPrototypeSearch(
          intrinsicStringPrototypeSlice(str, position),
          EQUALS_SEMICOLON_OR_END
      ) + position;
        const parameterString = toASCIILower(intrinsicStringPrototypeSlice(
            str,
            position,
            afterParameterName
        ));
        position = afterParameterName;
        // If we found a terminating character
        if (position < endOfSource) {
            // Safe to use because we never do special actions for surrogate pairs
            const paramChar = intrinsicStringPrototypeCharAt(str, position);
            // Skip the terminating character
            position += 1;
            // Ignore parameters without values
            if (paramChar === ';') {
                // eslint-disable-next-line
                continue;
            }
        }
        // If we are at end of the string, it cannot have a value
        if (position >= endOfSource) {
            break;
        }
        // Safe to use because we never do special actions for surrogate pairs
        const char = intrinsicStringPrototypeCharAt(str, position);
        let parameterValue = null;
        if (char === '"') {
            /*
             * Handle quoted-string form of values
             * skip '"'
             */
            position += 1;
            /*
             * Find matching closing '"' or end of string
             *   use $1 to see if we terminated on unmatched '\'
             *   use $2 to see if we terminated on a matching '"'
             *   so we can skip the last char in either case
             */
            const insideMatch = intrinsicRegExpPrototypeExec(
                QUOTED_VALUE_PATTERN,
                intrinsicStringPrototypeSlice(str, position)
            ) || ['', '', ''];
            position += insideMatch[0].length;
            /*
             * Skip including last character if an unmatched '\' or '"' during
             * unescape
             */
            const inside
        = insideMatch[1] || insideMatch[2]
            ? intrinsicStringPrototypeSlice(insideMatch[0], 0, -1)
            : insideMatch[0];
            /*
             * Unescape '\' quoted characters
             */
            parameterValue = intrinsicStringPrototypeReplace(
                inside,
                QUOTED_CHARACTER,
                // @ts-expect-error
                '$1'
            );
            // If we did have an unmatched '\' add it back to the end
            if (insideMatch[1]) {
                parameterValue += '\\';
            }
        } else {
            // Handle the normal parameter value form
            const valueEnd = intrinsicStringPrototypeIndexOf(
                str,
                SEMICOLON,
                position
            );
            const rawValue
        = valueEnd === -1
            ? intrinsicStringPrototypeSlice(str, position)
            : intrinsicStringPrototypeSlice(str, position, valueEnd);
            position += rawValue.length;
            const trimmedValue = intrinsicStringPrototypeSlice(
                rawValue,
                0,
                intrinsicStringPrototypeSearch(
                    rawValue,
                    START_ENDING_WHITESPACE
                )
            );
            // Ignore parameters without values
            if (trimmedValue === '') {
                // eslint-disable-next-line
                continue;
            }
            parameterValue = trimmedValue;
        }
        if (
            parameterString !== ''
      && intrinsicStringPrototypeSearch(parameterString, NotHTTPTokenCodePoint)
        === -1
      && intrinsicStringPrototypeSearch(
          parameterValue,
          NotHTTPQuotedStringCodePoint
      ) === -1
      && intrinsicMapPrototypeHas(paramsMap, parameterString) === false
        ) {
            intrinsicMapPrototypeSet(
                paramsMap,
                parameterString,
                parameterValue
            );
        }
        position += 1;
    }
    return paramsMap;
};

const QUOTE_OR_SOLIDUS = hardenRegExp(/["\\]/g);
/**
 * @param {string} value
 */
const encode = (value) => {
    if (value.length === 0) {
        return '""';
    }
    NotHTTPTokenCodePoint.lastIndex = 0;
    const needToEncode
    = intrinsicStringPrototypeSearch(value, NotHTTPTokenCodePoint) !== -1;
    if (!needToEncode) {
        return value;
    }
    const escaped = intrinsicStringPrototypeReplace(
        value,
        QUOTE_OR_SOLIDUS,
        // @ts-expect-error
        '\\$&'
    );
    return `"${escaped}"`;
};

/**
 *
 * @param {MIMEParams} parameters
 */
const stringifyMIMEParams = (parameters) => {
    let ret = '';
    // eslint-disable-next-line no-use-before-define
    const entries = intrinsicMapPrototypeEntries(dataOfMIMEParams(parameters));
    let keyValuePair, done;
    // Using this to avoid prototype pollution on Map iterators
    while (({
        value: keyValuePair,
        done
    } = intrinsicMapIteratorPrototypeNext(entries))) {
        if (done) {
            break;
        }
        const [key, value] = keyValuePair;
        const encoded = encode(value);
        // Ensure they are separated
        if (ret.length) {
            ret += ';';
        }
        ret += `${key}=${encoded}`;
    }
    return ret;
};

/**
 *
 * @param {string} type
 * @param {string} subtype
 * @param {MIMEParams} parameters
 */
const stringifyMIME = (type, subtype, parameters) => {
    let ret = `${type}/${subtype}`;
    const paramStr = stringifyMIMEParams(parameters);
    if (paramStr.length) {
        ret += `;${paramStr}`;
    }
    return ret;
};

class MIMEParams {
  /**
   * @type {Map<string, string>}
   */
  #data;

  constructor() {
      this.#data = new Map();
  }

  /**
   *
   * @param {string} name
   */
  delete(name) {
      intrinsicMapPrototypeDelete(this.#data, name);
  }

  /**
   *
   * @param {string} name
   */
  get(name) {
      const data = this.#data;
      if (intrinsicMapPrototypeHas(data, name)) {
          return intrinsicMapPrototypeGet(data, name);
      }
      return null;
  }

  /**
   *
   * @param {string} name
   */
  has(name) {
      return intrinsicMapPrototypeHas(this.#data, name);
  }

  /**
   *
   * @param {string} name
   * @param {string} value
   */
  set(name, value) {
      const data = this.#data;
      NotHTTPTokenCodePoint.lastIndex = 0;
      const stringName = `${name}`;
      const stringValue = `${value}`;
      const invalidNameIndex = intrinsicStringPrototypeSearch(
          stringName,
          NotHTTPTokenCodePoint
      );
      if (stringName.length === 0 || invalidNameIndex !== -1) {
          throwSyntaxError('parameter name', stringName, invalidNameIndex);
      }
      NotHTTPQuotedStringCodePoint.lastIndex = 0;
      const invalidValueIndex = intrinsicStringPrototypeSearch(
          stringValue,
          NotHTTPQuotedStringCodePoint
      );
      if (invalidValueIndex !== -1) {
          throwSyntaxError('parameter value', stringValue, invalidValueIndex);
      }
      intrinsicMapPrototypeSet(data, stringName, stringValue);
  }

  * entries() {
      return yield* intrinsicMapPrototypeEntries(this.#data);
  }

  * keys() {
      return yield* intrinsicMapPrototypeKeys(this.#data);
  }

  * values() {
      return yield* intrinsicMapPrototypeValues(this.#data);
  }

  * [SymbolIterator]() {
      return yield* intrinsicMapPrototypeEntries(this.#data);
  }

  toJSON() {
      return stringifyMIMEParams(this);
  }

  toString() {
      return stringifyMIMEParams(this);
  }

  /*
   * Used to act as a friendly class to stringifying stuff
   * not meant to be exposed to users, could inject invalid values
   */
  /**
   *
   * @param {MIMEParams} o
   */
  static friendlyData(o) {
      return o.#data;
  }
}

const dataOfMIMEParams = MIMEParams.friendlyData;
delete MIMEParams.friendlyData;

class MIMEType {
  /**
   * @type {string}
   */
  #type;

  /**
   * @type {string}
   */
  #subtype;

  /**
   * @type {MIMEParams}
   */
  #parameters;

  /**
   *
   * @param {string} input
   */
  constructor(input) {
      const string = `${input}`;
      const data = parseTypeAndSubtype(string);
      this.#type = data.type;
      this.#subtype = data.subtype;
      this.#parameters = new MIMEParams();
      parseParametersString(
          string,
          data.parametersStringIndex,
          dataOfMIMEParams(this.#parameters)
      );
  }

  get type() {
      return this.#type;
  }

  set type(v) {
      const stringV = `${v}`;
      const invalidTypeIndex = intrinsicStringPrototypeSearch(
          stringV,
          NotHTTPTokenCodePoint
      );
      if (stringV.length === 0 || invalidTypeIndex !== -1) {
          throwSyntaxError('type', stringV, invalidTypeIndex);
      }
      this.#type = toASCIILower(stringV);
  }

  get subtype() {
      return this.#subtype;
  }

  set subtype(v) {
      const stringV = `${v}`;
      const invalidSubtypeIndex = intrinsicStringPrototypeSearch(
          stringV,
          NotHTTPTokenCodePoint
      );
      if (stringV.length === 0 || invalidSubtypeIndex !== -1) {
          throwSyntaxError('subtype', stringV, invalidSubtypeIndex);
      }
      this.#subtype = toASCIILower(stringV);
  }

  get essence() {
      return `${this.#type}/${this.#subtype}`;
  }

  get params() {
      return this.#parameters;
  }

  toJSON() {
      return stringifyMIME(this.#type, this.#subtype, this.#parameters);
  }

  toString() {
      return stringifyMIME(this.#type, this.#subtype, this.#parameters);
  }
}
module.exports = Object.freeze({
    MIMEType: MIMEType,
    MIMEParams: MIMEParams
});
