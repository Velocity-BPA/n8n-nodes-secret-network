import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SecretNetworkApi implements ICredentialType {
	name = 'secretNetworkApi';
	displayName = 'Secret Network API';
	documentationUrl = 'https://docs.scrt.network/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://lcd.secret.express',
			required: true,
			description: 'The base URL for the Secret Network LCD endpoint',
		},
		{
			displayName: 'Authentication Required',
			name: 'authRequired',
			type: 'boolean',
			default: false,
			description: 'Whether authentication is required for this endpoint',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					authRequired: [true],
				},
			},
			description: 'Username for basic authentication',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					authRequired: [true],
				},
			},
			description: 'Password for basic authentication',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Private key for transaction signing (optional, required for write operations)',
		},
	];
}