/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { SecretNetwork } from '../nodes/Secret Network/Secret Network.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('SecretNetwork Node', () => {
  let node: SecretNetwork;

  beforeAll(() => {
    node = new SecretNetwork();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Secret Network');
      expect(node.description.name).toBe('secretnetwork');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 7 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(7);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(7);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Blocks Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        username: 'test-user',
        password: 'test-pass',
        baseUrl: 'https://lcd.secret.express' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  describe('getLatestBlock', () => {
    it('should get the latest block successfully', async () => {
      const mockResponse = { block: { header: { height: '12345' } } };
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getLatestBlock');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/cosmos/base/tendermint/v1beta1/blocks/latest',
        headers: { 'Content-Type': 'application/json' },
        json: true,
        auth: { user: 'test-user', pass: 'test-pass' }
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle errors when getting latest block', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getLatestBlock');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getBlock', () => {
    it('should get a block by height successfully', async () => {
      const mockResponse = { block: { header: { height: '100' } } };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBlock')
        .mockReturnValueOnce(100);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/cosmos/base/tendermint/v1beta1/blocks/100',
        headers: { 'Content-Type': 'application/json' },
        json: true,
        auth: { user: 'test-user', pass: 'test-pass' }
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getNodeInfo', () => {
    it('should get node information successfully', async () => {
      const mockResponse = { default_node_info: { network: 'secret-4' } };
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getNodeInfo');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/cosmos/base/tendermint/v1beta1/node_info',
        headers: { 'Content-Type': 'application/json' },
        json: true,
        auth: { user: 'test-user', pass: 'test-pass' }
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getLatestValidatorSet', () => {
    it('should get the latest validator set successfully', async () => {
      const mockResponse = { validators: [{ address: 'validator1' }] };
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getLatestValidatorSet');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/cosmos/base/tendermint/v1beta1/validatorsets/latest',
        headers: { 'Content-Type': 'application/json' },
        json: true,
        auth: { user: 'test-user', pass: 'test-pass' }
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getValidatorSet', () => {
    it('should get validator set by height successfully', async () => {
      const mockResponse = { validators: [{ address: 'validator1' }] };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getValidatorSet')
        .mockReturnValueOnce(500);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/cosmos/base/tendermint/v1beta1/validatorsets/500',
        headers: { 'Content-Type': 'application/json' },
        json: true,
        auth: { user: 'test-user', pass: 'test-pass' }
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Transactions Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				username: 'test-user',
				password: 'test-pass',
				baseUrl: 'https://lcd.secret.express'
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn()
			},
		};
	});

	it('should get transaction by hash successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getTransaction')
			.mockReturnValueOnce('test-hash');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			tx: { hash: 'test-hash' },
			tx_response: { txhash: 'test-hash', height: '123' }
		});

		const result = await executeTransactionsOperations.call(
			mockExecuteFunctions,
			[{ json: {} }]
		);

		expect(result).toHaveLength(1);
		expect(result[0].json.tx.hash).toBe('test-hash');
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://lcd.secret.express/cosmos/tx/v1beta1/txs/test-hash',
			headers: {
				'Authorization': expect.stringContaining('Basic'),
				'Content-Type': 'application/json'
			},
			json: true
		});
	});

	it('should search transactions successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getTransactions')
			.mockReturnValueOnce('transfer.sender=secret123')
			.mockReturnValueOnce('')
			.mockReturnValueOnce(50);
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			txs: [{ hash: 'tx1' }, { hash: 'tx2' }],
			pagination: { total: '2' }
		});

		const result = await executeTransactionsOperations.call(
			mockExecuteFunctions,
			[{ json: {} }]
		);

		expect(result).toHaveLength(1);
		expect(result[0].json.txs).toHaveLength(2);
	});

	it('should broadcast transaction successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('broadcastTransaction')
			.mockReturnValueOnce('base64-encoded-tx')
			.mockReturnValueOnce('BROADCAST_MODE_SYNC');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			tx_response: { txhash: 'broadcast-hash', code: 0 }
		});

		const result = await executeTransactionsOperations.call(
			mockExecuteFunctions,
			[{ json: {} }]
		);

		expect(result).toHaveLength(1);
		expect(result[0].json.tx_response.txhash).toBe('broadcast-hash');
	});

	it('should simulate transaction successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('simulateTransaction')
			.mockReturnValueOnce('base64-encoded-tx');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			gas_info: { gas_used: '50000', gas_wanted: '100000' },
			result: { data: 'simulation-result' }
		});

		const result = await executeTransactionsOperations.call(
			mockExecuteFunctions,
			[{ json: {} }]
		);

		expect(result).toHaveLength(1);
		expect(result[0].json.gas_info.gas_used).toBe('50000');
	});

	it('should get transactions by height successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getTransactionsByHeight')
			.mockReturnValueOnce(12345);
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			txs: [{ hash: 'block-tx1' }, { hash: 'block-tx2' }],
			pagination: { total: '2' }
		});

		const result = await executeTransactionsOperations.call(
			mockExecuteFunctions,
			[{ json: {} }]
		);

		expect(result).toHaveLength(1);
		expect(result[0].json.txs).toHaveLength(2);
	});

	it('should handle errors gracefully when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getTransaction');
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

		const result = await executeTransactionsOperations.call(
			mockExecuteFunctions,
			[{ json: {} }]
		);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('Network error');
	});

	it('should throw error when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getTransaction');
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

		await expect(
			executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }])
		).rejects.toThrow('Network error');
	});
});

describe('Accounts Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        username: 'test-user',
        password: 'test-pass',
        baseUrl: 'https://lcd.secret.express',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getAccount operation', () => {
    it('should get account information successfully', async () => {
      const mockResponse = {
        account: {
          '@type': '/cosmos.auth.v1beta1.BaseAccount',
          address: 'secret1test',
          pub_key: null,
          account_number: '123',
          sequence: '0',
        },
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccount')
        .mockReturnValueOnce('secret1test');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);
    });

    it('should handle getAccount errors', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccount')
        .mockReturnValueOnce('invalid-address');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAccountsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([
        {
          json: { error: 'Invalid address' },
          pairedItem: { item: 0 },
        },
      ]);
    });
  });

  describe('getBalances operation', () => {
    it('should get account balances successfully', async () => {
      const mockResponse = {
        balances: [
          { denom: 'uscrt', amount: '1000000' },
        ],
        pagination: { next_key: null, total: '1' },
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBalances')
        .mockReturnValueOnce('secret1test')
        .mockReturnValueOnce('');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);
    });
  });

  describe('getBalanceByDenom operation', () => {
    it('should get balance by denomination successfully', async () => {
      const mockResponse = {
        balance: { denom: 'uscrt', amount: '1000000' },
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBalanceByDenom')
        .mockReturnValueOnce('secret1test')
        .mockReturnValueOnce('uscrt');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);
    });
  });

  describe('getTotalSupply operation', () => {
    it('should get total supply successfully', async () => {
      const mockResponse = {
        supply: [
          { denom: 'uscrt', amount: '1000000000000' },
        ],
        pagination: { next_key: null, total: '1' },
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTotalSupply')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(100);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);
    });
  });

  describe('getSupplyByDenom operation', () => {
    it('should get supply by denomination successfully', async () => {
      const mockResponse = {
        amount: { denom: 'uscrt', amount: '1000000000000' },
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getSupplyByDenom')
        .mockReturnValueOnce('uscrt');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);
    });
  });
});

describe('Staking Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				baseUrl: 'https://lcd.secret.express',
				username: 'test-user',
				password: 'test-pass',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	test('getValidators operation should fetch validators list', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getValidators')
			.mockReturnValueOnce('BOND_STATUS_BONDED')
			.mockReturnValueOnce(50)
			.mockReturnValueOnce('');

		const mockResponse = {
			validators: [
				{
					operator_address: 'secretvaloper1test',
					consensus_pubkey: { '@type': '/cosmos.crypto.ed25519.PubKey' },
					jailed: false,
					status: 'BOND_STATUS_BONDED',
				},
			],
			pagination: { next_key: null, total: '1' },
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeStakingOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://lcd.secret.express/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.limit=50',
			headers: { 'Content-Type': 'application/json' },
			json: true,
			auth: { user: 'test-user', pass: 'test-pass' },
		});

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
	});

	test('getValidator operation should fetch validator details', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getValidator')
			.mockReturnValueOnce('secretvaloper1test');

		const mockResponse = {
			validator: {
				operator_address: 'secretvaloper1test',
				consensus_pubkey: { '@type': '/cosmos.crypto.ed25519.PubKey' },
				jailed: false,
				status: 'BOND_STATUS_BONDED',
			},
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeStakingOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://lcd.secret.express/cosmos/staking/v1beta1/validators/secretvaloper1test',
			headers: { 'Content-Type': 'application/json' },
			json: true,
			auth: { user: 'test-user', pass: 'test-pass' },
		});

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
	});

	test('getDelegations operation should fetch delegator delegations', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getDelegations')
			.mockReturnValueOnce('secret1test');

		const mockResponse = {
			delegation_responses: [
				{
					delegation: {
						delegator_address: 'secret1test',
						validator_address: 'secretvaloper1test',
						shares: '1000000.000000000000000000',
					},
					balance: { denom: 'uscrt', amount: '1000000' },
				},
			],
			pagination: { next_key: null, total: '1' },
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeStakingOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://lcd.secret.express/cosmos/staking/v1beta1/delegations/secret1test',
			headers: { 'Content-Type': 'application/json' },
			json: true,
			auth: { user: 'test-user', pass: 'test-pass' },
		});

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
	});

	test('should handle errors gracefully when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getValidators');
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		const result = await executeStakingOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
	});

	test('should throw error when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getValidators');
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		await expect(
			executeStakingOperations.call(mockExecuteFunctions, [{ json: {} }])
		).rejects.toThrow('API Error');
	});
});

describe('SmartContracts Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        username: 'test-user',
        password: 'test-pass',
        baseUrl: 'https://lcd.secret.express'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
      },
    };
  });

  describe('getContracts operation', () => {
    it('should get all contract codes successfully', async () => {
      const mockResponse = { code_infos: [] };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getContracts')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(100);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([
        { json: mockResponse, pairedItem: { item: 0 } }
      ]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/compute/v1beta1/codes?pagination.offset=0&pagination.limit=100',
        headers: expect.any(Object),
        json: true
      });
    });

    it('should handle errors in getContracts', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getContracts');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSmartContractsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getContractCode operation', () => {
    it('should get contract code by ID successfully', async () => {
      const mockResponse = { code_info: {} };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getContractCode')
        .mockReturnValueOnce('123');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([
        { json: mockResponse, pairedItem: { item: 0 } }
      ]);
    });
  });

  describe('queryContract operation', () => {
    it('should query contract state successfully', async () => {
      const mockResponse = { query_result: {} };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('queryContract')
        .mockReturnValueOnce('secret1234')
        .mockReturnValueOnce('{"balance": {}}')
        .mockReturnValueOnce('viewing_key_123');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([
        { json: mockResponse, pairedItem: { item: 0 } }
      ]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://lcd.secret.express/compute/v1beta1/contracts/secret1234/query',
        headers: expect.any(Object),
        json: true,
        body: {
          query: { balance: {} },
          viewing_key: 'viewing_key_123'
        }
      });
    });
  });
});

describe('Governance Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        username: 'test-user',
        password: 'test-password',
        baseUrl: 'https://lcd.secret.express'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  describe('getProposals', () => {
    it('should get all proposals successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getProposals')
        .mockReturnValueOnce('PROPOSAL_STATUS_UNSPECIFIED')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('');

      const mockResponse = {
        proposals: [
          { proposal_id: '1', content: { title: 'Test Proposal' } }
        ]
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeGovernanceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/cosmos/gov/v1beta1/proposals',
        headers: { 'Accept': 'application/json' },
        auth: { username: 'test-user', password: 'test-password' },
        json: true,
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });

    it('should handle getProposals error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getProposals');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeGovernanceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{
        json: { error: 'API Error' },
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getProposal', () => {
    it('should get specific proposal successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getProposal')
        .mockReturnValueOnce('123');

      const mockResponse = {
        proposal: { proposal_id: '123', content: { title: 'Test Proposal' } }
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeGovernanceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/cosmos/gov/v1beta1/proposals/123',
        headers: { 'Accept': 'application/json' },
        auth: { username: 'test-user', password: 'test-password' },
        json: true,
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getProposalVotes', () => {
    it('should get proposal votes successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getProposalVotes')
        .mockReturnValueOnce('123');

      const mockResponse = {
        votes: [{ proposal_id: '123', voter: 'secret1...', option: 'VOTE_OPTION_YES' }]
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeGovernanceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/cosmos/gov/v1beta1/proposals/123/votes',
        headers: { 'Accept': 'application/json' },
        auth: { username: 'test-user', password: 'test-password' },
        json: true,
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getVote', () => {
    it('should get specific vote successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getVote')
        .mockReturnValueOnce('123')
        .mockReturnValueOnce('secret1voter');

      const mockResponse = {
        vote: { proposal_id: '123', voter: 'secret1voter', option: 'VOTE_OPTION_YES' }
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeGovernanceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/cosmos/gov/v1beta1/proposals/123/votes/secret1voter',
        headers: { 'Accept': 'application/json' },
        auth: { username: 'test-user', password: 'test-password' },
        json: true,
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getProposalDeposits', () => {
    it('should get proposal deposits successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getProposalDeposits')
        .mockReturnValueOnce('123');

      const mockResponse = {
        deposits: [{ proposal_id: '123', depositor: 'secret1...', amount: [{ denom: 'uscrt', amount: '1000' }] }]
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeGovernanceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/cosmos/gov/v1beta1/proposals/123/deposits',
        headers: { 'Accept': 'application/json' },
        auth: { username: 'test-user', password: 'test-password' },
        json: true,
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });
});

describe('IBC Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        username: 'test-user',
        password: 'test-pass',
        baseUrl: 'https://lcd.secret.express'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  describe('getClientStates', () => {
    it('should get client states successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getClientStates')
        .mockReturnValueOnce({ limit: 100 });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        client_states: [],
        pagination: {}
      });

      const result = await executeIBCOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/ibc/core/client/v1/client_states?pagination.limit=100',
        headers: {
          'Authorization': expect.stringContaining('Basic '),
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result[0].json).toEqual({ client_states: [], pagination: {} });
    });

    it('should handle errors', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getClientStates')
        .mockReturnValueOnce({});
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const result = await executeIBCOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getClientState', () => {
    it('should get client state by ID successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getClientState')
        .mockReturnValueOnce('07-tendermint-0');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        client_state: { client_id: '07-tendermint-0' }
      });

      const result = await executeIBCOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/ibc/core/client/v1/client_states/07-tendermint-0',
        headers: {
          'Authorization': expect.stringContaining('Basic '),
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result[0].json.client_state.client_id).toBe('07-tendermint-0');
    });
  });

  describe('getConnections', () => {
    it('should get connections successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getConnections')
        .mockReturnValueOnce({ countTotal: true });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        connections: [],
        pagination: { total: '0' }
      });

      const result = await executeIBCOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/ibc/core/connection/v1/connections?pagination.count_total=true',
        headers: {
          'Authorization': expect.stringContaining('Basic '),
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result[0].json).toEqual({ connections: [], pagination: { total: '0' } });
    });
  });

  describe('getConnection', () => {
    it('should get connection by ID successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getConnection')
        .mockReturnValueOnce('connection-0');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        connection: { id: 'connection-0' }
      });

      const result = await executeIBCOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/ibc/core/connection/v1/connections/connection-0',
        headers: {
          'Authorization': expect.stringContaining('Basic '),
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result[0].json.connection.id).toBe('connection-0');
    });
  });

  describe('getChannels', () => {
    it('should get channels successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getChannels')
        .mockReturnValueOnce({ offset: 50 });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        channels: [],
        pagination: {}
      });

      const result = await executeIBCOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/ibc/core/channel/v1/channels?pagination.offset=50',
        headers: {
          'Authorization': expect.stringContaining('Basic '),
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result[0].json).toEqual({ channels: [], pagination: {} });
    });
  });
});
});
