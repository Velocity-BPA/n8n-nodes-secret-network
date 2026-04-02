/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-secretnetwork/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

import { createHash } from 'crypto';
import * as bech32 from 'bech32';
import * as secp256k1 from 'secp256k1';
import { Buffer } from 'buffer';

export class SecretNetwork implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Secret Network',
    name: 'secretnetwork',
    icon: 'file:secretnetwork.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Secret Network API',
    defaults: {
      name: 'Secret Network',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'secretnetworkApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Blocks',
            value: 'blocks',
          },
          {
            name: 'Transactions',
            value: 'transactions',
          },
          {
            name: 'Accounts',
            value: 'accounts',
          },
          {
            name: 'Staking',
            value: 'staking',
          },
          {
            name: 'SmartContracts',
            value: 'smartContracts',
          },
          {
            name: 'Governance',
            value: 'governance',
          },
          {
            name: 'IBC',
            value: 'iBC',
          },
          {
            name: 'Snip20Tokens',
            value: 'snip20Tokens',
          },
          {
            name: 'Snip721Tokens',
            value: 'snip721Tokens',
          },
          {
            name: 'IbcOperations',
            value: 'ibcOperations',
          }
        ],
        default: 'blocks',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['blocks'] } },
  options: [
    { name: 'Get Latest Block', value: 'getLatestBlock', description: 'Get the latest block', action: 'Get latest block' },
    { name: 'Get Block', value: 'getBlock', description: 'Get block by height', action: 'Get block by height' },
    { name: 'Get Node Info', value: 'getNodeInfo', description: 'Get node information', action: 'Get node information' },
    { name: 'Get Latest Validator Set', value: 'getLatestValidatorSet', description: 'Get latest validator set', action: 'Get latest validator set' },
    { name: 'Get Validator Set', value: 'getValidatorSet', description: 'Get validator set by height', action: 'Get validator set by height' }
  ],
  default: 'getLatestBlock',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['transactions'] } },
	options: [
		{ name: 'Get Transaction', value: 'getTransaction', description: 'Get transaction by hash', action: 'Get transaction by hash' },
		{ name: 'Get Transactions', value: 'getTransactions', description: 'Search transactions', action: 'Search transactions' },
		{ name: 'Broadcast Transaction', value: 'broadcastTransaction', description: 'Broadcast transaction', action: 'Broadcast transaction' },
		{ name: 'Simulate Transaction', value: 'simulateTransaction', description: 'Simulate transaction execution', action: 'Simulate transaction execution' },
		{ name: 'Get Transactions By Height', value: 'getTransactionsByHeight', description: 'Get transactions by block height', action: 'Get transactions by block height' },
	],
	default: 'getTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['accounts'] } },
  options: [
    { name: 'Get Account', value: 'getAccount', description: 'Get account information', action: 'Get account information' },
    { name: 'Get Balances', value: 'getBalances', description: 'Get account balances', action: 'Get account balances' },
    { name: 'Get Balance by Denom', value: 'getBalanceByDenom', description: 'Get balance for specific denomination', action: 'Get balance for specific denomination' },
    { name: 'Get Total Supply', value: 'getTotalSupply', description: 'Get total supply of all tokens', action: 'Get total supply of all tokens' },
    { name: 'Get Supply by Denom', value: 'getSupplyByDenom', description: 'Get supply for specific denomination', action: 'Get supply for specific denomination' },
    { name: 'Get Account Balance', value: 'getBalance', description: 'Get account balance for all denominations', action: 'Get account balance' },
    { name: 'Get Delegation Rewards', value: 'getDelegationRewards', description: 'Get delegation rewards for a delegator address', action: 'Get delegation rewards' },
    { name: 'Get Delegations', value: 'getDelegations', description: 'Get all delegations for a delegator address', action: 'Get delegations' },
    { name: 'Get Unbonding Delegations', value: 'getUnbondingDelegations', description: 'Get unbonding delegations for a delegator address', action: 'Get unbonding delegations' },
  ],
  default: 'getAccount',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['staking'],
		},
	},
	options: [
		{
			name: 'Get Validators',
			value: 'getValidators',
			description: 'Get all validators in the network',
			action: 'Get validators',
		},
		{
			name: 'Get Validator',
			value: 'getValidator',
			description: 'Get details of a specific validator',
			action: 'Get validator details',
		},
		{
			name: 'Get Delegations',
			value: 'getDelegations',
			description: 'Get delegations for a specific delegator',
			action: 'Get delegator delegations',
		},
		{
			name: 'Get Validator Delegations',
			value: 'getValidatorDelegations',
			description: 'Get all delegations to a specific validator',
			action: 'Get validator delegations',
		},
		{
			name: 'Get Unbonding Delegations',
			value: 'getUnbondingDelegations',
			description: 'Get unbonding delegations for a delegator',
			action: 'Get unbonding delegations',
		},
	],
	default: 'getValidators',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['smartContracts'] } },
  options: [
    {
      name: 'Get Contracts',
      value: 'getContracts',
      description: 'Get all uploaded contract codes',
      action: 'Get all uploaded contract codes'
    },
    {
      name: 'Get Contract Code',
      value: 'getContractCode',
      description: 'Get contract code by ID',
      action: 'Get contract code by ID'
    },
    {
      name: 'Get Contract Info',
      value: 'getContractInfo',
      description: 'Get contract information',
      action: 'Get contract information'
    },
    {
      name: 'Query Contract',
      value: 'queryContract',
      description: 'Query contract state',
      action: 'Query contract state'
    },
    {
      name: 'Get Contracts By Code',
      value: 'getContractsByCode',
      description: 'Get contracts by code ID',
      action: 'Get contracts by code ID'
    },
    {
      name: 'Execute Contract',
      value: 'executeContract',
      description: 'Execute smart contract function',
      action: 'Execute contract',
    },
    {
      name: 'Get Contract',
      value: 'getContract',
      description: 'Get contract information',
      action: 'Get contract',
    },
    {
      name: 'Instantiate Contract',
      value: 'instantiateContract',
      description: 'Deploy new contract instance',
      action: 'Instantiate contract',
    },
    {
      name: 'List Codes',
      value: 'listCodes',
      description: 'Get all uploaded contract codes',
      action: 'List codes',
    },
    {
      name: 'Store Code',
      value: 'storeCode',
      description: 'Upload contract code',
      action: 'Store code',
    },
    {
      name: 'Get Code',
      value: 'getCode',
      description: 'Get contract code info',
      action: 'Get code',
    }
  ],
  default: 'getContracts',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['governance'] } },
  options: [
    { name: 'Get Proposals', value: 'getProposals', description: 'Get all governance proposals', action: 'Get all governance proposals' },
    { name: 'Get Proposal', value: 'getProposal', description: 'Get proposal by ID', action: 'Get proposal by ID' },
    { name: 'Get Proposal Votes', value: 'getProposalVotes', description: 'Get votes for proposal', action: 'Get votes for proposal' },
    { name: 'Get Vote', value: 'getVote', description: 'Get specific vote', action: 'Get specific vote' },
    { name: 'Get Proposal Deposits', value: 'getProposalDeposits', description: 'Get deposits for proposal', action: 'Get deposits for proposal' },
  ],
  default: 'getProposals',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['iBC'] } },
  options: [
    {
      name: 'Get Client States',
      value: 'getClientStates',
      description: 'Get all IBC client states',
      action: 'Get client states',
    },
    {
      name: 'Get Client State',
      value: 'getClientState',
      description: 'Get client state by ID',
      action: 'Get client state',
    },
    {
      name: 'Get Connections',
      value: 'getConnections',
      description: 'Get all IBC connections',
      action: 'Get connections',
    },
    {
      name: 'Get Connection',
      value: 'getConnection',
      description: 'Get connection by ID',
      action: 'Get connection',
    },
    {
      name: 'Get Channels',
      value: 'getChannels',
      description: 'Get all IBC channels',
      action: 'Get channels',
    },
  ],
  default: 'getClientStates',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['snip20Tokens'],
    },
  },
  options: [
    {
      name: 'Transfer',
      value: 'transfer',
      description: 'Transfer SNIP-20 tokens to another address',
      action: 'Transfer SNIP-20 tokens',
    },
    {
      name: 'Get Balance',
      value: 'getBalance',
      description: 'Query token balance for an address',
      action: 'Get token balance',
    },
    {
      name: 'Increase Allowance',
      value: 'increaseAllowance',
      description: 'Increase spending allowance for a spender',
      action: 'Increase spending allowance',
    },
    {
      name: 'Decrease Allowance',
      value: 'decreaseAllowance',
      description: 'Decrease spending allowance for a spender',
      action: 'Decrease spending allowance',
    },
    {
      name: 'Get Allowance',
      value: 'getAllowance',
      description: 'Query spending allowance between owner and spender',
      action: 'Get spending allowance',
    },
    {
      name: 'Get Token Info',
      value: 'getTokenInfo',
      description: 'Get token metadata and information',
      action: 'Get token information',
    },
    {
      name: 'Create Viewing Key',
      value: 'createViewingKey',
      description: 'Generate a viewing key for balance queries',
      action: 'Create viewing key',
    },
    {
      name: 'Set Viewing Key',
      value: 'setViewingKey',
      description: 'Set a custom viewing key',
      action: 'Set viewing key',
    },
  ],
  default: 'transfer',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['snip721Tokens'],
    },
  },
  options: [
    {
      name: 'Transfer NFT',
      value: 'transferNft',
      description: 'Transfer NFT to another address',
      action: 'Transfer NFT',
    },
    {
      name: 'Mint NFT',
      value: 'mintNft',
      description: 'Mint new NFT',
      action: 'Mint NFT',
    },
    {
      name: 'Get Owner Of',
      value: 'getOwnerOf',
      description: 'Query NFT owner',
      action: 'Get owner of NFT',
    },
    {
      name: 'Get NFT Info',
      value: 'getNftInfo',
      description: 'Get NFT metadata',
      action: 'Get NFT info',
    },
    {
      name: 'Approve',
      value: 'approve',
      description: 'Approve address to transfer specific NFT',
      action: 'Approve NFT transfer',
    },
    {
      name: 'Approve All',
      value: 'approveAll',
      description: 'Approve address to transfer all NFTs',
      action: 'Approve all NFTs',
    },
    {
      name: 'Get Approvals',
      value: 'getApprovals',
      description: 'Query NFT approvals',
      action: 'Get NFT approvals',
    },
    {
      name: 'Get Tokens',
      value: 'getTokens',
      description: 'List owned tokens',
      action: 'Get owned tokens',
    },
  ],
  default: 'transferNft',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
    },
  },
  options: [
    {
      name: 'IBC Transfer',
      value: 'ibcTransfer',
      description: 'Initiate IBC token transfer',
      action: 'Initiate IBC token transfer',
    },
    {
      name: 'Get Channels',
      value: 'getChannels',
      description: 'List all IBC channels',
      action: 'List all IBC channels',
    },
    {
      name: 'Get Channel',
      value: 'getChannel',
      description: 'Get specific IBC channel info',
      action: 'Get specific IBC channel info',
    },
    {
      name: 'Get Connections',
      value: 'getConnections',
      description: 'List all IBC connections',
      action: 'List all IBC connections',
    },
    {
      name: 'Get Connection',
      value: 'getConnection',
      description: 'Get specific IBC connection',
      action: 'Get specific IBC connection',
    },
    {
      name: 'Get Client States',
      value: 'getClientStates',
      description: 'List IBC client states',
      action: 'List IBC client states',
    },
    {
      name: 'Get Denom Traces',
      value: 'getDenomTraces',
      description: 'Get IBC denomination traces',
      action: 'Get IBC denomination traces',
    },
    {
      name: 'Update Client',
      value: 'updateClient',
      description: 'Update IBC client',
      action: 'Update IBC client',
    },
  ],
  default: 'ibcTransfer',
},
      // Parameter definitions
{
  displayName: 'Height',
  name: 'height',
  type: 'number',
  required: true,
  default: 1,
  description: 'Block height to retrieve',
  displayOptions: { show: { resource: ['blocks'], operation: ['getBlock'] } },
},
{
  displayName: 'Height',
  name: 'height',
  type: 'number',
  required: true,
  default: 1,
  description: 'Height for which to retrieve the validator set',
  displayOptions: { show: { resource: ['blocks'], operation: ['getValidatorSet'] } },
},
{
	displayName: 'Hash',
	name: 'hash',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transactions'],
			operation: ['getTransaction']
		}
	},
	default: '',
	description: 'Transaction hash to retrieve'
},
{
	displayName: 'Events',
	name: 'events',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['transactions'],
			operation: ['getTransactions']
		}
	},
	default: '',
	description: 'Event query filters for searching transactions'
},
{
	displayName: 'Page Key',
	name: 'pageKey',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['transactions'],
			operation: ['getTransactions']
		}
	},
	default: '',
	description: 'Pagination key for next page'
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['transactions'],
			operation: ['getTransactions']
		}
	},
	default: 100,
	description: 'Maximum number of transactions to return'
},
{
	displayName: 'Transaction Bytes',
	name: 'txBytes',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transactions'],
			operation: ['broadcastTransaction', 'simulateTransaction']
		}
	},
	default: '',
	description: 'Base64 encoded transaction bytes'
},
{
	displayName: 'Broadcast Mode',
	name: 'mode',
	type: 'options',
	options: [
		{ name: 'Sync', value: 'BROADCAST_MODE_SYNC' },
		{ name: 'Async', value: 'BROADCAST_MODE_ASYNC' },
		{ name: 'Block', value: 'BROADCAST_MODE_BLOCK' }
	],
	displayOptions: {
		show: {
			resource: ['transactions'],
			operation: ['broadcastTransaction']
		}
	},
	default: 'BROADCAST_MODE_SYNC',
	description: 'Broadcast mode for transaction'
},
{
	displayName: 'Block Height',
	name: 'height',
	type: 'number',
	required: true,
	displayOptions: {
		show: {
			resource: ['transactions'],
			operation: ['getTransactionsByHeight']
		}
	},
	default: 0,
	description: 'Block height to get transactions from'
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccount', 'getBalances', 'getBalanceByDenom', 'getBalance'],
    },
  },
  default: '',
  description: 'The Secret Network address to query',
},
{
  displayName: 'Denomination',
  name: 'denom',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getBalances', 'getBalance'],
    },
  },
  default: '',
  description: 'Filter balances by denomination (optional)',
},
{
  displayName: 'Denomination',
  name: 'denom',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getBalanceByDenom', 'getSupplyByDenom'],
    },
  },
  default: 'uscrt',
  description: 'The denomination to query (e.g., uscrt)',
},
{
  displayName: 'Pagination Key',
  name: 'paginationKey',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTotalSupply'],
    },
  },
  default: '',
  description: 'Pagination key for retrieving next page of results',
},
{
  displayName: 'Page Limit',
  name: 'pageLimit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTotalSupply'],
    },
  },
  default: 100,
  description: 'Maximum number of results to return per page',
},
{
  displayName: 'Delegator Address',
  name: 'delegatorAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getDelegationRewards'],
    },
  },
  default: '',
  description: 'The delegator address to get rewards for',
  placeholder: 'secret1...',
},
{
  displayName: 'Delegator Address',
  name: 'delegatorAddr',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getDelegations', 'getUnbondingDelegations'],
    },
  },
  default: '',
  description: 'The delegator address to get delegations for',
  placeholder: 'secret1...',
},
{
	displayName: 'Status',
	name: 'status',
	type: 'options',
	displayOptions: {
		show: {
			resource: ['staking'],
			operation: ['getValidators'],
		},
	},
	options: [
		{
			name: 'All',
			value: '',
		},
		{
			name: 'Bonded',
			value: 'BOND_STATUS_BONDED',
		},
		{
			name: 'Unbonded',
			value: 'BOND_STATUS_UNBONDED',
		},
		{
			name: 'Unbonding',
			value: 'BOND_STATUS_UNBONDING',
		},
	],
	default: '',
	description: 'Filter validators by status',
},
{
	displayName: 'Pagination Limit',
	name: 'paginationLimit',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['staking'],
			operation: ['getValidators'],
		},
	},
	default: 100,
	description: 'Maximum number of validators to return',
},
{
	displayName: 'Pagination Key',
	name: 'paginationKey',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['staking'],
			operation: ['getValidators'],
		},
	},
	default: '',
	description: 'Pagination key for next page',
},
{
	displayName: 'Validator Address',
	name: 'validatorAddr',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['staking'],
			operation: ['getValidator', 'getValidatorDelegations'],
		},
	},
	default: '',
	description: 'The validator address to query',
	placeholder: 'secretvaloper1...',
},
{
	displayName: 'Delegator Address',
	name: 'delegatorAddr',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['staking'],
			operation: ['getDelegations', 'getUnbondingDelegations'],
		},
	},
	default: '',
	description: 'The delegator address to query',
	placeholder: 'secret1...',
},
{
  displayName: 'Pagination Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['getContracts']
    }
  },
  default: 0,
  description: 'Number of items to skip'
},
{
  displayName: 'Pagination Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['getContracts']
    }
  },
  default: 100,
  description: 'Maximum number of items to return'
},
{
  displayName: 'Code ID',
  name: 'codeId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['getContractCode', 'getContractsByCode', 'instantiateContract', 'getCode']
    }
  },
  default: '',
  description: 'The contract code ID'
},
{
  displayName: 'Contract Address',
  name: 'contractAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['getContractInfo', 'queryContract', 'executeContract', 'getContract']
    }
  },
  default: '',
  description: 'The contract address'
},
{
  displayName: 'Query',
  name: 'query',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['queryContract']
    }
  },
  default: '{}',
  description: 'Query to execute against the contract'
},
{
  displayName: 'Viewing Key',
  name: 'viewingKey',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['queryContract']
    }
  },
  default: '',
  description: 'Viewing key for encrypted data access'
},
{
  displayName: 'Message',
  name: 'msg',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['executeContract'],
    },
  },
  default: '{}',
  description: 'The message to send to the contract',
},
{
  displayName: 'Sender',
  name: 'sender',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['executeContract', 'storeCode'],
    },
  },
  default: '',
  description: 'The sender address',
},
{
  displayName: 'Funds',
  name: 'funds',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['executeContract', 'instantiateContract'],
    },
  },
  default: '[]',
  description: 'Funds to send with the transaction',
},
{
  displayName: 'Init Message',
  name: 'initMsg',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['instantiateContract'],
    },
  },
  default: '{}',
  description: 'The initialization message',
},
{
  displayName: 'Label',
  name: 'label',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['instantiateContract'],
    },
  },
  default: '',
  description: 'The contract label',
},
{
  displayName: 'Pagination Limit',
  name: 'paginationLimit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['listCodes'],
    },
  },
  default: 100,
  description: 'Number of items to return',
},
{
  displayName: 'Pagination Key',
  name: 'paginationKey',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['listCodes'],
    },
  },
  default: '',
  description: 'Pagination key for next page',
},
{
  displayName: 'WASM Byte Code',
  name: 'wasmByteCode',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['storeCode'],
    },
  },
  default: '',
  description: 'The WASM byte code to store',
},
{
  displayName: 'Proposal Status',
  name: 'proposalStatus',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['getProposals'],
    },
  },
  options: [
    { name: 'Unspecified', value: 'PROPOSAL_STATUS_UNSPECIFIED' },
    { name: 'Deposit Period', value: 'PROPOSAL_STATUS_DEPOSIT_PERIOD' },
    { name: 'Voting Period', value: 'PROPOSAL_STATUS_VOTING_PERIOD' },
    { name: 'Passed', value: 'PROPOSAL_STATUS_PASSED' },
    { name: 'Rejected', value: 'PROPOSAL_STATUS_REJECTED' },
    { name: 'Failed', value: 'PROPOSAL_STATUS_FAILED' },
  ],
  default: 'PROPOSAL_STATUS_UNSPECIFIED',
  description: 'Filter proposals by status',
},
{
  displayName: 'Voter Address',
  name: 'voter',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['getProposals'],
    },
  },
  default: '',
  description: 'Filter proposals by voter address',
},
{
  displayName: 'Depositor Address',
  name: 'depositor',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['getProposals'],
    },
  },
  default: '',
  description: 'Filter proposals by depositor address',
},
{
  displayName: 'Proposal ID',
  name: 'proposalId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['getProposal', 'getProposalVotes', 'getProposalDeposits', 'getVote'],
    },
  },
  default: '',
  description: 'The ID of the proposal',
},
{
  displayName: 'Voter Address',
  name: 'voterAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['getVote'],
    },
  },
  default: '',
  description: 'The address of the voter',
},
{
  displayName: 'Client ID',
  name: 'clientId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['iBC'],
      operation: ['getClientState'],
    },
  },
  default: '',
  description: 'The client ID to retrieve state for',
},
{
  displayName: 'Connection ID',
  name: 'connectionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['iBC'],
      operation: ['getConnection'],
    },
  },
  default: '',
  description: 'The connection ID to retrieve',
},
{
  displayName: 'Pagination',
  name: 'pagination',
  type: 'collection',
  placeholder: 'Add Pagination',
  displayOptions: {
    show: {
      resource: ['iBC'],
      operation: ['getClientStates', 'getConnections', 'getChannels'],
    },
  },
  default: {},
  options: [
    {
      displayName: 'Limit',
      name: 'limit',
      type: 'number',
      default: 100,
      description: 'Maximum number of items to return',
    },
    {
      displayName: 'Offset',
      name: 'offset',
      type: 'number',
      default: 0,
      description: 'Number of items to skip',
    },
    {
      displayName: 'Count Total',
      name: 'countTotal',
      type: 'boolean',
      default: false,
      description: 'Whether to count total number of items',
    },
  ],
},
{
  displayName: 'Contract Address',
  name: 'contractAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip20Tokens'],
      operation: ['transfer', 'getBalance', 'increaseAllowance', 'decreaseAllowance', 'getAllowance', 'getTokenInfo', 'createViewingKey', 'setViewingKey'],
    },
  },
  default: '',
  description: 'The SNIP-20 token contract address',
},
{
  displayName: 'Recipient Address',
  name: 'recipient',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip20Tokens'],
      operation: ['transfer'],
    },
  },
  default: '',
  description: 'The recipient address for the token transfer',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip20Tokens'],
      operation: ['transfer', 'increaseAllowance', 'decreaseAllowance'],
    },
  },
  default: '',
  description: 'The amount of tokens (in smallest unit)',
},
{
  displayName: 'Memo',
  name: 'memo',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['snip20Tokens'],
      operation: ['transfer'],
    },
  },
  default: '',
  description: 'Optional memo for the transfer',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip20Tokens'],
      operation: ['getBalance'],
    },
  },
  default: '',
  description: 'The address to query balance for',
},
{
  displayName: 'Viewing Key',
  name: 'viewingKey',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip20Tokens'],
      operation: ['getBalance', 'getAllowance'],
    },
  },
  default: '',
  description: 'The viewing key to access private data',
},
{
  displayName: 'Spender Address',
  name: 'spender',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip20Tokens'],
      operation: ['increaseAllowance', 'decreaseAllowance', 'getAllowance'],
    },
  },
  default: '',
  description: 'The spender address for the allowance',
},
{
  displayName: 'Owner Address',
  name: 'owner',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip20Tokens'],
      operation: ['getAllowance'],
    },
  },
  default: '',
  description: 'The owner address for the allowance query',
},
{
  displayName: 'Entropy',
  name: 'entropy',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['snip20Tokens'],
      operation: ['createViewingKey'],
    },
  },
  default: '',
  description: 'Optional entropy for viewing key generation',
},
{
  displayName: 'Key',
  name: 'key',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip20Tokens'],
      operation: ['setViewingKey'],
    },
  },
  default: '',
  description: 'The custom viewing key to set',
},
{
  displayName: 'Contract Address',
  name: 'contractAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip721Tokens'],
      operation: ['transferNft', 'mintNft', 'getOwnerOf', 'getNftInfo', 'approve', 'approveAll', 'getApprovals', 'getTokens'],
    },
  },
  default: '',
  description: 'The SNIP-721 contract address',
},
{
  displayName: 'Token ID',
  name: 'tokenId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip721Tokens'],
      operation: ['transferNft', 'mintNft', 'getOwnerOf', 'getNftInfo', 'approve', 'getApprovals'],
    },
  },
  default: '',
  description: 'The token ID',
},
{
  displayName: 'Recipient',
  name: 'recipient',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip721Tokens'],
      operation: ['transferNft'],
    },
  },
  default: '',
  description: 'The recipient address',
},
{
  displayName: 'Owner',
  name: 'owner',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip721Tokens'],
      operation: ['mintNft', 'getTokens'],
    },
  },
  default: '',
  description: 'The owner address',
},
{
  displayName: 'Metadata',
  name: 'metadata',
  type: 'json',
  required: false,
  displayOptions: {
    show: {
      resource: ['snip721Tokens'],
      operation: ['mintNft'],
    },
  },
  default: '{}',
  description: 'The NFT metadata',
},
{
  displayName: 'Spender',
  name: 'spender',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip721Tokens'],
      operation: ['approve'],
    },
  },
  default: '',
  description: 'The spender address',
},
{
  displayName: 'Operator',
  name: 'operator',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip721Tokens'],
      operation: ['approveAll'],
    },
  },
  default: '',
  description: 'The operator address',
},
{
  displayName: 'Approved',
  name: 'approved',
  type: 'boolean',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip721Tokens'],
      operation: ['approveAll'],
    },
  },
  default: true,
  description: 'Whether to approve or revoke approval',
},
{
  displayName: 'Viewing Key',
  name: 'viewingKey',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['snip721Tokens'],
      operation: ['getOwnerOf', 'getNftInfo', 'getApprovals', 'getTokens'],
    },
  },
  default: '',
  description: 'The viewing key for querying encrypted data',
},
{
  displayName: 'Private Key',
  name: 'privateKey',
  type: 'string',
  typeOptions: { password: true },
  required: true,
  displayOptions: {
    show: {
      resource: ['snip721Tokens'],
      operation: ['transferNft', 'mintNft', 'approve', 'approveAll'],
    },
  },
  default: '',
  description: 'The private key for signing transactions',
},
{
  displayName: 'Gas Limit',
  name: 'gasLimit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['snip721Tokens'],
      operation: ['transferNft', 'mintNft', 'approve', 'approveAll'],
    },
  },
  default: 200000,
  description: 'Gas limit for the transaction',
},
{
  displayName: 'Gas Price',
  name: 'gasPrice',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['snip721Tokens'],
      operation: ['transferNft', 'mintNft', 'approve', 'approveAll'],
    },
  },
  default: '0.25uscrt',
  description: 'Gas price for the transaction',
},
{
  displayName: 'Source Port',
  name: 'sourcePort',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['ibcTransfer'],
    },
  },
  default: 'transfer',
  description: 'The source port for the IBC transfer',
},
{
  displayName: 'Source Channel',
  name: 'sourceChannel',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['ibcTransfer'],
    },
  },
  default: '',
  description: 'The source channel for the IBC transfer',
},
{
  displayName: 'Token',
  name: 'token',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['ibcTransfer'],
    },
  },
  default: '{"denom": "uscrt", "amount": "1000000"}',
  description: 'The token to transfer with denomination and amount',
},
{
  displayName: 'Sender',
  name: 'sender',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['ibcTransfer'],
    },
  },
  default: '',
  description: 'The sender address',
},
{
  displayName: 'Receiver',
  name: 'receiver',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['ibcTransfer'],
    },
  },
  default: '',
  description: 'The receiver address on the destination chain',
},
{
  displayName: 'Timeout Height',
  name: 'timeoutHeight',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['ibcTransfer'],
    },
  },
  default: 0,
  description: 'The timeout height for the transfer',
},
{
  displayName: 'Private Key',
  name: 'privateKey',
  type: 'string',
  typeOptions: { password: true },
  required: true,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['ibcTransfer', 'updateClient'],
    },
  },
  default: '',
  description: 'The secp256k1 private key for signing the transaction',
},
{
  displayName: 'Gas Limit',
  name: 'gasLimit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['ibcTransfer', 'updateClient'],
    },
  },
  default: 200000,
  description: 'The gas limit for the transaction',
},
{
  displayName: 'Gas Price',
  name: 'gasPrice',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['ibcTransfer', 'updateClient'],
    },
  },
  default: '0.1uscrt',
  description: 'The gas price for the transaction',
},
{
  displayName: 'Pagination Offset',
  name: 'paginationOffset',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['getChannels', 'getConnections', 'getClientStates', 'getDenomTraces'],
    },
  },
  default: 0,
  description: 'Pagination offset',
},
{
  displayName: 'Pagination Limit',
  name: 'paginationLimit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['getChannels', 'getConnections', 'getClientStates', 'getDenomTraces'],
    },
  },
  default: 100,
  description: 'Pagination limit',
},
{
  displayName: 'Channel ID',
  name: 'channelId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['getChannel'],
    },
  },
  default: '',
  description: 'The IBC channel ID',
},
{
  displayName: 'Port ID',
  name: 'portId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['getChannel'],
    },
  },
  default: 'transfer',
  description: 'The IBC port ID',
},
{
  displayName: 'Connection ID',
  name: 'connectionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['getConnection'],
    },
  },
  default: '',
  description: 'The IBC connection ID',
},
{
  displayName: 'Client ID',
  name: 'clientId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['updateClient'],
    },
  },
  default: '',
  description: 'The IBC client ID to update',
},
{
  displayName: 'Header',
  name: 'header',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['ibcOperations'],
      operation: ['updateClient'],
    },
  },
  default: '{}',
  description: 'The client header for updating',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'blocks':
        return [await executeBlocksOperations.call(this, items)];
      case 'transactions':
        return [await executeTransactionsOperations.call(this, items)];
      case 'accounts':
        return [await executeAccountsOperations.call(this, items)];
      case 'staking':
        return [await executeStakingOperations.call(this, items)];
      case 'smartContracts':
        return [await executeSmartContractsOperations.call(this, items)];
      case 'governance':
        return [await executeGovernanceOperations.call(this, items)];
      case 'iBC':
        return [await executeIBCOperations.call(this, items)];
      case 'snip20Tokens':
        return [await executeSnip20TokensOperations.call(this, items)];
      case 'snip721Tokens':
        return [await executeSnip721TokensOperations.call(this, items)];
      case 'ibcOperations':
        return [await executeIbcOperationsOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeBlocksOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('secretnetworkApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      const baseOptions: any = {
        headers: {
          'Content-Type': 'application/json',
        },
        json: true,
      };

      if (credentials.username && credentials.password) {
        baseOptions.auth = {
          user: credentials.username,
          pass: credentials.password,
        };
      }

      switch (operation) {
        case 'getLatestBlock': {
          const options: any = {
            ...baseOptions,
            method: 'GET',
            url: `${credentials.baseUrl || 'https://lcd.secret.express'}/cosmos/base/tendermint/v1beta1/blocks/latest`,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlock': {
          const height = this.getNodeParameter('height', i) as number;
          const options: any = {
            ...baseOptions,
            method: 'GET',
            url: `${credentials.baseUrl || 'https://lcd.secret.express'}/cosmos/base/tendermint/v1beta1/blocks/${height}`,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getNodeInfo': {
          const options: any = {
            ...baseOptions,
            method: 'GET',
            url: `${credentials.baseUrl || 'https://lcd.secret.express'}/cosmos/base/tendermint/v1beta1/node_info`,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getLatestValidatorSet': {
          const options: any = {
            ...baseOptions,
            method: 'GET',
            url: `${credentials.baseUrl || 'https://lcd.secret.express'}/cosmos/base/tendermint/v1beta1/validatorsets/latest`,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getValidatorSet': {
          const height = this.getNodeParameter('height', i) as number;
          const options: any = {
            ...baseOptions,
            method: 'GET',
            url: `${credentials.baseUrl || 'https://lcd.secret.express'}/cosmos/base/tendermint/v1beta1/validatorsets/${height}`,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeTransactionsOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('secretnetworkApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'getTransaction': {
					const hash = this.getNodeParameter('hash', i) as string;
					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs/${hash}`,
						headers: {
							'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`,
							'Content-Type': 'application/json'
						},
						json: true
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getTransactions': {
					const events = this.getNodeParameter('events', i) as string;
					const pageKey = this.getNodeParameter('pageKey', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;

					let queryParams = new URLSearchParams();
					if (events) queryParams.append('events', events);
					if (pageKey) queryParams.append('pagination.key', pageKey);
					if (limit) queryParams.append('pagination.limit', limit.toString());

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs?${queryParams.toString()}`,
						headers: {
							'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`,
							'Content-Type': 'application/json'
						},
						json: true
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'broadcastTransaction': {
					const txBytes = this.getNodeParameter('txBytes', i) as string;
					const mode = this.getNodeParameter('mode', i) as string;

					const body = {
						tx_bytes: txBytes,
						mode: mode
					};

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs`,
						headers: {
							'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`,
							'Content-Type': 'application/json'
						},
						body: body,
						json: true
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'simulateTransaction': {
					const txBytes = this.getNodeParameter('txBytes', i) as string;

					const body = {
						tx_bytes: txBytes
					};

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/cosmos/tx/v1beta1/simulate`,
						headers: {
							'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`,
							'Content-Type': 'application/json'
						},
						body: body,
						json: true
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getTransactionsByHeight': {
					const height = this.getNodeParameter('height', i) as number;

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs/block/${height}`,
						headers: {
							'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`,
							'Content-Type': 'application/json'
						},
						json: true
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({ 
				json: result, 
				pairedItem: { item: i } 
			});

		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i }
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}

async function executeAccountsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('secretnetworkApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getAccount': {
          const address = this.getNodeParameter('address', i) as string;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/cosmos/auth/v1beta1/accounts/${address}`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBalances': {
          const address = this.getNodeParameter('address', i) as string;
          const denom = this.getNodeParameter('denom', i) as string;
          let url = `${credentials.baseUrl}/cosmos/bank/v1beta1/balances/${address}`;
          
          if (denom) {
            url += `?pagination.limit=1000&denom=${denom}`;
          }

          const options