const TokenABI = require('./erc20_abi.js');

class ERC20 {
    constructor(wei, address) {
        this._wei = wei;
        this.contract = wei.contract(TokenABI).at(address);
    }

    async _address() {
        return (await this._wei.rpc.eth.accounts())[0];
    }

    async name() {
        return (await this.contract.name()).output[0];
    }

    async symbol() {
        return (await this.contract.symbol()).output[0];
    }

    async transfer(to, value) {
        await this.contract.transfer(to, value, { from: (await this._address()) });
    }

    async approve(spender, value) {
        await this.contract.approve(spender, value, { from: (await this._address()) });
    }

    async totalSupply() {
        return (await this.contract.totalSupply()).output[0];
    }

    async transferFrom(from, to, address) {
        (await this.contract.transferFrom(from, to, address, { from: (await this._address()) }));
    }

    async decimals() {
        return (await this.contract.decimals()).output[0];
    }

    async allowance(owner, spender) {
        return (await this.contract.allowance(owner, spender)).output[0];
    }

    async balance(address) {
        return (await this.contract.balanceOf(address)).output[0];
    }

    async approveAndCall(spender, value, extraData) {
        await this.contract.approveAndCall(spender, value, extraData, { from: (await this._address()) });
    }
}

module.exports = ERC20;