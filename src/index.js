'use strict'
const _ = require('lodash');
const ethjs = require('ethereumjs-util');
const ethwallet = require('ethereumjs-wallet');
const ethjshdwallet = require('ethereumjs-wallet/hdkey');
const bip39 = require('bip39');

module.exports = {
	toWallet: toWallet
};

function toWallet(opts) {
	let from = null;
	let key = null;
	if (opts.mnemonic || opts.key || opts.keystore) {
		key = getPrivateKey(opts);
		if (key)
			from = keyToAddress(key);
	}
	return {
		address: from,
		key: key
	};
}

function keyToAddress(key) {
	return ethjs.toChecksumAddress(ethjs.bufferToHex(
		ethjs.privateToAddress(ethjs.toBuffer(key))));
}

function getPrivateKey(opts) {
	if (opts.key) {
		return ethjs.addHexPrefix(opts.key);
	}
	if (opts.keystore)
		return fromKeystore(opts.keystore, opts.password);
	if (opts.mnemonic)
		return fromMnemonic(opts.mnemonic, opts.mnemonicIndex || 0);
}

function fromKeystore(keystore, pw) {
	if (!pw)
		throw new Error('Keystore requires password.');
	if (_.isObject(keystore))
		keystore = JSON.stringify(keystore);
	const wallet = ethwallet.fromV3(keystore, pw, true);
	return ethjs.bufferToHex(wallet.getPrivateKey());
}

function fromMnemonic(mnemonic, idx=0) {
	const seed = bip39.mnemonicToSeed(mnemonic.trim());
	const path = `m/44'/60'/0'/0/${idx}`;
	const node = ethjshdwallet.fromMasterSeed(seed).derivePath(path);
	const wallet = node.getWallet();
	return ethjs.bufferToHex(wallet.getPrivateKey());
}
