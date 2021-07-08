/* eslint-disable */
import web3 from './web3';

const address = '0x4f221BB63440bADdD809ADF1b0380d3e16c0f2Bb';
const abi = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_coolNumber",
				"type": "uint256"
			}
		],
		"name": "setCoolNumber",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "coolNumber",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const instance = new web3.eth.Contract(abi, address);

export default instance;
