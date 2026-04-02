# n8n-nodes-secret-network

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with Secret Network, enabling automation workflows to interact with the privacy-focused blockchain platform. The node implements 7 core resources including blocks, transactions, accounts, staking, smart contracts, governance, and IBC operations, allowing users to build sophisticated privacy-preserving blockchain automation workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Secret Network](https://img.shields.io/badge/Secret%20Network-Compatible-purple)
![Privacy](https://img.shields.io/badge/Privacy-Focused-green)
![Smart Contracts](https://img.shields.io/badge/Smart%20Contracts-Supported-orange)

## Features

- **Block Operations** - Query blockchain blocks, retrieve block information, and monitor block production
- **Transaction Management** - Send transactions, query transaction history, and track transaction status
- **Account Operations** - Manage accounts, check balances, and retrieve account information
- **Staking Functions** - Delegate tokens, claim rewards, and manage validator operations
- **Smart Contract Integration** - Deploy contracts, execute functions, and query contract state
- **Governance Participation** - Submit proposals, vote on governance, and track proposal status
- **IBC Protocol Support** - Cross-chain transfers, channel management, and inter-blockchain communication
- **Privacy-Preserving Queries** - Leverage Secret Network's privacy features in automation workflows

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
| API Key | Secret Network API key for authenticated requests | Yes |
| Network | Network environment (mainnet, testnet, or custom) | Yes |
| RPC Endpoint | Custom RPC endpoint URL (if using custom network) | No |

## Resources & Operations

### 1. Blocks

| Operation | Description |
|-----------|-------------|
| Get Block | Retrieve block information by height or hash |
| Get Latest Block | Fetch the most recent block |
| List Blocks | Query multiple blocks with pagination |
| Get Block Transactions | Retrieve all transactions in a specific block |

### 2. Transactions

| Operation | Description |
|-----------|-------------|
| Send Transaction | Broadcast a new transaction to the network |
| Get Transaction | Retrieve transaction details by hash |
| List Transactions | Query transactions with filters and pagination |
| Get Transaction Receipt | Fetch transaction execution receipt |
| Estimate Gas | Calculate gas requirements for a transaction |

### 3. Accounts

| Operation | Description |
|-----------|-------------|
| Get Account | Retrieve account information and balance |
| Get Balance | Check account balance for specific tokens |
| List Account Transactions | Get transaction history for an account |
| Create Account | Generate a new Secret Network account |

### 4. Staking

| Operation | Description |
|-----------|-------------|
| Delegate | Delegate tokens to a validator |
| Undelegate | Undelegate tokens from a validator |
| Redelegate | Move delegation between validators |
| Claim Rewards | Claim staking rewards |
| Get Delegations | Retrieve account delegation information |
| List Validators | Query available validators |

### 5. SmartContracts

| Operation | Description |
|-----------|-------------|
| Deploy Contract | Deploy a new smart contract |
| Execute Contract | Execute a smart contract function |
| Query Contract | Query contract state or information |
| Get Contract Info | Retrieve contract metadata |
| List Contracts | Query deployed contracts |

### 6. Governance

| Operation | Description |
|-----------|-------------|
| Submit Proposal | Submit a new governance proposal |
| Vote | Vote on an active proposal |
| Get Proposal | Retrieve proposal details |
| List Proposals | Query governance proposals |
| Get Vote | Check vote status for a proposal |

### 7. IBC

| Operation | Description |
|-----------|-------------|
| Transfer | Execute cross-chain token transfer |
| Get Channel | Retrieve IBC channel information |
| List Channels | Query available IBC channels |
| Get Connection | Fetch IBC connection details |
| Track Packet | Monitor IBC packet status |

## Usage Examples

```javascript
// Get latest block information
{
  "resource": "blocks",
  "operation": "getLatestBlock",
  "credentials": "secretNetworkApi"
}
```

```javascript
// Check account balance
{
  "resource": "accounts",
  "operation": "getBalance",
  "credentials": "secretNetworkApi",
  "address": "secret1abc123...",
  "denom": "uscrt"
}
```

```javascript
// Execute smart contract function
{
  "resource": "smartContracts",
  "operation": "executeContract",
  "credentials": "secretNetworkApi",
  "contractAddress": "secret1contract123...",
  "executeMsg": {
    "transfer": {
      "recipient": "secret1recipient...",
      "amount": "1000000"
    }
  }
}
```

```javascript
// Delegate tokens to validator
{
  "resource": "staking",
  "operation": "delegate",
  "credentials": "secretNetworkApi",
  "validatorAddress": "secretvaloper1validator...",
  "amount": "1000000",
  "denom": "uscrt"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key is correct and has proper permissions |
| Insufficient Gas | Transaction failed due to insufficient gas | Increase gas limit or estimate gas before transaction |
| Contract Not Found | Smart contract address does not exist | Verify contract address and deployment status |
| Invalid Address | Provided address format is incorrect | Use valid Secret Network address format (secret1...) |
| Network Timeout | Request timed out waiting for response | Check network connectivity and try again |
| Insufficient Funds | Account balance too low for transaction | Ensure account has sufficient token balance |

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
- **Secret Network Documentation**: [Secret Network Docs](https://docs.scrt.network/)
- **Secret Network Community**: [Secret Network Discord](https://discord.com/invite/secret-network)