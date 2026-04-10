#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol, Address, Map};

#[contract]
pub struct LoyaltyContract;

#[contractimpl]
impl LoyaltyContract {
    // Initialize contract with admin
    pub fn init(env: Env, admin: Address) {
        let key = symbol_short!("ADMIN");
        env.storage().instance().set(&key, &admin);
    }

    // Add loyalty points to a user (only admin)
    pub fn add_points(env: Env, user: Address, amount: u32) {
        let admin: Address = env.storage().instance().get(&symbol_short!("ADMIN")).unwrap();
        admin.require_auth();

        let mut points: u32 = env
            .storage()
            .persistent()
            .get(&user)
            .unwrap_or(0);

        points += amount;
        env.storage().persistent().set(&user, &points);
    }

    // Redeem points
    pub fn redeem_points(env: Env, user: Address, amount: u32) {
        user.require_auth();

        let mut points: u32 = env
            .storage()
            .persistent()
            .get(&user)
            .unwrap_or(0);

        if points < amount {
            panic!("Not enough points");
        }

        points -= amount;
        env.storage().persistent().set(&user, &points);
    }

    // Check balance
    pub fn get_points(env: Env, user: Address) -> u32 {
        env.storage().persistent().get(&user).unwrap_or(0)
    }
}