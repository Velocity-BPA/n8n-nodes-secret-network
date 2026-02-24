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
            name: 'SmartContracts',
            value: 'smartContracts',
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
          },
          {
            name: 'Transactions',
            value: 'transactions',
          },
          {
            name: 'Accounts',
            value: 'accounts',
          }
        ],
        default: 'smartContracts',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
    },
  },
  options: [
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
      name: 'Query Contract',
      value: 'queryContract',
      description: 'Query smart contract state',
      action: 'Query contract',
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
    },
    {
      name: 'Get Contracts By Code',
      value: 'getContractsByCode',
      description: 'Get contracts by code ID',
      action: 'Get contracts by code',
    },
  ],
  default: 'executeContract',
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
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
    },
  },
  options: [
    {
      name: 'Broadcast Transaction',
      value: 'broadcastTransaction',
      description: 'Broadcast a signed transaction to the network',
      action: 'Broadcast a transaction',
    },
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get transaction details by hash',
      action: 'Get a transaction by hash',
    },
    {
      name: 'Get Transactions',
      value: 'getTransactions',
      description: 'Query transactions by criteria',
      action: 'Get transactions by criteria',
    },
    {
      name: 'Simulate Transaction',
      value: 'simulateTransaction',
      description: 'Simulate transaction execution without broadcasting',
      action: 'Simulate a transaction',
    },
    {
      name: 'Get Block',
      value: 'getBlock',
      description: 'Get block details by height',
      action: 'Get a block by height',
    },
    {
      name: 'Get Latest Block',
      value: 'getLatestBlock',
      description: 'Get the latest block',
      action: 'Get the latest block',
    },
  ],
  default: 'broadcastTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
    },
  },
  options: [
    {
      name: 'Get Account Information',
      value: 'getAccount',
      description: 'Get account information from the blockchain',
      action: 'Get account information',
    },
    {
      name: 'Get Account Balance',
      value: 'getBalance',
      description: 'Get account balance for all denominations',
      action: 'Get account balance',
    },
    {
      name: 'Get Balance by Denomination',
      value: 'getBalanceByDenom',
      description: 'Get specific denomination balance for an account',
      action: 'Get balance by denomination',
    },
    {
      name: 'Get Delegation Rewards',
      value: 'getDelegationRewards',
      description: 'Get delegation rewards for a delegator address',
      action: 'Get delegation rewards',
    },
    {
      name: 'Get Delegations',
      value: 'getDelegations',
      description: 'Get all delegations for a delegator address',
      action: 'Get delegations',
    },
    {
      name: 'Get Unbonding Delegations',
      value: 'getUnbondingDelegations',
      description: 'Get unbonding delegations for a delegator address',
      action: 'Get unbonding delegations',
    },
  ],
  default: 'getAccount',
},
      // Parameter definitions
{
  displayName: 'Contract Address',
  name: 'contractAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['executeContract'],
    },
  },
  default: '',
  description: 'The contract address to execute',
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
      operation: ['executeContract'],
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
      operation: ['executeContract'],
    },
  },
  default: '[]',
  description: 'Funds to send with the transaction',
},
{
  displayName: 'Contract Address',
  name: 'contractAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['getContract'],
    },
  },
  default: '',
  description: 'The contract address to query',
},
{
  displayName: 'Contract Address',
  name: 'contractAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['queryContract'],
    },
  },
  default: '',
  description: 'The contract address to query',
},
{
  displayName: 'Query',
  name: 'query',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['queryContract'],
    },
  },
  default: '{}',
  description: 'The query message',
},
{
  displayName: 'Code ID',
  name: 'codeId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['instantiateContract'],
    },
  },
  default: '',
  description: 'The code ID to instantiate',
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
  displayName: 'Funds',
  name: 'funds',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['instantiateContract'],
    },
  },
  default: '[]',
  description: 'Funds to send with the transaction',
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
  displayName: 'Sender',
  name: 'sender',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['storeCode'],
    },
  },
  default: '',
  description: 'The sender address',
},
{
  displayName: 'Code ID',
  name: 'codeId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['getCode'],
    },
  },
  default: '',
  description: 'The code ID to query',
},
{
  displayName: 'Code ID',
  name: 'codeId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContracts'],
      operation: ['getContractsByCode'],
    },
  },
  default: '',
  description: 'The code ID to query contracts for',
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
{
  displayName: 'Transaction Bytes',
  name: 'txBytes',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['broadcastTransaction'],
    },
  },
  default: '',
  description: 'Base64-encoded transaction bytes',
},
{
  displayName: 'Broadcast Mode',
  name: 'mode',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['broadcastTransaction'],
    },
  },
  options: [
    {
      name: 'Sync',
      value: 'BROADCAST_MODE_SYNC',
    },
    {
      name: 'Async',
      value: 'BROADCAST_MODE_ASYNC',
    },
    {
      name: 'Block',
      value: 'BROADCAST_MODE_BLOCK',
    },
  ],
  default: 'BROADCAST_MODE_SYNC',
  description: 'Transaction broadcast mode',
},
{
  displayName: 'Transaction Hash',
  name: 'hash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransaction'],
    },
  },
  default: '',
  description: 'Transaction hash to query',
},
{
  displayName: 'Events',
  name: 'events',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactions'],
    },
  },
  default: '',
  description: 'Events to filter transactions by (e.g., message.action=\'/cosmos.bank.v1beta1.MsgSend\')',
},
{
  displayName: 'Order By',
  name: 'orderBy',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactions'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'ORDER_BY_ASC',
    },
    {
      name: 'Descending',
      value: 'ORDER_BY_DESC',
    },
  ],
  default: 'ORDER_BY_DESC',
  description: 'Order of results',
},
{
  displayName: 'Page Size',
  name: 'pageSize',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactions'],
    },
  },
  default: 10,
  description: 'Number of results per page',
},
{
  displayName: 'Page Key',
  name: 'pageKey',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactions'],
    },
  },
  default: '',
  description: 'Pagination key for next page',
},
{
  displayName: 'Transaction Data',
  name: 'txData',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['simulateTransaction'],
    },
  },
  default: '{}',
  description: 'Transaction data to simulate',
},
{
  displayName: 'Transaction Bytes',
  name: 'txBytes',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['simulateTransaction'],
    },
  },
  default: '',
  description: 'Base64-encoded transaction bytes (alternative to txData)',
},
{
  displayName: 'Block Height',
  name: 'height',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getBlock'],
    },
  },
  default: '',
  description: 'Block height to query',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccount'],
    },
  },
  default: '',
  description: 'The Secret Network account address',
  placeholder: 'secret1...',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getBalance'],
    },
  },
  default: '',
  description: 'The Secret Network account address to get balance for',
  placeholder: 'secret1...',
},
{
  displayName: 'Denomination Filter',
  name: 'denom',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getBalance'],
    },
  },
  default: '',
  description: 'Optional denomination filter (e.g., uscrt)',
  placeholder: 'uscrt',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getBalanceByDenom'],
    },
  },
  default: '',
  description: 'The Secret Network account address to get balance for',
  placeholder: 'secret1...',
},
{
  displayName: 'Denomination',
  name: 'denom',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getBalanceByDenom'],
    },
  },
  default: 'uscrt',
  description: 'The specific denomination to get balance for',
  placeholder: 'uscrt',
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
      operation: ['getDelegations'],
    },
  },
  default: '',
  description: 'The delegator address to get delegations for',
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
      operation: ['getUnbondingDelegations'],
    },
  },
  default: '',
  description: 'The delegator address to get unbonding delegations for',
  placeholder: 'secret1...',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'smartContracts':
        return [await executeSmartContractsOperations.call(this, items)];
      case 'snip20Tokens':
        return [await executeSnip20TokensOperations.call(this, items)];
      case 'snip721Tokens':
        return [await executeSnip721TokensOperations.call(this, items)];
      case 'ibcOperations':
        return [await executeIbcOperationsOperations.call(this, items)];
      case 'transactions':
        return [await executeTransactionsOperations.call(this, items)];
      case 'accounts':
        return [await executeAccountsOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeSmartContractsOperations(
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
        case 'executeContract': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const msg = this.getNodeParameter('msg', i) as any;
          const sender = this.getNodeParameter('sender', i) as string;
          const funds = this.getNodeParameter('funds', i) as any;

          const payload = {
            tx: {
              body: {
                messages: [{
                  '@type': '/secret.compute.v1beta1.MsgExecuteContract',
                  sender,
                  contract: contractAddress,
                  msg: typeof msg === 'string' ? msg : JSON.stringify(msg),
                  sent_funds: Array.isArray(funds) ? funds : [],
                }],
                memo: '',
                timeout_height: '0',
                extension_options: [],
                non_critical_extension_options: [],
              },
              auth_info: {
                signer_infos: [],
                fee: {
                  amount: [{ denom: 'uscrt', amount: '25000' }],
                  gas_limit: '200000',
                  payer: '',
                  granter: '',
                },
              },
              signatures: [],
            },
            mode: 'BROADCAST_MODE_BLOCK',
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: payload,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getContract': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/compute/v1beta1/contracts/${contractAddress}`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'queryContract': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const query = this.getNodeParameter('query', i) as any;

          const payload = {
            query: typeof query === 'string' ? query : JSON.stringify(query),
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/compute/v1beta1/contracts/${contractAddress}/query`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: payload,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'instantiateContract': {
          const codeId = this.getNodeParameter('codeId', i) as string;
          const initMsg = this.getNodeParameter('initMsg', i) as any;
          const label = this.getNodeParameter('label', i) as string;
          const funds = this.getNodeParameter('funds', i) as any;

          const payload = {
            tx: {
              body: {
                messages: [{
                  '@type': '/secret.compute.v1beta1.MsgInstantiateContract',
                  sender: credentials.address || '',
                  code_id: codeId,
                  label,
                  init_msg: typeof initMsg === 'string' ? initMsg : JSON.stringify(initMsg),
                  init_funds: Array.isArray(funds) ? funds : [],
                }],
                memo: '',
                timeout_height: '0',
                extension_options: [],
                non_critical_extension_options: [],
              },
              auth_info: {
                signer_infos: [],
                fee: {
                  amount: [{ denom: 'uscrt', amount: '25000' }],
                  gas_limit: '200000',
                  payer: '',
                  granter: '',
                },
              },
              signatures: [],
            },
            mode: 'BROADCAST_MODE_BLOCK',
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: payload,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'listCodes': {
          const paginationLimit = this.getNodeParameter('paginationLimit', i, 100) as number;
          const paginationKey = this.getNodeParameter('paginationKey', i, '') as string;

          let url = `${credentials.baseUrl}/compute/v1beta1/codes?pagination.limit=${paginationLimit}`;
          if (paginationKey) {
            url += `&pagination.key=${encodeURIComponent(paginationKey)}`;
          }

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'storeCode': {
          const wasmByteCode = this.getNodeParameter('wasmByteCode', i) as string;
          const sender = this.getNodeParameter('sender', i) as string;

          const payload = {
            tx: {
              body: {
                messages: [{
                  '@type': '/secret.compute.v1beta1.MsgStoreCode',
                  sender,
                  wasm_byte_code: wasmByteCode,
                  source: '',
                  builder: '',
                }],
                memo: '',
                timeout_height: '0',
                extension_options: [],
                non_critical_extension_options: [],
              },
              auth_info: {
                signer_infos: [],
                fee: {
                  amount: [{ denom: 'uscrt', amount: '50000' }],
                  gas_limit: '500000',
                  payer: '',
                  granter: '',
                },
              },
              signatures: [],
            },
            mode: 'BROADCAST_MODE_BLOCK',
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: payload,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCode': {
          const codeId = this.getNodeParameter('codeId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/compute/v1beta1/codes/${codeId}`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getContractsByCode': {
          const codeId = this.getNodeParameter('codeId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/compute/v1beta1/contracts/by-code/${codeId}`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
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
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

function createTransactionMessage(contractAddress: string, msg: any, sender: string, funds: any[] = []): any {
  return {
    '@type': '/secret.compute.v1beta1.MsgExecuteContract',
    sender,
    contract: contractAddress,
    msg: Buffer.from(JSON.stringify(msg)).toString('base64'),
    sent_funds: funds,
  };
}

function createQueryMessage(contractAddress: string, query: any): any {
  return {
    contract_address: contractAddress,
    query: Buffer.from(JSON.stringify(query)).toString('base64'),
  };
}

function estimateGas(messageType: string): any {
  const gasEstimates: any = {
    transfer: { gas: '200000' },
    increaseAllowance: { gas: '150000' },
    decreaseAllowance: { gas: '150000' },
    createViewingKey: { gas: '100000' },
    setViewingKey: { gas: '100000' },
  };
  return gasEstimates[messageType] || { gas: '200000' };
}

async function executeSnip20TokensOperations(
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
        case 'transfer': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const recipient = this.getNodeParameter('recipient', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const memo = this.getNodeParameter('memo', i) as string;

          const msg = {
            transfer: {
              recipient,
              amount,
              memo: memo || undefined,
            },
          };

          const txMsg = createTransactionMessage(contractAddress, msg, credentials.address);
          const gasEstimate = estimateGas('transfer');

          const txBody = {
            messages: [txMsg],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: [],
          };

          const authInfo = {
            signer_infos: [],
            fee: {
              amount: [{ denom: 'uscrt', amount: '25000' }],
              gas_limit: gasEstimate.gas,
              payer: '',
              granter: '',
            },
          };

          const txRaw = {
            body_bytes: Buffer.from(JSON.stringify(txBody)).toString('base64'),
            auth_info_bytes: Buffer.from(JSON.stringify(authInfo)).toString('base64'),
            signatures: [],
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs`,
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              tx_bytes: Buffer.from(JSON.stringify(txRaw)).toString('base64'),
              mode: 'BROADCAST_MODE_SYNC',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBalance': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const address = this.getNodeParameter('address', i) as string;
          const viewingKey = this.getNodeParameter('viewingKey', i) as string;

          const query = {
            balance: {
              address,
              key: viewingKey,
            },
          };

          const queryMsg = createQueryMessage(contractAddress, query);

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/compute/v1beta1/contracts/${contractAddress}/query`,
            headers: {
              'Content-Type': 'application/json',
            },
            body: queryMsg,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'increaseAllowance': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const spender = this.getNodeParameter('spender', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;

          const msg = {
            increase_allowance: {
              spender,
              amount,
            },
          };

          const txMsg = createTransactionMessage(contractAddress, msg, credentials.address);
          const gasEstimate = estimateGas('increaseAllowance');

          const txBody = {
            messages: [txMsg],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: [],
          };

          const authInfo = {
            signer_infos: [],
            fee: {
              amount: [{ denom: 'uscrt', amount: '25000' }],
              gas_limit: gasEstimate.gas,
              payer: '',
              granter: '',
            },
          };

          const txRaw = {
            body_bytes: Buffer.from(JSON.stringify(txBody)).toString('base64'),
            auth_info_bytes: Buffer.from(JSON.stringify(authInfo)).toString('base64'),
            signatures: [],
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs`,
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              tx_bytes: Buffer.from(JSON.stringify(txRaw)).toString('base64'),
              mode: 'BROADCAST_MODE_SYNC',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'decreaseAllowance': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const spender = this.getNodeParameter('spender', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;

          const msg = {
            decrease_allowance: {
              spender,
              amount,
            },
          };

          const txMsg = createTransactionMessage(contractAddress, msg, credentials.address);
          const gasEstimate = estimateGas('decreaseAllowance');

          const txBody = {
            messages: [txMsg],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: [],
          };

          const authInfo = {
            signer_infos: [],
            fee: {
              amount: [{ denom: 'uscrt', amount: '25000' }],
              gas_limit: gasEstimate.gas,
              payer: '',
              granter: '',
            },
          };

          const txRaw = {
            body_bytes: Buffer.from(JSON.stringify(txBody)).toString('base64'),
            auth_info_bytes: Buffer.from(JSON.stringify(authInfo)).toString('base64'),
            signatures: [],
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs`,
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              tx_bytes: Buffer.from(JSON.stringify(txRaw)).toString('base64'),
              mode: 'BROADCAST_MODE_SYNC',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAllowance': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const owner = this.getNodeParameter('owner', i) as string;
          const spender = this.getNodeParameter('spender', i) as string;
          const viewingKey = this.getNodeParameter('viewingKey', i) as string;

          const query = {
            allowance: {
              owner,
              spender,
              key: viewingKey,
            },
          };

          const queryMsg = createQueryMessage(contractAddress, query);

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/compute/v1beta1/contracts/${contractAddress}/query`,
            headers: {
              'Content-Type': 'application/json',
            },
            body: queryMsg,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTokenInfo': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;

          const query = {
            token_info: {},
          };

          const queryMsg = createQueryMessage(contractAddress, query);

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/compute/v1beta1/contracts/${contractAddress}/query`,
            headers: {
              'Content-Type': 'application/json',
            },
            body: queryMsg,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createViewingKey': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const entropy = this.getNodeParameter('entropy', i) as string;

          const msg = {
            create_viewing_key: {
              entropy: entropy || Math.random().toString(36).substring(2, 15),
            },
          };

          const txMsg = createTransactionMessage(contractAddress, msg, credentials.address);
          const gasEstimate = estimateGas('createViewingKey');

          const txBody = {
            messages: [txMsg],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: [],
          };

          const authInfo = {
            signer_infos: [],
            fee: {
              amount: [{ denom: 'uscrt', amount: '25000' }],
              gas_limit: gasEstimate.gas,
              payer: '',
              granter: '',
            },
          };

          const txRaw = {
            body_bytes: Buffer.from(JSON.stringify(txBody)).toString('base64'),
            auth_info_bytes: Buffer.from(JSON.stringify(authInfo)).toString('base64'),
            signatures: [],
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs`,
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              tx_bytes: Buffer.from(JSON.stringify(txRaw)).toString('base64'),
              mode: 'BROADCAST_MODE_SYNC',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'setViewingKey': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const key = this.getNodeParameter('key', i) as string;

          const msg = {
            set_viewing_key: {
              key,
            },
          };

          const txMsg = createTransactionMessage(contractAddress, msg, credentials.address);
          const gasEstimate = estimateGas('setViewingKey');

          const txBody = {
            messages: [txMsg],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: [],
          };

          const authInfo = {
            signer_infos: [],
            fee: {
              amount: [{ denom: 'uscrt', amount: '25000' }],
              gas_limit: gasEstimate.gas,
              payer: '',
              granter: '',
            },
          };

          const txRaw = {
            body_bytes: Buffer.from(JSON.stringify(txBody)).toString('base64'),
            auth_info_bytes: Buffer.from(JSON.stringify(authInfo)).toString('base64'),
            signatures: [],
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs`,
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              tx_bytes: Buffer.from(JSON.stringify(txRaw)).toString('base64'),
              mode: 'BROADCAST_MODE_SYNC',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeSnip721TokensOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('secretnetworkApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const contractAddress = this.getNodeParameter('contractAddress', i) as string;

      switch (operation) {
        case 'transferNft': {
          const tokenId = this.getNodeParameter('tokenId', i) as string;
          const recipient = this.getNodeParameter('recipient', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;
          const gasLimit = this.getNodeParameter('gasLimit', i, 200000) as number;
          const gasPrice = this.getNodeParameter('gasPrice', i, '0.25uscrt') as string;

          const executeMsg = {
            transfer_nft: {
              recipient,
              token_id: tokenId,
            },
          };

          const txData = await signAndBroadcastTx(
            this,
            credentials,
            contractAddress,
            executeMsg,
            privateKey,
            gasLimit,
            gasPrice,
          );

          result = txData;
          break;
        }

        case 'mintNft': {
          const tokenId = this.getNodeParameter('tokenId', i) as string;
          const owner = this.getNodeParameter('owner', i) as string;
          const metadata = this.getNodeParameter('metadata', i, {}) as any;
          const privateKey = this.getNodeParameter('privateKey', i) as string;
          const gasLimit = this.getNodeParameter('gasLimit', i, 200000) as number;
          const gasPrice = this.getNodeParameter('gasPrice', i, '0.25uscrt') as string;

          const executeMsg = {
            mint_nft: {
              token_id: tokenId,
              owner,
              metadata,
            },
          };

          const txData = await signAndBroadcastTx(
            this,
            credentials,
            contractAddress,
            executeMsg,
            privateKey,
            gasLimit,
            gasPrice,
          );

          result = txData;
          break;
        }

        case 'getOwnerOf': {
          const tokenId = this.getNodeParameter('tokenId', i) as string;
          const viewingKey = this.getNodeParameter('viewingKey', i) as string;

          const queryMsg = {
            owner_of: {
              token_id: tokenId,
              viewing_key: viewingKey,
            },
          };

          result = await queryContract(this, credentials, contractAddress, queryMsg);
          break;
        }

        case 'getNftInfo': {
          const tokenId = this.getNodeParameter('tokenId', i) as string;
          const viewingKey = this.getNodeParameter('viewingKey', i) as string;

          const queryMsg = {
            nft_info: {
              token_id: tokenId,
              viewing_key: viewingKey,
            },
          };

          result = await queryContract(this, credentials, contractAddress, queryMsg);
          break;
        }

        case 'approve': {
          const spender = this.getNodeParameter('spender', i) as string;
          const tokenId = this.getNodeParameter('tokenId', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;
          const gasLimit = this.getNodeParameter('gasLimit', i, 200000) as number;
          const gasPrice = this.getNodeParameter('gasPrice', i, '0.25uscrt') as string;

          const executeMsg = {
            approve: {
              spender,
              token_id: tokenId,
            },
          };

          const txData = await signAndBroadcastTx(
            this,
            credentials,
            contractAddress,
            executeMsg,
            privateKey,
            gasLimit,
            gasPrice,
          );

          result = txData;
          break;
        }

        case 'approveAll': {
          const operator = this.getNodeParameter('operator', i) as string;
          const approved = this.getNodeParameter('approved', i) as boolean;
          const privateKey = this.getNodeParameter('privateKey', i) as string;
          const gasLimit = this.getNodeParameter('gasLimit', i, 200000) as number;
          const gasPrice = this.getNodeParameter('gasPrice', i, '0.25uscrt') as string;

          const executeMsg = {
            approve_all: {
              operator,
              approved,
            },
          };

          const txData = await signAndBroadcastTx(
            this,
            credentials,
            contractAddress,
            executeMsg,
            privateKey,
            gasLimit,
            gasPrice,
          );

          result = txData;
          break;
        }

        case 'getApprovals': {
          const tokenId = this.getNodeParameter('tokenId', i) as string;
          const viewingKey = this.getNodeParameter('viewingKey', i) as string;

          const queryMsg = {
            approved_for_all: {
              token_id: tokenId,
              viewing_key: viewingKey,
            },
          };

          result = await queryContract(this, credentials, contractAddress, queryMsg);
          break;
        }

        case 'getTokens': {
          const owner = this.getNodeParameter('owner', i) as string;
          const viewingKey = this.getNodeParameter('viewingKey', i) as string;

          const queryMsg = {
            tokens: {
              owner,
              viewing_key: viewingKey,
            },
          };

          result = await queryContract(this, credentials, contractAddress, queryMsg);
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

async function queryContract(
  executeFunctions: IExecuteFunctions,
  credentials: any,
  contractAddress: string,
  queryMsg: any,
): Promise<any> {
  const options: any = {
    method: 'POST',
    url: `${credentials.baseUrl}/compute/v1beta1/contracts/${contractAddress}/query`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      query: Buffer.from(JSON.stringify(queryMsg)).toString('base64'),
    },
    json: true,
  };

  const response = await executeFunctions.helpers.httpRequest(options) as any;
  return response;
}

async function signAndBroadcastTx(
  executeFunctions: IExecuteFunctions,
  credentials: any,
  contractAddress: string,
  executeMsg: any,
  privateKey: string,
  gasLimit: number,
  gasPrice: string,
): Promise<any> {
  // Get account info for sequence number
  const privKeyBuffer = Buffer.from(privateKey, 'hex');
  const pubKey = secp256k1.publicKeyCreate(privKeyBuffer);
  const address = getAddressFromPubKey(pubKey);

  const accountOptions: any = {
    method: 'GET',
    url: `${credentials.baseUrl}/cosmos/auth/v1beta1/accounts/${address}`,
    headers: {
      'Content-Type': 'application/json',
    },
    json: true,
  };

  const accountResponse = await executeFunctions.helpers.httpRequest(accountOptions) as any;
  const sequence = accountResponse.account.sequence || '0';
  const accountNumber = accountResponse.account.account_number || '0';

  // Create transaction
  const txBody = {
    messages: [
      {
        '@type': '/secret.compute.v1beta1.MsgExecuteContract',
        sender: address,
        contract: contractAddress,
        msg: Buffer.from(JSON.stringify(executeMsg)).toString('base64'),
        sent_funds: [],
      },
    ],
    memo: '',
    timeout_height: '0',
    extension_options: [],
    non_critical_extension_options: [],
  };

  const authInfo = {
    signer_infos: [
      {
        public_key: {
          '@type': '/cosmos.crypto.secp256k1.PubKey',
          key: Buffer.from(pubKey).toString('base64'),
        },
        mode_info: {
          single: {
            mode: 'SIGN_MODE_DIRECT',
          },
        },
        sequence,
      },
    ],
    fee: {
      amount: [
        {
          denom: 'uscrt',
          amount: Math.ceil(gasLimit * parseFloat(gasPrice.replace('uscrt', ''))).toString(),
        },
      ],
      gas_limit: gasLimit.toString(),
      payer: '',
      granter: '',
    },
  };

  const txRaw = {
    body_bytes: Buffer.from(JSON.stringify(txBody)).toString('base64'),
    auth_info_bytes: Buffer.from(JSON.stringify(authInfo)).toString('base64'),
    signatures: [''],
  };

  // Sign transaction (simplified)
  const signDoc = {
    body_bytes: txRaw.body_bytes,
    auth_info_bytes: txRaw.auth_info_bytes,
    chain_id: credentials.chainId || 'secret-4',
    account_number: accountNumber,
  };

  const signBytes = Buffer.from(JSON.stringify(signDoc));
  const hash = createHash('sha256').update(signBytes).digest();
  const signature = secp256k1.ecdsaSign(hash, privKeyBuffer);
  txRaw.signatures = [Buffer.from(signature.signature).toString('base64')];

  // Broadcast transaction
  const broadcastOptions: any = {
    method: 'POST',
    url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      tx_bytes: Buffer.from(JSON.stringify(txRaw)).toString('base64'),
      mode: 'BROADCAST_MODE_SYNC',
    },
    json: true,
  };

  const response = await executeFunctions.helpers.httpRequest(broadcastOptions) as any;
  return response;
}

function getAddressFromPubKey(pubKey: Uint8Array): string {
  // Simplified address derivation for Secret Network
  const hash = createHash('sha256').update(pubKey).digest();
  const ripemd = createHash('ripemd160').update(hash).digest();
  return 'secret' + Buffer.from(ripemd).toString('hex').substring(0, 40);
}

async function executeIbcOperationsOperations(
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
        case 'ibcTransfer': {
          const sourcePort = this.getNodeParameter('sourcePort', i) as string;
          const sourceChannel = this.getNodeParameter('sourceChannel', i) as string;
          const token = this.getNodeParameter('token', i) as any;
          const sender = this.getNodeParameter('sender', i) as string;
          const receiver = this.getNodeParameter('receiver', i) as string;
          const timeoutHeight = this.getNodeParameter('timeoutHeight', i) as number;
          const privateKey = this.getNodeParameter('privateKey', i) as string;
          const gasLimit = this.getNodeParameter('gasLimit', i) as number;
          const gasPrice = this.getNodeParameter('gasPrice', i) as string;

          const txBody = {
            messages: [
              {
                '@type': '/ibc.applications.transfer.v1.MsgTransfer',
                source_port: sourcePort,
                source_channel: sourceChannel,
                token: token,
                sender: sender,
                receiver: receiver,
                timeout_height: timeoutHeight > 0 ? { revision_number: '0', revision_height: timeoutHeight.toString() } : undefined,
                timeout_timestamp: timeoutHeight === 0 ? (Date.now() + 600000) * 1000000 : '0',
              },
            ],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: [],
          };

          const authInfo = {
            signer_infos: [],
            fee: {
              amount: [{ denom: gasPrice.replace(/[0-9.]/g, ''), amount: (parseFloat(gasPrice) * gasLimit).toString() }],
              gas_limit: gasLimit.toString(),
              payer: '',
              granter: '',
            },
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs`,
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              tx_bytes: Buffer.from(JSON.stringify({ body: txBody, auth_info: authInfo, signatures: [] })).toString('base64'),
              mode: 'BROADCAST_MODE_SYNC',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getChannels': {
          const paginationOffset = this.getNodeParameter('paginationOffset', i) as number;
          const paginationLimit = this.getNodeParameter('paginationLimit', i) as number;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/ibc/core/channel/v1/channels`,
            qs: {
              'pagination.offset': paginationOffset,
              'pagination.limit': paginationLimit,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getChannel': {
          const channelId = this.getNodeParameter('channelId', i) as string;
          const portId = this.getNodeParameter('portId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/ibc/core/channel/v1/channels/${channelId}/ports/${portId}`,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getConnections': {
          const paginationOffset = this.getNodeParameter('paginationOffset', i) as number;
          const paginationLimit = this.getNodeParameter('paginationLimit', i) as number;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/ibc/core/connection/v1/connections`,
            qs: {
              'pagination.offset': paginationOffset,
              'pagination.limit': paginationLimit,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getConnection': {
          const connectionId = this.getNodeParameter('connectionId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/ibc/core/connection/v1/connections/${connectionId}`,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getClientStates': {
          const paginationOffset = this.getNodeParameter('paginationOffset', i) as number;
          const paginationLimit = this.getNodeParameter('paginationLimit', i) as number;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/ibc/core/client/v1/client_states`,
            qs: {
              'pagination.offset': paginationOffset,
              'pagination.limit': paginationLimit,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getDenomTraces': {
          const paginationOffset = this.getNodeParameter('paginationOffset', i) as number;
          const paginationLimit = this.getNodeParameter('paginationLimit', i) as number;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/ibc/applications/transfer/v1/denom_traces`,
            qs: {
              'pagination.offset': paginationOffset,
              'pagination.limit': paginationLimit,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateClient': {
          const clientId = this.getNodeParameter('clientId', i) as string;
          const header = this.getNodeParameter('header', i) as any;
          const privateKey = this.getNodeParameter('privateKey', i) as string;
          const gasLimit = this.getNodeParameter('gasLimit', i) as number;
          const gasPrice = this.getNodeParameter('gasPrice', i) as string;

          const txBody = {
            messages: [
              {
                '@type': '/ibc.core.client.v1.MsgUpdateClient',
                client_id: clientId,
                header: header,
                signer: '',
              },
            ],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: [],
          };

          const authInfo = {
            signer_infos: [],
            fee: {
              amount: [{ denom: gasPrice.replace(/[0-9.]/g, ''), amount: (parseFloat(gasPrice) * gasLimit).toString() }],
              gas_limit: gasLimit.toString(),
              payer: '',
              granter: '',
            },
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs`,
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              tx_bytes: Buffer.from(JSON.stringify({ body: txBody, auth_info: authInfo, signatures: [] })).toString('base64'),
              mode: 'BROADCAST_MODE_SYNC',
            },
            json: true,
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
        case 'broadcastTransaction': {
          const txBytes = this.getNodeParameter('txBytes', i) as string;
          const mode = this.getNodeParameter('mode', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs`,
            headers: {
              'Content-Type': 'application/json',
              ...(credentials.apiKey && { 'Authorization': `Bearer ${credentials.apiKey}` }),
            },
            body: {
              tx_bytes: txBytes,
              mode: mode,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransaction': {
          const hash = this.getNodeParameter('hash', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/cosmos/tx/v1beta1/txs/${hash}`,
            headers: {
              ...(credentials.apiKey && { 'Authorization': `Bearer ${credentials.apiKey}` }),
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransactions': {
          const events = this.getNodeParameter('events', i) as string;
          const orderBy = this.getNodeParameter('orderBy', i) as string;
          const pageSize = this.getNodeParameter('pageSize', i) as number;
          const pageKey = this.getNodeParameter('pageKey', i) as string;

          const queryParams: any = {};
          if (events) queryParams.events = events;
          if (orderBy) queryParams['order_by'] = orderBy;
          if (pageSize) queryParams['pagination.limit'] = pageSize.toString();
          if (pageKey) queryParams['pagination.key'] = pageKey;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/cosmos/tx/v1beta1/txs${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              ...(credentials.apiKey && { 'Authorization': `Bearer ${credentials.apiKey}` }),
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'simulateTransaction': {
          const txData = this.getNodeParameter('txData', i) as string;
          const txBytes = this.getNodeParameter('txBytes', i) as string;

          let body: any = {};
          if (txBytes) {
            body.tx_bytes = txBytes;
          } else if (txData) {
            body.tx = JSON.parse(txData);
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/cosmos/tx/v1beta1/simulate`,
            headers: {
              'Content-Type': 'application/json',
              ...(credentials.apiKey && { 'Authorization': `Bearer ${credentials.apiKey}` }),
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlock': {
          const height = this.getNodeParameter('height', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/cosmos/base/tendermint/v1beta1/blocks/${height}`,
            headers: {
              ...(credentials.apiKey && { 'Authorization': `Bearer ${credentials.apiKey}` }),
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getLatestBlock': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/cosmos/base/tendermint/v1beta1/blocks/latest`,
            headers: {
              ...(credentials.apiKey && { 'Authorization': `Bearer ${credentials.apiKey}` }),
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.response?.body) {
          throw new NodeApiError(this.getNode(), error.response.body, { httpCode: error.response.statusCode });
        }
        throw new NodeOperationError(this.getNode(), error.message);
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
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBalance': {
          const address = this.getNodeParameter('address', i) as string;
          const denom = this.getNodeParameter('denom', i, '') as string;
          
          let url = `${credentials.baseUrl}/cosmos/bank/v1beta1/balances/${address}`;
          if (denom) {
            url += `?pagination.key=&pagination.offset=0&pagination.limit=100&pagination.count_total=true&pagination.reverse=false`;
          }

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          
          // Filter by denomination if specified
          if (denom && result.balances) {
            result.balances = result.balances.filter((balance: any) => balance.denom === denom);
          }
          break;
        }

        case 'getBalanceByDenom': {
          const address = this.getNodeParameter('address', i) as string;
          const denom = this.getNodeParameter('denom', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/cosmos/bank/v1beta1/balances/${address}/${denom}`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getDelegationRewards': {
          const delegatorAddress = this.getNodeParameter('delegatorAddress', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/rewards`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getDelegations': {
          const delegatorAddr = this.getNodeParameter('delegatorAddr', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/cosmos/staking/v1beta1/delegations/${delegatorAddr}`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getUnbondingDelegations': {
          const delegatorAddr = this.getNodeParameter('delegatorAddr', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/cosmos/staking/v1beta1/delegators/${delegatorAddr}/unbonding_delegations`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}
