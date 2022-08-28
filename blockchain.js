const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec =  new EC('secp256k1');

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('No puedes firmar transacciones de otras carteras!!');
        }

        const hashTX = this.calculateHash();
        
        // Utilizamos esta fiorma para la firma
        const sig = signingKey.sign(hashTX, 'base64');

        // Almacenamos esta firma
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error('No existe firma en esta transacción')
        }
        
        // Obtenemos ahora la clave pública y la retornamos tras verificarla

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);

    }

}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        // timestamp: fecha registro transacción
        // data: detalles de la transacción como cantidad, emisor y receptor
        // previoushash: hash del bloque previo.

        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp 
                      +JSON.stringify(this.data) + this.nonce ).toString();
    }

    mineBlock(dificultad){
        // Añadimos los 0's al principio en función de la longitud dificultad 

        while(this.hash.substring(0, dificultad) !== Array(dificultad +1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined:"+ this.hash);
    }

    hasValidTransactions(){
        for( const tx of this.transactions ){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

class Blockchain{
    constructor(){
        // Inicializa el Blockchain
        this.chain = [this.createGenesisBlock()];
        this.dificultad = 2; // por ejemplo
        this.pendingTransactions =[];
        this.miningReward = 100; // Número de monedas por premio
    }

    createGenesisBlock(){
        return new Block("01/01/2022", "Genesis block", "0" );
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1 ];
    }

    minePendingTransactions(miningRewardAddress){
        // Si la transacción es correcta le enviamos una recompensa a esra dirección
        // Creamos un nuevo bloque

        let block = new Block(Date.now(),this.pendingTransactions);
        block.mineBlock(this.dificultad);

        console.log('Block creado correctamente!');
        this.chain.push(block);

        // Reseteamos las transacciones pendientes y creamos una nueva transacción 
        // para recompensar al emisor

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    addTransaction(transaction){

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('La transacción debe incluir un origen y un destino');
        }

        if(!transaction.isValid()){
            throw new Error('No se pueden añadir transacciones no válidas');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;
        // Comprobamos bloque a bloque

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    isChainValid(){
        // Debemos recorrer todos los nodos de la cadena
        for(let i = 1;i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;