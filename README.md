# n8n-nodes-secret-network

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for interacting with the Secret Network blockchain. This node provides 6 resources with full support for smart contracts, privacy-preserving tokens, IBC operations, and transaction management on the Secret Network ecosystem.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Secret Network](https://img.shields.io/badge/Secret%20Network-Compatible-purple)
![Cosmos SDK](https://img.shields.io/badge/Cosmos%20SDK-0.47-green)
![Privacy First](https://img.shields.io/badge/Privacy-First-black)

## Features

- **Smart Contract Operations** - Deploy, execute, and query privacy-preserving smart contracts on Secret Network
- **SNIP-20 Token Management** - Full support for Secret Network's privacy token standard with viewing keys and permits
- **SNIP-721 NFT Operations** - Create, mint, transfer, and manage privacy-preserving NFTs with metadata protection
- **IBC Cross-Chain Operations** - Execute Inter-Blockchain Communication transfers and queries across Cosmos chains
- **Transaction Management** - Send, query, and monitor SCRT transactions with detailed gas estimation
- **Account Operations** - Retrieve account balances, transaction history, and delegation information
- **Privacy-First Design** - Built-in support for viewing keys, query permits, and encrypted data handling
- **Mainnet & Testnet Support** - Compatible with Secret Network mainnet, testnet, and local development networks

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-secret-network`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-secret-network
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-secret-network.git
cd n8n-nodes-secret-network
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-secret-network
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| **API Key** | Secret Network API key for authenticated requests | Yes |
| **RPC Endpoint** | Custom RPC endpoint URL (defaults to mainnet) | No |
| **Chain ID** | Network chain ID (secret-4 for mainnet, pulsar-3 for testnet) | No |
| **Mnemonic** | Wallet mnemonic for transaction signing | No |

## Resources & Operations

### 1. Smart Contracts

| Operation | Description |
|-----------|-------------|
| **Deploy** | Deploy a new smart contract to Secret Network |
| **Execute** | Execute a function on an existing smart contract |
| **Query** | Query smart contract state or data |
| **Get Contract Info** | Retrieve contract metadata and code information |
| **Get Contract History** | Fetch contract execution history |
| **Instantiate** | Instantiate a smart contract from uploaded code |

### 2. SNIP-20 Tokens

| Operation | Description |
|-----------|-------------|
| **Transfer** | Transfer SNIP-20 tokens between addresses |
| **Get Balance** | Query token balance with viewing key |
| **Create Viewing Key** | Generate viewing key for private balance queries |
| **Set Viewing Key** | Set a custom viewing key for token operations |
| **Get Allowance** | Check spending allowance between addresses |
| **Increase Allowance** | Increase spending allowance for an address |
| **Get Token Info** | Retrieve token metadata and configuration |

### 3. SNIP-721 Tokens

| Operation | Description |
|-----------|-------------|
| **Mint** | Mint new SNIP-721 NFTs with privacy features |
| **Transfer** | Transfer NFTs between addresses |
| **Get Owner** | Query NFT owner with proper viewing permissions |
| **Get NFT Info** | Retrieve NFT metadata and properties |
| **Approve** | Approve address to transfer specific NFT |
| **Set Approval All** | Set approval for all NFTs in collection |
| **Get Collection Info** | Fetch NFT collection details and statistics |

### 4. IBC Operations

| Operation | Description |
|-----------|-------------|
| **Transfer** | Execute IBC token transfers to other Cosmos chains |
| **Get Channels** | List available IBC channels and connections |
| **Query Transfer** | Track status of IBC transfer transactions |
| **Get Connection Info** | Retrieve IBC connection details |
| **List Denoms** | Get IBC denomination trace information |
| **Get Client State** | Query IBC client state and parameters |

### 5. Transactions

| Operation | Description |
|-----------|-------------|
| **Send** | Send SCRT tokens to another address |
| **Get Transaction** | Retrieve transaction details by hash |
| **Get Transactions** | Query multiple transactions with filters |
| **Simulate** | Simulate transaction execution and estimate gas |
| **Broadcast** | Broadcast signed transaction to network |
| **Get Gas Price** | Retrieve current network gas prices |

### 6. Accounts

| Operation | Description |
|-----------|-------------|
| **Get Balance** | Retrieve SCRT balance for an address |
| **Get Account Info** | Fetch account details and sequence number |
| **Get Delegations** | Query staking delegations for an address |
| **Get Rewards** | Get pending staking rewards |
| **Get Transaction History** | Retrieve complete transaction history |
| **Get Unbonding** | Query unbonding delegations status |

## Usage Examples

```javascript
// Deploy a new SNIP-20 token contract
{
  "resource": "smartContracts",
  "operation": "deploy",
  "codeId": 1,
  "initMsg": {
    "name": "My Secret Token",
    "symbol": "MST",
    "decimals": 6,
    "initial_balances": [
      {
        "address": "secret1abc123...",
        "amount": "1000000000"
      }
    ]
  },
  "label": "MySecretToken",
  "funds": []
}
```

```javascript
// Transfer SNIP-20 tokens with privacy
{
  "resource": "snip20Tokens",
  "operation": "transfer",
  "contractAddress": "secret1contract...",
  "recipient": "secret1recipient...",
  "amount": "100000",
  "memo": "Payment for services",
  "padding": "encrypted_padding_data"
}
```

```javascript
// Execute IBC transfer to Osmosis
{
  "resource": "ibcOperations",
  "operation": "transfer",
  "sourceChannel": "channel-1",
  "token": {
    "denom": "uscrt",
    "amount": "1000000"
  },
  "sender": "secret1sender...",
  "receiver": "osmo1receiver...",
  "timeoutHeight": {
    "revisionNumber": 1,
    "revisionHeight": 12345678
  }
}
```

```javascript
// Query account balance and delegations
{
  "resource": "accounts",
  "operation": "getBalance",
  "address": "secret1address...",
  "denom": "uscrt"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| **Invalid API Key** | Authentication failed with provided credentials | Verify API key is correct and has sufficient permissions |
| **Insufficient Gas** | Transaction failed due to low gas limit | Increase gas limit or use simulate operation first |
| **Contract Not Found** | Smart contract address does not exist | Verify contract address and network selection |
| **Invalid Viewing Key** | SNIP-20/721 query failed with viewing key error | Create new viewing key or verify existing key is correct |
| **IBC Channel Closed** | IBC transfer failed due to closed channel | Check channel status and use alternative channel |
| **Sequence Mismatch** | Transaction rejected due to account sequence error | Query latest account info and retry transaction |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-secret-network/issues)
- **Secret Network Documentation**: [docs.scrt.network](https://docs.scrt.network)
- **Secret Network Community**: [forum.scrt.network](https://forum.scrt.network)