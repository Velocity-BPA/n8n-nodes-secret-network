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

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
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
describe('SmartContracts Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        baseUrl: 'https://lcd.secret.express',
        address: 'secret1test',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
      },
    };
  });

  describe('executeContract', () => {
    it('should execute contract successfully', async () => {
      const mockResponse = { tx_response: { txhash: 'test-hash' } };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'executeContract';
          case 'contractAddress': return 'secret1contract';
          case 'msg': return { test: 'message' };
          case 'sender': return 'secret1sender';
          case 'funds': return [];
          default: return undefined;
        }
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://lcd.secret.express/cosmos/tx/v1beta1/txs',
        })
      );
    });

    it('should handle errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'executeContract';
        if (param === 'contractAddress') return 'secret1contract';
        return {};
      });
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSmartContractsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual({ error: 'API Error' });
    });
  });

  describe('getContract', () => {
    it('should get contract info successfully', async () => {
      const mockResponse = { contract_info: { address: 'secret1contract' } };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getContract';
          case 'contractAddress': return 'secret1contract';
          default: return undefined;
        }
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://lcd.secret.express/compute/v1beta1/contracts/secret1contract',
        })
      );
    });
  });

  describe('queryContract', () => {
    it('should query contract successfully', async () => {
      const mockResponse = { data: { result: 'test' } };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'queryContract';
          case 'contractAddress': return 'secret1contract';
          case 'query': return { get_balance: {} };
          default: return undefined;
        }
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://lcd.secret.express/compute/v1beta1/contracts/secret1contract/query',
        })
      );
    });
  });

  describe('listCodes', () => {
    it('should list codes successfully', async () => {
      const mockResponse = { code_infos: [], pagination: {} };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        switch (param) {
          case 'operation': return 'listCodes';
          case 'paginationLimit': return defaultValue || 100;
          case 'paginationKey': return defaultValue || '';
          default: return undefined;
        }
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://lcd.secret.express/compute/v1beta1/codes?pagination.limit=100',
        })
      );
    });
  });

  describe('getCode', () => {
    it('should get code info successfully', async () => {
      const mockResponse = { code_info: { code_id: '1' } };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getCode';
          case 'codeId': return '1';
          default: return undefined;
        }
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://lcd.secret.express/compute/v1beta1/codes/1',
        })
      );
    });
  });
});

describe('Snip20Tokens Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        address: 'secret1test',
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

  it('should transfer SNIP-20 tokens successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'transfer';
        case 'contractAddress': return 'secret1contract';
        case 'recipient': return 'secret1recipient';
        case 'amount': return '1000000';
        case 'memo': return 'test transfer';
        default: return '';
      }
    });

    const mockResponse = {
      txhash: 'ABC123',
      code: 0,
      raw_log: 'success',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSnip20TokensOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://lcd.secret.express/cosmos/tx/v1beta1/txs',
      }),
    );
  });

  it('should get token balance successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getBalance';
        case 'contractAddress': return 'secret1contract';
        case 'address': return 'secret1address';
        case 'viewingKey': return 'viewing_key_123';
        default: return '';
      }
    });

    const mockResponse = {
      balance: {
        amount: '1000000',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSnip20TokensOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://lcd.secret.express/compute/v1beta1/contracts/secret1contract/query',
      }),
    );
  });

  it('should get token info successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTokenInfo';
        case 'contractAddress': return 'secret1contract';
        default: return '';
      }
    });

    const mockResponse = {
      token_info: {
        name: 'Secret Token',
        symbol: 'SCRT',
        decimals: 6,
        total_supply: '1000000000000',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSnip20TokensOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should handle errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'transfer';
        case 'contractAddress': return 'secret1contract';
        case 'recipient': return 'secret1recipient';
        case 'amount': return '1000000';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeSnip20TokensOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ error: 'Network error' });
  });

  it('should create viewing key successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'createViewingKey';
        case 'contractAddress': return 'secret1contract';
        case 'entropy': return 'random_entropy';
        default: return '';
      }
    });

    const mockResponse = {
      txhash: 'DEF456',
      code: 0,
      raw_log: 'viewing key created',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSnip20TokensOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });
});

describe('Snip721Tokens Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        baseUrl: 'https://lcd.secret.express',
        chainId: 'secret-4',
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

  describe('transferNft operation', () => {
    it('should transfer NFT successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'transferNft';
          case 'contractAddress': return 'secret1contract';
          case 'tokenId': return '1';
          case 'recipient': return 'secret1recipient';
          case 'privateKey': return 'private-key-hex';
          case 'gasLimit': return 200000;
          case 'gasPrice': return '0.25uscrt';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest
        .mockResolvedValueOnce({
          account: { sequence: '1', account_number: '123' }
        })
        .mockResolvedValueOnce({
          tx_response: { txhash: 'hash123', code: 0 }
        });

      const items = [{ json: {} }];
      const result = await executeSnip721TokensOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.tx_response.txhash).toBe('hash123');
    });

    it('should handle transfer NFT error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'transferNft';
          case 'contractAddress': return 'secret1contract';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeSnip721TokensOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Network error');
    });
  });

  describe('getOwnerOf operation', () => {
    it('should query NFT owner successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getOwnerOf';
          case 'contractAddress': return 'secret1contract';
          case 'tokenId': return '1';
          case 'viewingKey': return 'viewing-key';
          default: return '';
        }
      });

      const mockResponse = {
        data: 'eyJvd25lciI6InNlY3JldDFvd25lciJ9' // base64 encoded owner info
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeSnip721TokensOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.data).toBe('eyJvd25lciI6InNlY3JldDFvd25lciJ9');
    });
  });

  describe('mintNft operation', () => {
    it('should mint NFT successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'mintNft';
          case 'contractAddress': return 'secret1contract';
          case 'tokenId': return '1';
          case 'owner': return 'secret1owner';
          case 'metadata': return { name: 'Test NFT' };
          case 'privateKey': return 'private-key-hex';
          case 'gasLimit': return 200000;
          case 'gasPrice': return '0.25uscrt';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest
        .mockResolvedValueOnce({
          account: { sequence: '1', account_number: '123' }
        })
        .mockResolvedValueOnce({
          tx_response: { txhash: 'mint-hash', code: 0 }
        });

      const items = [{ json: {} }];
      const result = await executeSnip721TokensOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.tx_response.txhash).toBe('mint-hash');
    });
  });

  describe('getNftInfo operation', () => {
    it('should get NFT info successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getNftInfo';
          case 'contractAddress': return 'secret1contract';
          case 'tokenId': return '1';
          case 'viewingKey': return 'viewing-key';
          default: return '';
        }
      });

      const mockResponse = {
        data: 'eyJuYW1lIjoiVGVzdCBORlQifQ==' // base64 encoded NFT info
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeSnip721TokensOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.data).toBe('eyJuYW1lIjoiVGVzdCBORlQifQ==');
    });
  });

  describe('getTokens operation', () => {
    it('should get owned tokens successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getTokens';
          case 'contractAddress': return 'secret1contract';
          case 'owner': return 'secret1owner';
          case 'viewingKey': return 'viewing-key';
          default: return '';
        }
      });

      const mockResponse = {
        data: 'eyJ0b2tlbnMiOlsiMSIsIjIiLCIzIl19' // base64 encoded token list
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeSnip721TokensOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.data).toBe('eyJ0b2tlbnMiOlsiMSIsIjIiLCIzIl19');
    });
  });
});

describe('IbcOperations Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
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

  it('should execute ibcTransfer operation successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      const params: any = {
        operation: 'ibcTransfer',
        sourcePort: 'transfer',
        sourceChannel: 'channel-0',
        token: { denom: 'uscrt', amount: '1000000' },
        sender: 'secret1sender',
        receiver: 'cosmos1receiver',
        timeoutHeight: 0,
        privateKey: 'test-private-key',
        gasLimit: 200000,
        gasPrice: '0.1uscrt',
      };
      return params[paramName];
    });

    const mockResponse = {
      tx_response: {
        txhash: 'test-tx-hash',
        code: 0,
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeIbcOperationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://lcd.secret.express/cosmos/tx/v1beta1/txs',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.objectContaining({
        mode: 'BROADCAST_MODE_SYNC',
      }),
      json: true,
    });
  });

  it('should execute getChannels operation successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      const params: any = {
        operation: 'getChannels',
        paginationOffset: 0,
        paginationLimit: 100,
      };
      return params[paramName];
    });

    const mockResponse = {
      channels: [
        {
          channel_id: 'channel-0',
          port_id: 'transfer',
          state: 'STATE_OPEN',
        },
      ],
      pagination: {
        next_key: null,
        total: '1',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeIbcOperationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://lcd.secret.express/ibc/core/channel/v1/channels',
      qs: {
        'pagination.offset': 0,
        'pagination.limit': 100,
      },
      json: true,
    });
  });

  it('should execute getChannel operation successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      const params: any = {
        operation: 'getChannel',
        channelId: 'channel-0',
        portId: 'transfer',
      };
      return params[paramName];
    });

    const mockResponse = {
      channel: {
        state: 'STATE_OPEN',
        ordering: 'ORDER_UNORDERED',
        counterparty: {
          port_id: 'transfer',
          channel_id: 'channel-141',
        },
        connection_hops: ['connection-0'],
        version: 'ics20-1',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeIbcOperationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://lcd.secret.express/ibc/core/channel/v1/channels/channel-0/ports/transfer',
      json: true,
    });
  });

  it('should execute getDenomTraces operation successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      const params: any = {
        operation: 'getDenomTraces',
        paginationOffset: 0,
        paginationLimit: 100,
      };
      return params[paramName];
    });

    const mockResponse = {
      denom_traces: [
        {
          path: 'transfer/channel-0',
          base_denom: 'uatom',
        },
      ],
      pagination: {
        next_key: null,
        total: '1',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeIbcOperationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://lcd.secret.express/ibc/applications/transfer/v1/denom_traces',
      qs: {
        'pagination.offset': 0,
        'pagination.limit': 100,
      },
      json: true,
    });
  });

  it('should handle errors gracefully when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      const params: any = {
        operation: 'getChannels',
        paginationOffset: 0,
        paginationLimit: 100,
      };
      return params[paramName];
    });

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeIbcOperationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ error: 'API Error' });
  });
});

describe('Transactions Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  describe('broadcastTransaction', () => {
    it('should broadcast a transaction successfully', async () => {
      const mockResponse = {
        tx_response: {
          txhash: 'ABC123',
          code: 0,
          height: '12345',
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'broadcastTransaction';
          case 'txBytes': return 'base64encodedtxbytes';
          case 'mode': return 'BROADCAST_MODE_SYNC';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://lcd.secret.express/cosmos/tx/v1beta1/txs',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key',
        },
        body: {
          tx_bytes: 'base64encodedtxbytes',
          mode: 'BROADCAST_MODE_SYNC',
        },
        json: true,
      });
    });
  });

  describe('getTransaction', () => {
    it('should get transaction by hash successfully', async () => {
      const mockResponse = {
        tx: {
          body: { messages: [] },
          auth_info: { fee: { amount: [] } },
        },
        tx_response: {
          txhash: 'ABC123',
          height: '12345',
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getTransaction';
          case 'hash': return 'ABC123';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/cosmos/tx/v1beta1/txs/ABC123',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getTransactions', () => {
    it('should get transactions by criteria successfully', async () => {
      const mockResponse = {
        txs: [],
        tx_responses: [],
        pagination: { next_key: null, total: '0' },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getTransactions';
          case 'events': return 'message.action=\'/cosmos.bank.v1beta1.MsgSend\'';
          case 'orderBy': return 'ORDER_BY_DESC';
          case 'pageSize': return 10;
          case 'pageKey': return '';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('simulateTransaction', () => {
    it('should simulate transaction successfully', async () => {
      const mockResponse = {
        gas_info: {
          gas_wanted: '100000',
          gas_used: '80000',
        },
        result: {
          data: 'simulation_result',
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'simulateTransaction';
          case 'txData': return '{"body":{"messages":[]}}';
          case 'txBytes': return '';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getBlock', () => {
    it('should get block by height successfully', async () => {
      const mockResponse = {
        block_id: { hash: 'blockhash' },
        block: {
          header: { height: '12345' },
          data: { txs: [] },
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getBlock';
          case 'height': return '12345';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getLatestBlock', () => {
    it('should get latest block successfully', async () => {
      const mockResponse = {
        block_id: { hash: 'blockhash' },
        block: {
          header: { height: '12345' },
          data: { txs: [] },
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getLatestBlock';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle API errors correctly', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        return param === 'operation' ? 'getTransaction' : 'invalid-hash';
      });

      const mockError = {
        response: {
          statusCode: 404,
          body: { error: 'Transaction not found' },
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

      await expect(
        executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        return param === 'operation' ? 'getTransaction' : 'invalid-hash';
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });
});

describe('Accounts Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  describe('getAccount', () => {
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

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAccount';
        if (paramName === 'address') return 'secret1test';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/cosmos/auth/v1beta1/accounts/secret1test',
        headers: {
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle errors when getting account information', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAccount';
        if (paramName === 'address') return 'secret1test';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Account not found'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual({ error: 'Account not found' });
    });
  });

  describe('getBalance', () => {
    it('should get account balance successfully', async () => {
      const mockResponse = {
        balances: [
          { denom: 'uscrt', amount: '1000000' },
          { denom: 'ibc/token', amount: '500000' },
        ],
        pagination: { next_key: null, total: '2' },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getBalance';
        if (paramName === 'address') return 'secret1test';
        if (paramName === 'denom') return '';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });

    it('should filter balance by denomination', async () => {
      const mockResponse = {
        balances: [
          { denom: 'uscrt', amount: '1000000' },
          { denom: 'ibc/token', amount: '500000' },
        ],
        pagination: { next_key: null, total: '2' },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getBalance';
        if (paramName === 'address') return 'secret1test';
        if (paramName === 'denom') return 'uscrt';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.balances).toEqual([{ denom: 'uscrt', amount: '1000000' }]);
    });
  });

  describe('getBalanceByDenom', () => {
    it('should get specific denomination balance successfully', async () => {
      const mockResponse = {
        balance: { denom: 'uscrt', amount: '1000000' },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getBalanceByDenom';
        if (paramName === 'address') return 'secret1test';
        if (paramName === 'denom') return 'uscrt';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://lcd.secret.express/cosmos/bank/v1beta1/balances/secret1test/uscrt',
        headers: {
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getDelegationRewards', () => {
    it('should get delegation rewards successfully', async () => {
      const mockResponse = {
        rewards: [
          {
            validator_address: 'secretvaloper1test',
            reward: [{ denom: 'uscrt', amount: '100000.000000000000000000' }],
          },
        ],
        total: [{ denom: 'uscrt', amount: '100000.000000000000000000' }],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getDelegationRewards';
        if (paramName === 'delegatorAddress') return 'secret1test';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getDelegations', () => {
    it('should get delegations successfully', async () => {
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

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getDelegations';
        if (paramName === 'delegatorAddr') return 'secret1test';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getUnbondingDelegations', () => {
    it('should get unbonding delegations successfully', async () => {
      const mockResponse = {
        unbonding_responses: [
          {
            delegator_address: 'secret1test',
            validator_address: 'secretvaloper1test',
            entries: [
              {
                creation_height: '1000000',
                completion_time: '2023-12-31T23:59:59Z',
                initial_balance: '1000000',
                balance: '1000000',
              },
            ],
          },
        ],
        pagination: { next_key: null, total: '1' },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getUnbondingDelegations';
        if (paramName === 'delegatorAddr') return 'secret1test';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });
});
});
