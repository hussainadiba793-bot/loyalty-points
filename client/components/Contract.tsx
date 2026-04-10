"use client";

import { useState, useCallback } from "react";
import {
  addPoints,
  redeemPoints,
  getPoints,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7" />
      <circle cx="17" cy="16" r="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#fbbf24]/30 focus-within:shadow-[0_0_20px_rgba(251,191,36,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "balance" | "add" | "redeem";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("balance");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const [addUser, setAddUser] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [redeemAmount, setRedeemAmount] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  const [checkUser, setCheckUser] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleAddPoints = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!addUser.trim() || !addAmount.trim()) return setError("Fill in all fields");
    const amount = parseInt(addAmount, 10);
    if (isNaN(amount)) return setError("Invalid amount");
    setError(null);
    setIsAdding(true);
    setTxStatus("Adding points...");
    try {
      await addPoints(walletAddress, addUser.trim(), amount);
      setTxStatus("Points added successfully!");
      setAddUser("");
      setAddAmount("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsAdding(false);
    }
  }, [walletAddress, addUser, addAmount]);

  const handleRedeemPoints = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!redeemAmount.trim()) return setError("Enter an amount");
    const amount = parseInt(redeemAmount, 10);
    if (isNaN(amount)) return setError("Invalid amount");
    setError(null);
    setIsRedeeming(true);
    setTxStatus("Redeeming points...");
    try {
      await redeemPoints(walletAddress, walletAddress, amount);
      setTxStatus("Points redeemed successfully!");
      setRedeemAmount("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsRedeeming(false);
    }
  }, [walletAddress, redeemAmount]);

  const handleCheckBalance = useCallback(async () => {
    if (!checkUser.trim()) return setError("Enter a wallet address");
    setError(null);
    setIsChecking(true);
    setPointsBalance(null);
    try {
      const result = await getPoints(checkUser.trim());
      if (result !== null) {
        setPointsBalance(result);
      } else {
        setError("Could not fetch balance");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsChecking(false);
    }
  }, [checkUser]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "balance", label: "Balance", icon: <WalletIcon />, color: "#4fc3f7" },
    { key: "add", label: "Add Points", icon: <PlusIcon />, color: "#fbbf24" },
    { key: "redeem", label: "Redeem", icon: <MinusIcon />, color: "#34d399" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("success") || txStatus.includes("added") || txStatus.includes("redeemed") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#fbbf24]/20 to-[#34d399]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#fbbf24]">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 18V6" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Loyalty Token</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setPointsBalance(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Balance */}
            {activeTab === "balance" && (
              <div className="space-y-5">
                <MethodSignature name="get_points" params="(user: Address)" returns="-> u32" color="#4fc3f7" />
                {walletAddress && (
                  <button
                    onClick={() => setCheckUser(walletAddress)}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs text-white/50 hover:text-white/80 transition-all"
                  >
                    Use my wallet: {truncate(walletAddress)}
                  </button>
                )}
                <Input label="Wallet Address" value={checkUser} onChange={(e) => setCheckUser(e.target.value)} placeholder="G..." />
                <ShimmerButton onClick={handleCheckBalance} disabled={isChecking} shimmerColor="#4fc3f7" className="w-full">
                  {isChecking ? <><SpinnerIcon /> Querying...</> : <><WalletIcon /> Check Balance</>}
                </ShimmerButton>

                {pointsBalance !== null && (
                  <div className="rounded-xl border border-[#fbbf24]/20 bg-[#fbbf24]/[0.05] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Points Balance</span>
                      <Badge variant="warning">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24] mr-1.5" />
                        Active
                      </Badge>
                    </div>
                    <div className="p-6 flex items-center justify-center">
                      <div className="text-center">
                        <p className="font-mono text-4xl text-white/90">{pointsBalance}</p>
                        <p className="text-xs text-white/35 mt-2">LOYALTY POINTS</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add Points */}
            {activeTab === "add" && (
              <div className="space-y-5">
                <MethodSignature name="add_points" params="(user: Address, amount: u32)" color="#fbbf24" />
                <Input label="User Wallet Address" value={addUser} onChange={(e) => setAddUser(e.target.value)} placeholder="G..." />
                <Input label="Points Amount" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="e.g. 100" type="number" />
                {walletAddress ? (
                  <ShimmerButton onClick={handleAddPoints} disabled={isAdding} shimmerColor="#fbbf24" className="w-full">
                    {isAdding ? <><SpinnerIcon /> Adding...</> : <><PlusIcon /> Add Points</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#fbbf24]/20 bg-[#fbbf24]/[0.03] py-4 text-sm text-[#fbbf24]/60 hover:border-[#fbbf24]/30 hover:text-[#fbbf24]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to add points
                  </button>
                )}
              </div>
            )}

            {/* Redeem */}
            {activeTab === "redeem" && (
              <div className="space-y-5">
                <MethodSignature name="redeem_points" params="(user: Address, amount: u32)" color="#34d399" />
                <Input label="Points to Redeem" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} placeholder="e.g. 50" type="number" />
                {walletAddress ? (
                  <ShimmerButton onClick={handleRedeemPoints} disabled={isRedeeming} shimmerColor="#34d399" className="w-full">
                    {isRedeeming ? <><SpinnerIcon /> Redeeming...</> : <><MinusIcon /> Redeem Points</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#34d399]/20 bg-[#34d399]/[0.03] py-4 text-sm text-[#34d399]/60 hover:border-[#34d399]/30 hover:text-[#34d399]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to redeem points
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Loyalty Token &middot; Soroban</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-white/15">POINTS</span>
              <span className="text-white/10 text-[8px]">&rarr;</span>
              <span className="font-mono text-[9px] text-white/15">REWARDS</span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}