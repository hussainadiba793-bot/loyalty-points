# 🌟 Loyalty Tokens Smart Contract (Soroban / Stellar)

## 📌 Project Description
<img width="1917" height="1033" alt="Screenshot 2026-04-10 151309" src="https://github.com/user-attachments/assets/e7de6677-8f7e-4354-b458-f6f6bb6f0b74" />

https://stellar.expert/explorer/testnet/contract/CDPLYQP7QTYGYVQLEA7RQYY3GVAI423QG5PZP7DVUZVPVCLPGQORJ2XU

This project implements a **Loyalty Rewards System** using **Soroban**, the smart contract platform on the Stellar network. It enables businesses or applications to reward users with loyalty points that can be accumulated and redeemed over time.

The goal is to provide a simple, efficient, and blockchain-powered alternative to traditional loyalty programs—ensuring transparency, security, and user ownership of rewards.

---

## 🚀 What It Does

This smart contract allows:

* 🏢 **Admins (Businesses)** to distribute loyalty points to users
* 👤 **Users** to securely redeem their points
* 🔍 **Anyone** to check loyalty balances in a transparent way

All transactions are recorded on-chain, ensuring trust and immutability.

---

## ✨ Features

* 🔐 **Admin Authorization**
  Only the designated admin can issue loyalty points

* 👛 **User-Controlled Redemption**
  Users must authorize transactions to redeem their points

* 💾 **Persistent On-Chain Storage**
  User balances are securely stored on the Stellar network

* ⚡ **Lightweight & Gas Efficient**
  Designed with minimal storage and computation costs

* 🔎 **Balance Lookup**
  Easy querying of user loyalty points

* 🧩 **Modular Design**
  Simple structure for easy extension and customization

---

## 🧠 Smart Contract Functions

### `init(admin: Address)`

Initializes the contract with an admin account.

### `add_points(user: Address, amount: u32)`

Adds loyalty points to a user's balance.
🔒 *Admin-only function*

### `redeem_points(user: Address, amount: u32)`

Allows a user to redeem their points.
✅ Requires user authorization

### `get_points(user: Address) -> u32`

Returns the current loyalty points balance of a user.

---

## 🔗 Deployed Smart Contract

**Loyalty Tokens Contract:**
👉 XXX *(Replace this with your deployed contract link or ID)*

---

## 🛠️ Tech Stack

* 🦀 Rust (Soroban SDK)
* ⭐ Stellar Blockchain
* ⚙️ Soroban CLI

---

## 📦 Getting Started

### Prerequisites

* Rust installed (`cargo`, `rustup`)
* Soroban CLI installed
* A Stellar testnet account

### 🔨 Build Contract

```bash
cargo build --target wasm32-unknown-unknown --release
```

### 🚀 Deploy Contract

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/loyalty_contract.wasm \
  --source <your-key> \
  --network testnet
```

---

## 🧪 Example Use Cases

* 🛍️ Retail store rewards programs
* 🎮 Gamified apps with point systems
* 💳 Cashback or incentive platforms
* 🌐 Web3 customer engagement tools

---

## 🔮 Future Improvements

* ⏳ Expiry for loyalty points
* 🏆 Tiered rewards system
* 🎟️ NFT-based perks or coupons
* 👥 Multi-admin or DAO governance
* 📡 Event emission & analytics tracking

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo, open issues, or submit pull requests.

---

## 📄 License

MIT License

---

## 🙌 Acknowledgements

Built using the Soroban smart contract framework on Stellar.
