import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SecretNetworkApi implements ICredentialType {
	name = 'secretNetworkApi';
	displayName = 'Secret Network API';
	documentationUrl = 'https://docs.scrt.network/secret-network-documentation/';
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Mainnet',
					value: 'mainnet',
				},
				{
					name: 'Testnet (Pulsar)',
					value: 'testnet',
				},
			],
			default: 'mainnet',
			required: true,
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '=https://lcd.secret.express',
			displayOptions: {
				show: {
					network: ['mainnet'],
				},
			},
			required: true,
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '=https://lcd.pulsar.scrttestnet.com',
			displayOptions: {
				show: {
					network: ['testnet'],
				},
			},
			required: true,
		},
		{
			displayName: 'Wallet Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Secret Network wallet private key for signing transactions (required for write operations)',
		},
		{
			displayName: 'Mnemonic Phrase',
			name: 'mnemonic',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Alternative to private key: 12 or 24-word mnemonic phrase',
			displayOptions: {
				show: {
					privateKey: [''],
				},
			},
		},
		{
			displayName: 'Chain ID',
			name: 'chainId',
			type: 'string',
			default: '=secret-4',
			displayOptions: {
				show: {
					network: ['mainnet'],
				},
			},
			required: true,
		},
		{
			displayName: 'Chain ID',
			name: 'chainId',
			type: 'string',
			default: '=pulsar-3',
			displayOptions: {
				show: {
					network: ['testnet'],
				},
			},
			required: true,
		},
	];
}