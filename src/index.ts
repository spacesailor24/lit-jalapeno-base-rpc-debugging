import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { ethers } from 'ethers';
import * as siwe from 'siwe';

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const runExample = async () => {
  let litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: "jalapeno",
    debug: true,
  });

  await litNodeClient.connect();

  let nonce = '0x53b9f3fb5861f52ee7c4ed76c0d5d4d47bee2ba57d57d3bcc472a913ac5ba212';

  // Initialize the signer
  const wallet = new ethers.Wallet(ETHEREUM_PRIVATE_KEY);
  const address = ethers.utils.getAddress(await wallet.getAddress());

  // Craft the SIWE message
  const domain = 'localhost';
  const origin = 'https://localhost/login';
  const statement =
    'This is a test statement.  You can put anything you want here.';

  // expiration time in ISO 8601 format.  This is 7 days in the future, calculated in milliseconds
  const expirationTime = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 7 * 10000
  ).toISOString();

  const siweMessage = new siwe.SiweMessage({
    domain,
    address: address,
    statement,
    uri: origin,
    version: '1',
    chainId: 1,
    nonce,
    expirationTime,
  });
  const messageToSign = siweMessage.prepareMessage();

  // Sign the message and format the authSig
  const signature = await wallet.signMessage(messageToSign);

  const authSig = {
    sig: signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: messageToSign,
    address: address,
  };

  const accs = [
    {
      contractAddress: '',
      standardContractType: '',
      chain: 'base',
      method: 'eth_getBalance',
      parameters: [':userAddress', 'latest'],
      returnValueTest: {
        comparator: '>=',
        value: '0',
      },
    },
  ];

  const res = await LitJsSdk.encryptString("Hello, world!");

  const encryptedString = res.encryptedString;
  const symmetricKey = res.symmetricKey;

  const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
    accessControlConditions: accs,
    symmetricKey: symmetricKey,
    authSig: authSig,
    chain: 'ethereum',
  });

  const toDecrypt = await LitJsSdk.uint8arrayToString(
    encryptedSymmetricKey,
    'base16'
  );

  const encryptionKey = await litNodeClient.getEncryptionKey({
    accessControlConditions: accs,
    toDecrypt: toDecrypt,
    authSig: authSig,
    chain: 'ethereum',
  });

  const base64EncryptedString = await LitJsSdk.blobToBase64String(
    encryptedString
  );

  const blob = LitJsSdk.base64StringToBlob(base64EncryptedString);

  const decryptedString = await LitJsSdk.decryptString(
    blob,
    encryptionKey
  );

  console.log("decryptedString", decryptedString);
};
