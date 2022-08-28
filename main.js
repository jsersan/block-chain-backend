const {Blockchain, Transaction} = require('./blockchain'); 
const EC = require('elliptic').ec;
const ec =  new EC('secp256k1');

const myKey = ec.keyFromPrivate('ef6eb33708f7d957dfef3aaa98b6f506cd56e0894b22929db76583a5d0f41182');
// Extraemos la clave pública de la cartera:

const myWalletAddress = myKey.getPublic('hex');

let txemaCoin = new Blockchain();

// Creamos una transacción:
const tx1 = new Transaction(myWalletAddress, 'Clave pública va aquí', 10);

// Firmamos la transacción:
tx1.signTransaction(myKey);

// Añadimos la transacción
txemaCoin.addTransaction(tx1);

// Creamos una segunda transacción:
const tx2 = new Transaction(myWalletAddress, 'Clave pública va aquí', 100);

// Firmamos la transacción:
tx2.signTransaction(myKey);

// Añadimos la transacción
txemaCoin.addTransaction(tx2);

console.log('\nEmpezando las transacciones....');
txemaCoin.minePendingTransactions(myWalletAddress);

console.log('\nEl saldo de Txema es ',txemaCoin.getBalanceOfAddress(myWalletAddress));

txemaCoin.chain[1].transactions[0].amount = 1;

console.log('Es una cadena válida?', txemaCoin.isChainValid());
