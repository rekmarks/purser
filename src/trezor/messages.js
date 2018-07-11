/* @flow */
/* eslint-disable max-len */

export const classMessages: Object = {
  userExportCancel:
    'User cancelled the account export request (via Window prompt)',
  userExportGenericError:
    'Could not export the wallet account, check the values you are sending to the Trezor service',
  userSignTxCancel:
    'User cancelled signing the transaction (via Hardware buttons)',
  userSignTxGenericError:
    'Could not sign the transaction, check the values you are sending to the Trezor service',
};

export const validators: Object = {
  derivationPath: {
    notString: 'Derivation path is not the correct type (expected a String)',
    notValidParts:
      'Derivation path does not contain the required parts (Purpouse, Coin Id, Account, Change + Index)',
    notValidHeaderKey:
      'Derivation path does not start with the correct header key',
    notValidPurpouse:
      'Derivation path does have the Ethereum reserved Purpouse',
    notValidCoin:
      'Derivation path does have the correct Coin type Id (Main or Test net)',
    notValidAccount: 'Derivation path does have the correct account value/type',
    notValidChangeIndex:
      'Derivation path does have the correct Change value or Account Index',
    notValidAccountIndex:
      'Derivation path should have only one value for the Account Index',
    genericError: 'Something is wrong with the supplied derivation path:',
  },
  safeInteger: {
    notNumber: 'The value passed in as an argument is not a number',
    notPositive: 'The integer value passed in as an argument is not positive',
    notSafe:
      'The integer value passed in as an argument outside the safe range',
    genericError: 'Something is wrong with the supplied integer',
  },
  bigNumber: {
    notBigNumber: 'The value passed in is not a Big Number',
    genericError: 'Something is wrong with the supplied Big Number value',
  },
  address: {
    notStringSequence: 'The address passed in is not a valid String',
    notLength: 'The address passed in does not have the correct length',
    notFormat: 'The address passed in is not in the correct format',
    notChecksum: 'The address passed in does not have the correct checksum',
    genericError: 'Something is wrong with the supplied address',
  },
  hexSequence: {
    notStringSequence: 'The hex sequence passed in is not a valid String',
    notFormat: 'The hex sequence passed in is not in a correct hex format',
    genericError: 'Something is wrong with the supplied hex sequence',
  },
};
