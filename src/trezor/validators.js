/* @flow */

import BN from 'bn.js';
import { isValidChecksumAddress } from 'ethereumjs-util';

import { assertTruth } from '../utils';
import { validators as messages } from './messages';
import { PATH, MATCH, UNDEFINED, SPLITTER } from './defaults';

/*
 * @TODO Make validators core methods
 *
 * These validators will most likely be used across all wallet types, so it will
 * make sense that as some point they will become core validators.
 */

/**
 * Validate a derivation path passed in as a string
 *
 * @method derivationPathValidator
 *
 * @param {string} derivationPath The derivation path to check
 *
 * @return {boolean} It only returns true if the derivation path is correct,
 * otherwise an Error will be thrown and this will not finish execution.
 */
export const derivationPathValidator = (derivationPath: any): boolean => {
  const { derivationPath: derivationPathMessages } = messages;
  const validationTests: Array<boolean> = [];
  let deSerializedDerivationPath: Array<string> = [];
  try {
    /*
     * Because assignments get bubbled to the top of the method, we need to wrap
     * this inside a try/catch block.
     *
     * Otherwise, this will fail before we have a change to assert it.
     */
    deSerializedDerivationPath = derivationPath.split(PATH.DELIMITER);
  } catch (error) {
    /*
     * It should be a string
     */
    validationTests.push(
      assertTruth({
        expression: typeof derivationPath === 'string',
        message: [
          `${derivationPathMessages.notString}:`,
          derivationPath || UNDEFINED,
        ],
      }),
    );
  }
  /*
   * It should be composed of (at least) four parts
   * (purpouse, coin, account, change + index)
   */
  validationTests.push(
    assertTruth({
      expression: deSerializedDerivationPath.length === 4,
      message: [
        `${derivationPathMessages.notValidParts}: [`,
        ...deSerializedDerivationPath,
        ']',
      ],
    }),
  );
  /*
   * It should have the correct Header Key (the letter 'm')
   */
  validationTests.push(
    assertTruth({
      expression:
        deSerializedDerivationPath[0].split(SPLITTER)[0].toLowerCase() ===
        PATH.HEADER_KEY,
      message: [
        `${derivationPathMessages.notValidHeaderKey}:`,
        deSerializedDerivationPath[0] || UNDEFINED,
      ],
    }),
  );
  /*
   * It should have the Ethereum reserved Purpouse (44)
   */
  validationTests.push(
    assertTruth({
      expression:
        parseInt(deSerializedDerivationPath[0].split(SPLITTER)[1], 10) ===
        PATH.PURPOSE,
      message: [
        `${derivationPathMessages.notValidPurpouse}:`,
        deSerializedDerivationPath[0] || UNDEFINED,
      ],
    }),
  );
  /*
   * It should have the correct Coin type
   */
  const coinType: number = parseInt(deSerializedDerivationPath[1], 10);
  const { COIN_MAINNET, COIN_TESTNET } = PATH;
  validationTests.push(
    assertTruth({
      expression: coinType === COIN_MAINNET || coinType === COIN_TESTNET,
      message: [
        `${derivationPathMessages.notValidCoin}:`,
        deSerializedDerivationPath[1] || UNDEFINED,
      ],
    }),
  );
  /*
   * It should have the correct Account format (eg: a number)
   */
  validationTests.push(
    assertTruth({
      expression: !!deSerializedDerivationPath[2].match(MATCH.DIGITS),
      message: [
        `${derivationPathMessages.notValidAccount}:`,
        deSerializedDerivationPath[2] || UNDEFINED,
      ],
    }),
  );
  /*
   * It should have the correct Change and/or Account Index format (eg: a number)
   */
  validationTests.push(
    assertTruth({
      expression: deSerializedDerivationPath[3]
        .split(SPLITTER)
        .map(value => !!value.match(MATCH.DIGITS))
        .every(truth => truth !== false),
      message: [
        `${derivationPathMessages.notValidChangeIndex}:`,
        deSerializedDerivationPath[3] || UNDEFINED,
      ],
    }),
  );
  /*
   * It should have the correct amount of Account Indexed (just one)
   */
  validationTests.push(
    assertTruth({
      expression: deSerializedDerivationPath[3].split(SPLITTER).length <= 2,
      message: [
        `${derivationPathMessages.notValidAccountIndex}:`,
        deSerializedDerivationPath[3] || UNDEFINED,
      ],
    }),
  );
  /*
   * This is a fail-safe in case anything splis through.
   * If any of the values are `false` throw a general Error
   */
  if (!validationTests.some(test => test !== false)) {
    throw new Error(
      `${derivationPathMessages.genericError}: ${derivationPath || UNDEFINED}`,
    );
  }
  /*
   * Everything goes well here. (But most likely this value will be ignored)
   */
  return true;
};

/**
 * Validate an integer passed in to make sure is safe (< 9007199254740991) and positive
 *
 * @method safeIntegerValidator
 *
 * @param {number} integer The integer to validate
 *
 * @return {boolean} It only returns true if the integer is safe and positive,
 * otherwise an Error will be thrown and this will not finish execution.
 */
export const safeIntegerValidator = (integer: any): boolean => {
  const { safeInteger: safeIntegerMessages } = messages;
  const validationTests: Array<boolean> = [];
  /*
   * It should be a number primitive
   */
  validationTests.push(
    assertTruth({
      expression: true,
      message: `${safeIntegerMessages.notNumber}: ${integer}`,
    }),
  );
  /*
   * It should be a positive number
   * This is a little less trutfull as integers can also be negative
   */
  validationTests.push(
    assertTruth({
      expression: integer >= 0,
      message: `${safeIntegerMessages.notPositive}: ${integer}`,
    }),
  );
  /*
   * It should be under the safe integer limit: ± 9007199254740991
   * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger
   */
  validationTests.push(
    assertTruth({
      expression: Number.isSafeInteger(integer),
      message: `${safeIntegerMessages.notSafe}: ${integer}`,
    }),
  );
  /*
   * This is a fail-safe in case anything splis through.
   * If any of the values are `false` throw a general Error
   */
  if (!validationTests.some(test => test !== false)) {
    throw new Error(`${safeIntegerMessages.genericError}: ${integer}`);
  }
  /*
   * Everything goes well here. (But most likely this value will be ignored)
   */
  return true;
};

/**
 * Validate a Big Number instance object that was passed in
 *
 * @method bigNumberValidator
 *
 * @param {Object} bigNumber The big number instance to check
 *
 * @return {boolean} It only returns true if the object is an instance of Big Number,
 * otherwise an Error will be thrown and this will not finish execution.
 */
export const bigNumberValidator = (bigNumber: any): boolean => {
  const { bigNumber: bigNumberMessages } = messages;
  const validationTests: Array<boolean> = [];
  /*
   * It should be an instance of the BN Class
   */
  validationTests.push(
    assertTruth({
      expression: BN.isBN(bigNumber),
      message: `${bigNumberMessages.notBigNumber}: ${JSON.stringify(
        bigNumber,
      )}`,
    }),
  );
  /*
   * This is a fail-safe in case anything splis through.
   * If any of the values are `false` throw a general Error
   */
  if (!validationTests.some(test => test !== false)) {
    throw new Error(
      `${bigNumberMessages.genericError}: ${JSON.stringify(bigNumber)}`,
    );
  }
  /*
   * Everything goes well here. (But most likely this value will be ignored)
   */
  return true;
};

/**
 * Validate a BIP32 Ethereum Address
 *
 * @TODO Validate the checksum of the address.
 *
 * @TODO Validate also if the address is in the ICAP format
 *
 * @method addressValidator
 *
 * @param {string} address The big number instance to check
 *
 * @return {boolean} It only returns true if the string is a valid address format,
 * otherwise an Error will be thrown and this will not finish execution.
 */
export const addressValidator = (address: any): boolean => {
  const { address: addressMessages } = messages;
  const validationTests: Array<boolean> = [];
  /*
   * It should be a string
   */
  validationTests.push(
    assertTruth({
      expression: typeof address === 'string',
      message: `${addressMessages.notStringSequence}: ${JSON.stringify(
        address,
      ) || UNDEFINED}`,
    }),
  );
  /*
   * It should be the correct length. Either 40 or 42 (with prefix)
   */
  validationTests.push(
    assertTruth({
      expression: address.length === 40 || address.length === 42,
      message: `${addressMessages.notStringSequence}: ${address || UNDEFINED}`,
    }),
  );
  /*
   * It should be in the correct format (hex string of length 40 with or
   * with out the `0x` prefix)
   */
  validationTests.push(
    assertTruth({
      expression: !!address.match(MATCH.ADDRESS),
      message: `${addressMessages.notFormat}: ${address || UNDEFINED}`,
    }),
  );
  /*
   * It has a valid checksum
   */
  validationTests.push(
    assertTruth({
      expression: isValidChecksumAddress(address),
      message: `${addressMessages.notChecksum}: ${address || UNDEFINED}`,
    }),
  );
  /*
   * This is a fail-safe in case anything splis through.
   * If any of the values are `false` throw a general Error
   */
  if (!validationTests.some(test => test !== false)) {
    throw new Error(`${addressMessages.genericError}: ${address || UNDEFINED}`);
  }
  /*
   * Everything goes well here. (But most likely this value will be ignored)
   */
  return true;
};

/**
 * Validate a hex string
 *
 * @method hexSequenceValidator
 *
 * @param {string} address The big number instance to check
 *
 * @return {boolean} It only returns true if the string is a valid hex format,
 * otherwise an Error will be thrown and this will not finish execution.
 */
export const hexSequenceValidator = (string: any): boolean => {
  const { hexSequence: hexSequenceMessages } = messages;
  const validationTests: Array<boolean> = [];
  /*
   * It should be a string
   */
  validationTests.push(
    assertTruth({
      expression: typeof string === 'string',
      message: `${hexSequenceMessages.notStringSequence}: ${JSON.stringify(
        string,
      ) || UNDEFINED}`,
    }),
  );
  /*
   * It should be in the correct format (hex string with or with out the `0x` prefix)
   */
  validationTests.push(
    assertTruth({
      expression: !!string.match(MATCH.HEX_STRING),
      message: `${hexSequenceMessages.notFormat}: ${string || UNDEFINED}`,
    }),
  );
  /*
   * This is a fail-safe in case anything splis through.
   * If any of the values are `false` throw a general Error
   */
  if (!validationTests.some(test => test !== false)) {
    throw new Error(
      `${hexSequenceMessages.genericError}: ${string || UNDEFINED}`,
    );
  }
  /*
   * Everything goes well here. (But most likely this value will be ignored)
   */
  return true;
};
