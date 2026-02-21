import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import AccountSetup from './components/AccountSetup';
import WithdrawalRequest from './components/WithdrawalRequest';
import AdminWithdrawalPanel from './components/AdminWithdrawalPanel';
import WithdrawalHistory from './components/WithdrawalHistory';
import './App.css';
import img4 from './data/4.png';
import img5 from './data/5.png';
import img1 from './data/1.png';
import img2 from './data/2.png';
import img3 from './data/3.png';
const carouselImages = [img4, img5, img1, img2, img3];

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOTUSDT', 'AVAXUSDT', 'MATICUSDT', 'BNBUSDT', 'DOGEUSDT', 'LTCUSDT', 'TRXUSDT'];
const TIMEFRAMES = ['1', '5', '15', '60', '240', '1D', '1W', '1M'];

// Crypto data with details
const cryptoData = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: 91391.5, change24h: 2.34, volume: '42.5B', marketCap: '1.8T', color: '#F7931A' },
  { symbol: 'ETHUSDT', name: 'Ethereum', price: 3850.25, change24h: 1.56, volume: '18.3B', marketCap: '462B', color: '#627EEA' },
  { symbol: 'SOLUSDT', name: 'Solana', price: 185.42, change24h: 5.23, volume: '3.2B', marketCap: '81B', color: '#00FFA3' },
  { symbol: 'XRPUSDT', name: 'Ripple', price: 2.15, change24h: 0.89, volume: '1.8B', marketCap: '117B', color: '#23292F' },
  { symbol: 'ADAUSDT', name: 'Cardano', price: 0.85, change24h: -0.45, volume: '850M', marketCap: '30B', color: '#0033AD' },
  { symbol: 'DOTUSDT', name: 'Polkadot', price: 35.50, change24h: 1.23, volume: '650M', marketCap: '45B', color: '#E6007A' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', price: 45.20, change24h: 3.45, volume: '920M', marketCap: '16B', color: '#E84142' },
  { symbol: 'MATICUSDT', name: 'Polygon', price: 1.25, change24h: -1.23, volume: '520M', marketCap: '12B', color: '#8247E5' },
  { symbol: 'BNBUSDT', name: 'Binance Coin', price: 650.30, change24h: 0.78, volume: '1.2B', marketCap: '100B', color: '#F0B90B' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', price: 0.18, change24h: 0.25, volume: '1.1B', marketCap: '26B', color: '#C2A633' },
  { symbol: 'LTCUSDT', name: 'Litecoin', price: 85.60, change24h: 0.92, volume: '450M', marketCap: '6.3B', color: '#BFBBBB' },
  { symbol: 'TRXUSDT', name: 'Tron', price: 0.12, change24h: 1.45, volume: '380M', marketCap: '11B', color: '#FF001B' },
];

// Chart types for TradingView
const CHART_TYPES = [
  { id: '0', name: 'Candles', icon: '📊' },
  { id: '1', name: 'Bars', icon: '📈' },
  { id: '9', name: 'HLC', icon: '📉' },
  { id: '8', name: 'Line', icon: '➖' },
  { id: '2', name: 'Area', icon: '▀' },
  { id: '3', name: 'Heikin Ashi', icon: '🔄' },
  { id: '7', name: 'Baseline', icon: '⚖️' },
  { id: '4', name: 'Hollow Candles', icon: '🕯️' },
];

// Indicator presets
const INDICATOR_PRESETS = [
  { name: 'MA Cross', indicators: ['Moving Average', 'EMA'] },
  { name: 'RSI + MACD', indicators: ['RSI', 'MACD'] },
  { name: 'Bollinger + Volume', indicators: ['Bollinger Bands', 'Volume'] },
  { name: 'All Trend', indicators: ['MA', 'EMA', 'VWAP'] },
  { name: 'All Oscillators', indicators: ['RSI', 'MACD', 'Stochastic'] },
];

// Challenges Data
const CHALLENGES = [
  {
    id: 1,
    name: "🚀 Beginner Challenge",
    fee: "₹1,000",
    paperBalance: 20000,
    profitTarget: 10,
    dailyLossLimit: 4,
    maxLossLimit: 10,
    maxOrderSize: 20, // percentage of capital
    maxLeverage: 10,
    autoStopLossTarget: 10, // kept for reference but no longer auto-applied
    oneTradeAtTime: true,
    reward: "Fee Refund + Skill Reward (20% of paper profit)",
    color: "#22c55e",
    icon: "🟢",
    description: "Perfect for beginners to learn trading with minimal risk"
  },
  {
    id: 2,
    name: "🟡 Intermediate Challenge",
    fee: "₹2,500",
    paperBalance: 50000,
    profitTarget: 10,
    dailyLossLimit: 4,
    maxLossLimit: 10,
    maxOrderSize: 20,
    maxLeverage: 10,
    autoStopLossTarget: 10,
    oneTradeAtTime: true,
    reward: "Fee Refund + Skill Reward (20% of paper profit)",
    color: "#eab308",
    icon: "🟡",
    description: "For traders with some experience looking to grow"
  },
  {
    id: 3,
    name: "🔴 PRO Challenge",
    fee: "₹5,000",
    paperBalance: 100000,
    profitTarget: 10,
    dailyLossLimit: 4,
    maxLossLimit: 10,
    maxOrderSize: 20,
    maxLeverage: 10,
    autoStopLossTarget: 10,
    oneTradeAtTime: true,
    reward: "Fee Refund + Skill Reward (20% of paper profit)",
    color: "#ef4444",
    icon: "🔴",
    description: "For advanced traders ready for maximum rewards"
  }
];
const PriceLineOverlay = ({ position, currentPrice }) => {
  if (!currentPrice) return null;

  const chartHeight = 500;
  const priceRange = currentPrice * 0.05;

  const mapPriceToY = (price) => {
    const topPrice = currentPrice + priceRange;
    const percent = (topPrice - price) / (priceRange * 2);
    return percent * chartHeight;
  };

  const entryY = mapPriceToY(position.entryPrice);
  const slY = position.stopLoss ? mapPriceToY(position.stopLoss) : null;
  const tpY = position.takeProfit ? mapPriceToY(position.takeProfit) : null;

  const pnl =
    (currentPrice - position.entryPrice) *
    position.size *
    position.leverage *
    (position.side === 'LONG' ? 1 : -1);

  return (
    <>
      <div style={{ position: 'absolute', top: entryY, left: 0, right: 0, height: 2, background: '#2962FF' }}>
        <span style={boxStyle}>Entry</span>
      </div>

      {slY !== null && (
        <div style={{ position: 'absolute', top: slY, left: 0, right: 0, height: 2, background: '#D32F2F' }}>
          <span style={boxStyle}>SL</span>
        </div>
      )}

      {tpY !== null && (
        <div style={{ position: 'absolute', top: tpY, left: 0, right: 0, height: 2, background: '#2E7D32' }}>
          <span style={boxStyle}>TP</span>
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: mapPriceToY(currentPrice),
        right: 10,
        background: pnl >= 0 ? '#2E7D32' : '#D32F2F',
        color: '#fff',
        padding: '2px 6px',
        borderRadius: 4,
        fontSize: 12
      }}>
        {pnl.toFixed(2)}
      </div>
    </>
  );
};

const boxStyle = {
  position: 'absolute',
  right: 0,
  top: -8,
  background: '#000',
  color: '#fff',
  padding: '2px 6px',
  fontSize: 10,
  borderRadius: 4
};


function App() {
  const [userAccount, setUserAccount] = useState({
    id: null,
    name: "",
    email: "",
    realBalance: 0,
    paperBalance: 0,
    currentChallenge: null,
    notifications: [],
    transactions: [],
    accountStatus: 'pending',
    role: 'user',
    bankAccount: {
      accountNumber: '',
      accountHolder: '',
      bankName: '',
      ifscCode: '',
      upiId: ''
    },
    challengeStats: {
      startDate: null,
      dailyLoss: 0,
      totalLoss: 0,
      totalProfit: 0,
      currentProfit: 0,
      maxDrawdown: 0,
      tradesCount: 0,
      winRate: 0,
      status: 'not_started', // 'not_started', 'active', 'passed', 'failed'
      dailyResetTime: null
    }
  });

  const [balance, setBalance] = useState(0);
  const [balanceAnimation, setBalanceAnimation] = useState(false);
  const [equity, setEquity] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [mode, setMode] = useState('DEMO');
  const [activeDashboard, setActiveDashboard] = useState('Challenges');
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [userBankAccount, setUserBankAccount] = useState({
    accountNumber: '',
    accountHolderName: '',
    bankName: '',
    ifscCode: '',
    upiId: ''
  });
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalStatus, setWithdrawalStatus] = useState('pending');
  const [showAccountSetup, setShowAccountSetup] = useState(false);
  const [showWithdrawalRequest, setShowWithdrawalRequest] = useState(false);
  const [timeframe, setTimeframe] = useState('60');
  const [activeIndicators, setActiveIndicators] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showIndicatorsPanel, setShowIndicatorsPanel] = useState(false);
  const [positions, setPositions] = useState([]);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
 const [orderSize, setOrderSize] = useState('');
  const [leverage, setLeverage] = useState(5);
  const [totalPnl, setTotalPnl] = useState(0);
    const [orderHistory, setOrderHistory] = useState([]);
  const orderHistoryRef = useRef(orderHistory);
  const [chartType, setChartType] = useState('0');
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlist, setWatchlist] = useState(['BTCUSDT', 'ETHUSDT', 'SOLUSDT']);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: 'Price',
    condition: 'above',
    value: '',
    enabled: true
  });

  const [signals, setSignals] = useState([]);
  const [showUPIScanner, setShowUPIScanner] = useState(false);
  const [upiAmount, setUpiAmount] = useState('');
  const [marketNews, setMarketNews] = useState([]);
  const [showNews, setShowNews] = useState(false);
  const [showOrderBook, setShowOrderBook] = useState(true);
  const [chartTheme, setChartTheme] = useState('dark');
  
  const [showChartLines, setShowChartLines] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editSL, setEditSL] = useState('');
  const [editTP, setEditTP] = useState('');
  const [editingPositionId, setEditingPositionId] = useState(null);
  const [editPositionSL, setEditPositionSL] = useState('');
  const [editPositionTP, setEditPositionTP] = useState('');

  const [pendingChallengePurchase, setPendingChallengePurchase] = useState(false);

  const [prices, setPrices] = useState({});

  const [widgetScriptLoaded, setWidgetScriptLoaded] = useState(false);

  const [chartHorizontalLines, setChartHorizontalLines] = useState([]);

  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const [upiQrCode, setUpiQrCode] = useState(null);
  const [upiSettings, setUpiSettings] = useState({
    upiId: '7799191208-2@ybl',
    merchantName: 'Paper2Real Trading'
  });

  const [dollarRate, setDollarRate] = useState(90);

  const [payments, setPayments] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentStats, setPaymentStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0,
    totalAmount: 0
  });

  const [marginRequired, setMarginRequired] = useState(0);
  const [availableFunds, setAvailableFunds] = useState(0);
 
  const [dailyLoss, setDailyLoss] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);
  const [challengeProgress, setChallengeProgress] = useState({
    profit: 0,
    dailyLoss: 0,
    totalLoss: 0,
    status: 'active'
  });

  // ========== NEW REFERRAL STATE ==========
  const [referralInfo, setReferralInfo] = useState(null);
  const [referralSettings, setReferralSettings] = useState({ target: 20, rewardName: 'Beginner Challenge', rewardAmount: 20000 });
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState('');

  // Draggable button state
  const [buttonPos, setButtonPos] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  // Fetch real-time price for a single symbol from Binance
  const fetchRealPrice = async (symbol) => {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error('Failed to fetch real price:', error);
      return null;
    }
  };

  // Determine minimum order lot size based on current price (informational only)
  const getMinLotSize = (price) => {
  if (!price) return 1;
  if (price >= 10000) return 0.001;
  if (price >= 1000) return 0.1;
  return 1;
};

  const positionsRef = useRef(positions);
  const selectedSymbolRef = useRef(selectedSymbol);

  // ===== DRAGGABLE BUTTON HANDLERS =====
  const handleMouseDown = (e) => {
    e.preventDefault();
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;

    const buttonWidth = buttonRef.current?.offsetWidth || 60;
    const buttonHeight = buttonRef.current?.offsetHeight || 60;
    newX = Math.max(0, Math.min(newX, window.innerWidth - buttonWidth));
    newY = Math.max(0, Math.min(newY, window.innerHeight - buttonHeight));

    setButtonPos({ x: newX, y: newY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    let newX = touch.clientX - dragOffset.x;
    let newY = touch.clientY - dragOffset.y;

    const buttonWidth = buttonRef.current?.offsetWidth || 60;
    const buttonHeight = buttonRef.current?.offsetHeight || 60;
    newX = Math.max(0, Math.min(newX, window.innerWidth - buttonWidth));
    newY = Math.max(0, Math.min(newY, window.innerHeight - buttonHeight));

    setButtonPos({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Update the ref whenever selectedSymbol changes
  useEffect(() => {
    selectedSymbolRef.current = selectedSymbol;
  }, [selectedSymbol]);
  
  useEffect(() => {
    positionsRef.current = positions;
  }, [positions]);

  // ========== CAPTURE REFERRAL CODE FROM URL ==========
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCodeFromUrl(ref);
    }
  }, []);

  // ========== FETCH REFERRAL INFO ==========
  const fetchReferralInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://myproject1-d097.onrender.com/api/user/referral', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReferralInfo(data);
        setReferralSettings({
          target: data.target,
          rewardName: data.rewardName,
          rewardAmount: data.rewardAmount
        });
      }
    } catch (error) {
      console.error('Failed to fetch referral info:', error);
    }
  };

  // Calculate margin and available funds
  useEffect(() => {
    if (isLoggedIn && userAccount.currentChallenge && userAccount.paperBalance > 0) {
      const currentPrice = prices[selectedSymbol] || cryptoData.find(c => c.symbol === selectedSymbol)?.price || 91391.5;
      const challenge = CHALLENGES.find(c => c.name === userAccount.currentChallenge) || CHALLENGES[0];

      // Paper balance in USD
      const paperUSD = userAccount.paperBalance / dollarRate;

      // Margin required for the current order (USD)
      const orderValueUSD = currentPrice * orderSize;
      const marginUSD = orderValueUSD / leverage;
      setMarginRequired(marginUSD);

      // Total margin used by open positions (USD)
      const totalMarginUsedUSD = positions.reduce((sum, pos) => {
        const posValueUSD = pos.entryPrice * pos.size;
        return sum + (posValueUSD / pos.leverage);
      }, 0);

      // Available funds in USD
      const availableUSD = paperUSD - totalMarginUsedUSD;
      setAvailableFunds(availableUSD);
    }
  }, [selectedSymbol, prices, positions, userAccount.paperBalance, userAccount.currentChallenge, isLoggedIn, orderSize, leverage, dollarRate]);
  
  // Fetch real-time price for the selected symbol every 3 seconds
  useEffect(() => {
    if (!selectedSymbol) return;

    const fetchLivePrice = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${selectedSymbol}`);
        const data = await response.json();
        const realPrice = parseFloat(data.price);
        if (!isNaN(realPrice) && realPrice > 0) {
          setPrices(prev => ({ ...prev, [selectedSymbol]: realPrice }));
          console.log(`Live price for ${selectedSymbol}: $${realPrice}`);
        }
      } catch (error) {
        console.error('Failed to fetch live price:', error);
      }
    };

    fetchLivePrice();
    const interval = setInterval(fetchLivePrice, 3000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);
 
  // Calculate daily and total loss
  useEffect(() => {
    if (userAccount.currentChallenge && userAccount.challengeStats) {
      const challenge = CHALLENGES.find(c => c.name === userAccount.currentChallenge);
      if (!challenge) return;

      // Calculate daily loss from today's trades
      const today = new Date().toDateString();
      const todayTrades = orderHistory.filter(order => {
        const orderDate = new Date(order.timestamp).toDateString();
        return orderDate === today && order.status === 'CLOSED';
      });
      
      const dailyLossAmount = Math.abs(todayTrades
        .filter(order => order.pnl < 0)
        .reduce((sum, order) => sum + order.pnl, 0));
      
      const dailyLossPercentage = (dailyLossAmount / userAccount.paperBalance) * 100;
      setDailyLoss(dailyLossPercentage);
      
      // Calculate total loss from all trades
      const allLosses = orderHistory
        .filter(order => order.status === 'CLOSED' && order.pnl < 0)
        .reduce((sum, order) => sum + Math.abs(order.pnl), 0);
      
      const totalLossPercentage = (allLosses / userAccount.paperBalance) * 100;
      setTotalLoss(totalLossPercentage);
      
      // Update challenge progress
      const totalProfit = orderHistory
        .filter(order => order.status === 'CLOSED' && order.pnl > 0)
        .reduce((sum, order) => sum + order.pnl, 0);
      
      const profitPercentage = (totalProfit / userAccount.paperBalance) * 100;
      
      setChallengeProgress({
        profit: profitPercentage,
        dailyLoss: dailyLossPercentage,
        totalLoss: totalLossPercentage,
        status: userAccount.challengeStats.status
      });
      
      // Check challenge rules
      checkChallengeRules();
    }
  }, [orderHistory, userAccount.currentChallenge, userAccount.paperBalance, userAccount.challengeStats]);

  // Check challenge rules
 const checkChallengeRules = (profitPct, dailyLossPct, totalLossPct) => {
  if (!userAccount.currentChallenge || userAccount.challengeStats.status !== 'active') return;

  const challenge = CHALLENGES.find(c => c.name === userAccount.currentChallenge);
  if (!challenge) return;

  const today = new Date().toDateString();

  // ⛔ DAILY LOSS → BLOCK ONLY FOR TODAY
  if (dailyLossPct >= challenge.dailyLossLimit) {
    if (userAccount.challengeStats.dailyBlockDate !== today) {
      alert(`⛔ Trading Blocked for Today\n\nDaily loss limit ${challenge.dailyLossLimit}% hit.\nTry again tomorrow.`);

      setUserAccount(prev => ({
        ...prev,
        challengeStats: {
          ...prev.challengeStats,
          dailyBlockDate: today
        }
      }));
    }
    return;
  }

  // ❌ MAX LOSS → CHALLENGE FAIL
  if (totalLossPct >= challenge.maxLossLimit) {
    alert(`❌ Challenge Failed\n\nMaximum loss limit ${challenge.maxLossLimit}% reached.`);
    updateChallengeStatus('failed', 'Maximum loss limit exceeded');
    return;
  }

  // 🎉 PROFIT TARGET → CHALLENGE PASS
  if (profitPct >= challenge.profitTarget) {
    alert(`🎉 Challenge Passed!\n\nProfit target ${challenge.profitTarget}% achieved.`);
    updateChallengeStatus('passed', 'Profit target achieved');
    return;
  }
};

  const updateChallengeStatus = (status, reason) => {
    setUserAccount(prev => ({
      ...prev,
      challengeStats: {
        ...prev.challengeStats,
        status,
        endReason: reason
      }
    }));
    
    // Update backend
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://myproject1-d097.onrender.com/api/challenge/status', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          reason
        })
      }).catch(console.error);
    }
  };

  const calculateDollarBalance = (paperBalance) => {
    return (paperBalance / dollarRate).toFixed(2);
  };

  useEffect(() => {
    if (isLoggedIn && userAccount.id) {
      loadUserPayments();
      
      const paymentCheckInterval = setInterval(() => {
        if (isLoggedIn) {
          loadUserPayments();
        }
      }, 30000);
      
      return () => clearInterval(paymentCheckInterval);
    }
  }, [isLoggedIn, userAccount.id]);

  useEffect(() => {
    calculatePaymentStats();
  }, [payments]);

  useEffect(() => {
    const lines = positions
      .filter(pos => pos.symbol === selectedSymbol)
      .map(pos => ({
        id: pos.id,
        side: pos.side,
        entryPrice: pos.entryPrice,
        stopLoss: pos.stopLoss,
        takeProfit: pos.takeProfit,
        size: pos.size,
        leverage: pos.leverage,
        positionValue: pos.entryPrice * pos.size * (pos.leverage || 1),
        stopLossAmount: pos.stopLoss ? Math.abs(pos.entryPrice - pos.stopLoss) * pos.size * (pos.leverage || 1) : 0,
        takeProfitAmount: pos.takeProfit ? Math.abs(pos.takeProfit - pos.entryPrice) * pos.size * (pos.leverage || 1) : 0
      }));
    setChartHorizontalLines(lines);
  }, [positions, selectedSymbol]);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('userData');
    const paymentsStr = localStorage.getItem('userPayments');
    
    if (loggedIn === 'true' && token && userDataStr) {
      const userData = JSON.parse(userDataStr);
      setIsLoggedIn(true);
      setUserAccount(userData);
      setBalance(userData.paperBalance || 0);
      setEquity(userData.paperBalance || 0);
      
      if (paymentsStr) {
        try {
          const savedPayments = JSON.parse(paymentsStr);
          setPayments(savedPayments);
          calculatePaymentStats(savedPayments);
        } catch (e) {
          console.error('Error parsing saved payments:', e);
        }
      }
      
      loadUserData(token);
    }
  }, []);

  useEffect(() => {
    const initialPrices = {};
    cryptoData.forEach(crypto => {
      initialPrices[crypto.symbol] = crypto.price;
    });
    setPrices(initialPrices);
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => setWidgetScriptLoaded(true);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn && showUPIScanner) {
      loadUpiQrCode();
    }
  }, [isLoggedIn, showUPIScanner]);

useEffect(() => {
  if (!widgetScriptLoaded || !window.TradingView || activeDashboard !== 'Trading') return;

  const container = document.getElementById('tradingview-chart-container');
  if (!container) return;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

 window.tvWidget = new window.TradingView.widget({
    container_id: 'tradingview-chart-container',
    width: '100%',
    height: '100%',
    symbol: `BINANCE:${selectedSymbol.replace('USDT', '')}USDT`,
    interval: timeframe === '1D' ? 'D' : timeframe === '1W' ? 'W' : timeframe === '1M' ? 'M' : timeframe,
    timezone: 'Etc/UTC',
    theme: chartTheme,
    style: parseInt(chartType),          // 👈 ensure it's a number
    locale: 'en',
    toolbar_bg: '#0a0e17',
    enable_publishing: false,
    allow_symbol_change: false,
    save_image: true,
    details: true,
    hotlist: true,
    calendar: true,
    studies: activeIndicators,
    show_popup_button: true,
    popup_width: '1000',
    popup_height: '650',
    hide_side_toolbar: false,
    onChartReady: function() {
      // Double‑check chart type once fully loaded
      setTimeout(() => {
        if (window.tvWidget && window.tvWidget.chart) {
          window.tvWidget.chart().setChartType(parseInt(chartType));
        }
        // Redraw trade lines
        if (positions.length > 0) {
          drawTradeLines(positions[0]);
        }
      }, 300);
    }
  });
}, [
  widgetScriptLoaded,
  selectedSymbol,
  timeframe,
  chartType,
  chartTheme,
  activeIndicators,
  activeDashboard
]);
useEffect(() => {
  if (window.tvWidget && positions.length > 0) {
    drawTradeLines(positions[0]);
  }
}, [positions]);

  useEffect(() => {
    const generateSignals = () => {
      const newSignals = SYMBOLS.map(symbol => {
        const price = prices[symbol] || cryptoData.find(c => c.symbol === symbol)?.price || 1000;
        const change = (Math.random() - 0.3) * 10;
        
        let signal = 'Neutral';
        let confidence = Math.random() * 100;
        
        if (change > 3) {
          signal = Math.random() > 0.5 ? 'Strong Buy' : 'Bullish';
        } else if (change < -3) {
          signal = Math.random() > 0.5 ? 'Strong Sell' : 'Bearish';
        }
        
        return {
          symbol,
          signal,
          confidence: confidence.toFixed(1),
          price,
          change: change.toFixed(2)
        };
      });
      
      setSignals(newSignals);
    };
    
    generateSignals();
    const interval = setInterval(generateSignals, 15000);
    return () => clearInterval(interval);
  }, [prices]);

  useEffect(() => {
    const news = [
      { id: 1, title: 'Bitcoin ETF Approval Expected Soon', source: 'Bloomberg', time: '2 hours ago', impact: 'High' },
      { id: 2, title: 'Ethereum Network Upgrade Completed', source: 'CoinDesk', time: '5 hours ago', impact: 'Medium' },
      { id: 3, title: 'Fed Signals Rate Cut in 2025', source: 'Reuters', time: '1 day ago', impact: 'High' },
      { id: 4, title: 'Solana Network Outage Resolved', source: 'The Block', time: '2 days ago', impact: 'Medium' },
      { id: 5, title: 'India Crypto Regulations Update', source: 'Economic Times', time: '3 days ago', impact: 'High' }
    ];
    setMarketNews(news);
  }, []);

 useEffect(() => {
  const checkSLTP = () => {
    const currentPositions = positionsRef.current;

    currentPositions.forEach(position => {
      const currentPrice = Number(prices[position.symbol] || position.entryPrice);
      const sl = position.stopLoss !== null && position.stopLoss !== undefined ? Number(position.stopLoss) : null;
      const tp = position.takeProfit !== null && position.takeProfit !== undefined ? Number(position.takeProfit) : null;

      if (position.side === 'LONG') {
        if (sl !== null && currentPrice <= sl) {
          closePosition(position.id, 'STOP_LOSS');
        }
        if (tp !== null && currentPrice >= tp) {
          closePosition(position.id, 'TAKE_PROFIT');
        }
      } else if (position.side === 'SHORT') {
        if (sl !== null && currentPrice >= sl) {
          closePosition(position.id, 'STOP_LOSS');
        }
        if (tp !== null && currentPrice <= tp) {
          closePosition(position.id, 'TAKE_PROFIT');
        }
      }
    });
  };

  const interval = setInterval(() => {
    checkSLTP();
  }, 2000);

  return () => clearInterval(interval);
}, [prices]);

  useEffect(() => {
    let total = 0;
    positions.forEach(pos => {
      const currentPrice = prices[pos.symbol] || pos.entryPrice;
      const positionValue = pos.entryPrice * pos.size * (pos.leverage || 1);
      const pnl = (currentPrice - pos.entryPrice) * pos.size * (pos.leverage || 1) * (pos.side === 'LONG' ? 1 : -1);
      total += pnl;
    });
    setTotalPnl(total);
    setEquity(balance + total);
  }, [positions, prices, balance]);
  
 useEffect(() => {
  const price = prices[selectedSymbol];
  if (!price) return;

  const min = getMinLotSize(price);
  setOrderSize(min.toString());
}, [selectedSymbol]);
   
  // ===== DRAGGABLE BUTTON EVENT LISTENERS =====
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const calculatePaymentStats = (paymentsList = payments) => {
    const stats = {
      total: paymentsList.length,
      pending: 0,
      completed: 0,
      rejected: 0,
      totalAmount: 0
    };
    
    paymentsList.forEach(payment => {
      if (payment.status === 'pending') stats.pending++;
      else if (payment.status === 'completed' || payment.status === 'approved') stats.completed++;
      else if (payment.status === 'rejected') stats.rejected++;
      
      if (payment.amount) {
        const amount = typeof payment.amount === 'string' 
          ? parseFloat(payment.amount.replace(/[^0-9.]/g, '')) 
          : payment.amount;
        stats.totalAmount += amount;
      }
    });
    
    setPaymentStats(stats);
  };

  const syncUserWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('https://myproject1-d097.onrender.com/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserAccount(prev => ({
            ...prev,
            realBalance: data.user.realBalance,
            paperBalance: data.user.paperBalance,
            currentChallenge: data.user.currentChallenge
          }));
          
          setBalance(data.user.paperBalance);
          setEquity(data.user.paperBalance + totalPnl);
          
          localStorage.setItem('userData', JSON.stringify(data.user));
          
          console.log('Wallet synced:', data.user.paperBalance);
        }
      }
    } catch (error) {
      console.error('Error syncing wallet:', error);
    }
  };

  const loadUserPayments = async () => {
    if (!isLoggedIn) return;
    
    setLoadingPayments(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://myproject1-d097.onrender.com/api/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.payments) {
          setPayments(data.payments);
          localStorage.setItem('userPayments', JSON.stringify(data.payments));
          calculatePaymentStats(data.payments);
          setLoadingPayments(false);
          
          await syncUserWallet();
          
          return;
        }
      }
      
      const savedPayments = localStorage.getItem('userPayments');
      if (savedPayments) {
        const parsedPayments = JSON.parse(savedPayments);
        setPayments(parsedPayments);
        calculatePaymentStats(parsedPayments);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      const savedPayments = localStorage.getItem('userPayments');
      if (savedPayments) {
        const parsedPayments = JSON.parse(savedPayments);
        setPayments(parsedPayments);
        calculatePaymentStats(parsedPayments);
      }
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadUserData = async (token) => {
    try {
      const positionsResponse = await fetch('https://myproject1-d097.onrender.com/api/trades/positions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (positionsResponse.ok) {
        const positionsData = await positionsResponse.json();
        if (positionsData.success) {
          setPositions(positionsData.positions);
        }
      }
      
      const ordersResponse = await fetch('https://myproject1-d097.onrender.com/api/trades/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        if (ordersData.success) {
          setOrderHistory(ordersData.orders);
        }
      }
      
      loadUserPayments();
      
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

 const loadUpiQrCode = async () => {
  try {
    // Add timestamp to avoid caching
    const response = await fetch('https://myproject1-d097.onrender.com/api/upi-qr?t=' + Date.now());
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        const upiId = data.upiId || '7799191208-2@ybl';
        const merchantName = data.merchantName || 'Paper2Real Trading';
        const uploadedQrUrl = data.qrCodeUrl; // URL of the uploaded image

      if (uploadedQrUrl) {
  // Build the full URL pointing to the backend
  const baseURL = 'https://myproject1-d097.onrender.com'; // Your backend
  const fullImageUrl = uploadedQrUrl.startsWith('http') 
    ? uploadedQrUrl 
    : `${baseURL}${uploadedQrUrl}`;
  
  // Test if the image is accessible
  try {
    const imgCheck = await fetch(fullImageUrl, { method: 'HEAD' });
    if (imgCheck.ok) {
      setUpiQrCode(fullImageUrl);
    } else {
      throw new Error('Image not accessible');
    }
  } catch {
            // Generate dynamic QR using the same UPI details
            const amount = parseFloat(upiAmount.replace(/,/g, '')) || 0;
            const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=Paper2Real Payment`;
            const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiString)}`;
            setUpiQrCode(generatedQrUrl);
          }
        } else {
          // No uploaded image, generate dynamic QR
          const amount = parseFloat(upiAmount.replace(/,/g, '')) || 0;
          const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=Paper2Real Payment`;
          const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiString)}`;
          setUpiQrCode(generatedQrUrl);
        }

        setUpiSettings({ upiId, merchantName });
        return;
      }
    }
  } catch (error) {
    console.log('Using fallback UPI settings:', error);
  }

  // Ultimate fallback (defaults)
  const defaultUpiId = '7799191208-2@ybl';
  const amount = parseFloat(upiAmount.replace(/,/g, '')) || 0;
  const upiString = `upi://pay?pa=${encodeURIComponent(defaultUpiId)}&pn=Paper2Real Trading&am=${amount}&cu=INR&tn=Paper2Real Payment`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiString)}`;
  setUpiSettings({ upiId: defaultUpiId, merchantName: 'Paper2Real Trading' });
  setUpiQrCode(qrCodeUrl);
};

  const addNewPayment = (paymentData) => {
    const newPayment = {
      id: `PAY${Date.now()}`,
      userId: userAccount.id,
      userName: userAccount.name,
      userEmail: userAccount.email,
      challengeName: paymentData.challengeName,
      amount: paymentData.amount,
      status: 'pending',
      paymentMethod: 'UPI',
      transactionId: paymentData.transactionId || `TXN${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: paymentData.notes || '',
      receiptUrl: paymentData.receiptUrl || null,
      adminNotes: null
    };
    
    setPayments(prev => [newPayment, ...prev]);
    
    const updatedPayments = [newPayment, ...payments];
    localStorage.setItem('userPayments', JSON.stringify(updatedPayments));
    
    calculatePaymentStats(updatedPayments);
    
    return newPayment;
  };

  const updatePaymentStatus = (paymentId, newStatus, adminNotes = null) => {
    const updatedPayments = payments.map(payment => {
      if (payment.id === paymentId) {
        return {
          ...payment,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          adminNotes: adminNotes || payment.adminNotes
        };
      }
      return payment;
    });
    
    setPayments(updatedPayments);
    localStorage.setItem('userPayments', JSON.stringify(updatedPayments));
    calculatePaymentStats(updatedPayments);
    
    if (newStatus === 'approved' || newStatus === 'completed') {
      const approvedPayment = updatedPayments.find(p => p.id === paymentId);
      if (approvedPayment) {
        const paperMoneyAmount = approvedPayment.challengeName.includes('Beginner') ? 20000 :
                                approvedPayment.challengeName.includes('Intermediate') ? 50000 :
                                approvedPayment.challengeName.includes('PRO') ? 100000 : 20000;
        
        setUserAccount(prev => ({
          ...prev,
          paperBalance: (prev.paperBalance || 0) + paperMoneyAmount,
          currentChallenge: approvedPayment.challengeName,
          challengeStats: {
            ...prev.challengeStats,
            startDate: new Date().toISOString(),
            dailyLoss: 0,
            totalLoss: 0,
            totalProfit: 0,
            currentProfit: 0,
            maxDrawdown: 0,
            tradesCount: 0,
            winRate: 0,
            status: 'active',
            dailyResetTime: new Date().toISOString()
          }
        }));
        
        setBalance(prev => prev + paperMoneyAmount);
        setEquity(prev => prev + paperMoneyAmount);
        
        setTimeout(() => {
          alert(`✅ Challenge Approved!\n\nYour payment for ${approvedPayment.challengeName} has been approved.\n₹${paperMoneyAmount.toLocaleString()} paper money has been added to your account.\nYou can now start trading!`);
        }, 500);
      }
    }
  };

  const simulateAdminApproval = (paymentId) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    setTimeout(() => {
      const isApproved = Math.random() > 0.1;
      
      if (isApproved) {
        updatePaymentStatus(paymentId, 'approved', 'Payment verified successfully. Paper money added to account.');
        
        const paperMoneyAmount = payment.challengeName.includes('Beginner') ? 20000 :
                                payment.challengeName.includes('Intermediate') ? 50000 :
                                payment.challengeName.includes('PRO') ? 100000 : 20000;
        
        const token = localStorage.getItem('token');
        if (token) {
          fetch('https://myproject1-d097.onrender.com/api/payments/' + paymentId + '/status', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'approved',
              notes: 'Payment approved by admin'
            })
          }).catch(console.error);
        }
      } else {
        updatePaymentStatus(paymentId, 'rejected', 'Payment verification failed. Please contact support.');
      }
    }, 5000);
  };

  const submitPaymentToBackend = async (paymentData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://myproject1-d097.onrender.com/api/payments/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challengeName: paymentData.challengeName,
          amount: paymentData.amount,
          paymentMethod: 'UPI',
          transactionId: paymentData.transactionId,
          notes: paymentData.notes || `Payment for ${paymentData.challengeName}`
        })
      });
      
      console.log('Payment request status:', response.status);
      
      const data = await response.json();
      
      if (data.success) {
        return data.payment;
      } else {
        throw new Error(data.error || 'Payment submission failed');
      }
    } catch (error) {
      console.error('Error submitting payment to backend:', error);
      throw error;
    }
  };

  const syncPaymentsWithBackend = async () => {
    if (!isLoggedIn) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://myproject1-d097.onrender.com/api/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.payments) {
          const backendPayments = data.payments;
          const localPayments = payments;
          
          const allPaymentsMap = new Map();
          
          localPayments.forEach(payment => {
            if (payment.transactionId) {
              allPaymentsMap.set(payment.transactionId, payment);
            }
          });
          
          backendPayments.forEach(payment => {
            if (payment.transactionId) {
              allPaymentsMap.set(payment.transactionId, payment);
            }
          });
          
          const mergedPayments = Array.from(allPaymentsMap.values());
          mergedPayments.sort((a, b) => new Date(b.createdAt || b.submittedAt) - new Date(a.createdAt || a.submittedAt));
          
          setPayments(mergedPayments);
          localStorage.setItem('userPayments', JSON.stringify(mergedPayments));
          calculatePaymentStats(mergedPayments);
        }
      }
    } catch (error) {
      console.error('Error syncing payments:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (userData.password !== userData.confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        const response = await fetch('https://myproject1-d097.onrender.com/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                ref: referralCodeFromUrl // include referral code if present
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');
            
            setIsLoggedIn(true);
            setUserAccount(data.user);
            setBalance(data.user.paperBalance || 0);
            setEquity(data.user.paperBalance || 0);
            
            setShowRegister(false);
            setUserData({
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
            
            alert('Registration successful!');
            
            if (pendingChallengePurchase && selectedChallenge) {
                setTimeout(() => {
                    initiateUPIPayment(selectedChallenge.fee.replace('₹', ''));
                }, 500);
            }
            
            loadUserData(data.token);
            
            syncPaymentsWithBackend();
            
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please check if backend server is running.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch('https://myproject1-d097.onrender.com/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');
            
            setIsLoggedIn(true);
            setUserAccount(data.user);
            setBalance(data.user.paperBalance || 0);
            setEquity(data.user.paperBalance || 0);
            
            setShowLogin(false);
            
            loadUserData(data.token);
            
            syncPaymentsWithBackend();
            
            alert('Login successful!');
            
            if (!data.user.currentChallenge) {
                setActiveDashboard('Challenges');
            }
        } else {
            alert(data.error || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert(`Login failed: ${error.message}. Please check if backend server is running and CORS is configured.`);
    }
    
    setLoginData({ email: '', password: '' });
  };

const validateTrade = () => {
  if (!isLoggedIn) {
    return { valid: false, message: 'Please login to trade' };
  }

  if (!userAccount.currentChallenge || userAccount.paperBalance === 0) {
    return { valid: false, message: 'Please purchase a challenge to start trading' };
  }

  const challenge = CHALLENGES.find(c => c.name === userAccount.currentChallenge);
  if (!challenge) {
    return { valid: false, message: 'Invalid challenge configuration' };
  }

  // 🚫 Challenge already ended
  if (userAccount.challengeStats.status !== 'active') {
    return { valid: false, message: `Challenge ${userAccount.challengeStats.status}. Cannot trade.` };
  }

  const today = new Date().toDateString();

  // ⛔ BLOCKED FOR TODAY
  if (userAccount.challengeStats.dailyBlockDate === today) {
    return {
      valid: false,
      message: '⛔ Trading blocked today due to daily loss hit. Try again tomorrow.'
    };
  }

  // One trade at a time
  if (challenge.oneTradeAtTime && positions.length > 0) {
    return { valid: false, message: 'Only one trade allowed at a time for this challenge' };
  }

  // Daily loss rule
  if (dailyLoss >= challenge.dailyLossLimit) {
    return { valid: false, message: `Daily loss limit (${challenge.dailyLossLimit}%) reached` };
  }

  // Max loss rule
  if (totalLoss >= challenge.maxLossLimit) {
    return { valid: false, message: `Maximum loss limit (${challenge.maxLossLimit}%) reached` };
  }

  const currentPrice =
    prices[selectedSymbol] ||
    cryptoData.find(c => c.symbol === selectedSymbol)?.price ||
    91391.5;

  const paperUSD = userAccount.paperBalance / dollarRate;
  const orderValueUSD = currentPrice * orderSize;
  const marginUSD = orderValueUSD / leverage;

  const totalMarginUsedUSD = positions.reduce((sum, pos) => {
    const posValueUSD = pos.entryPrice * pos.size;
    return sum + (posValueUSD / pos.leverage);
  }, 0);

  const availableUSD = paperUSD - totalMarginUsedUSD;

  if (availableUSD <= 0) {
    return { valid: false, message: 'Insufficient available funds' };
  }

  if (marginUSD > availableUSD) {
    return { valid: false, message: 'Insufficient margin. Reduce order size or increase leverage.' };
  }

  const totalPaperUSD = userAccount.paperBalance / dollarRate;
  const maxAllowedMarginUSD = totalPaperUSD * (challenge.maxOrderSize / 100);

  if (marginUSD > maxAllowedMarginUSD) {
    return {
      valid: false,
      message: `Margin required ($${marginUSD.toFixed(2)}) exceeds ${challenge.maxOrderSize}% of capital ($${maxAllowedMarginUSD.toFixed(2)})`
    };
  }

  // Leverage rule
  if (leverage > challenge.maxLeverage) {
    return { valid: false, message: `Leverage exceeds maximum (${challenge.maxLeverage}x)` };
  }

  return { valid: true, message: '' };
};

  const handleTrade = async (side) => {
    const validation = validateTrade();
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    
    // Get the latest real price from Binance
    let currentPrice = await fetchRealPrice(selectedSymbol);
    
    // Fallback if API fails
    if (!currentPrice) {
      currentPrice = prices[selectedSymbol] || cryptoData.find(c => c.symbol === selectedSymbol)?.price || 91391.5;
      console.warn('Using fallback price for order');
    }

    // Update local price for consistency
    setPrices(prev => ({ ...prev, [selectedSymbol]: currentPrice }));

    const challenge = CHALLENGES.find(c => c.name === userAccount.currentChallenge);
    
    // Auto SL/TP removed – user must manually enter or leave blank.
    // Parse SL and TP, treat empty strings as null
  // Auto SL = 10%, Auto TP = 20%
// Auto SL = 10% of margin, Auto TP = 20% of margin
let sl = null;
let tp = null;

// money risked and reward based on margin used
const slAmount = marginRequired * 0.30; // 30% loss of margin
const tpAmount = marginRequired * 0.60; // 60% profit of margin

// price movement needed for that PnL
const priceMoveForSL = slAmount / (orderSize * leverage);
const priceMoveForTP = tpAmount / (orderSize * leverage);

if (side === 'LONG') {
  sl = parseFloat((currentPrice - priceMoveForSL).toFixed(2));
  tp = parseFloat((currentPrice + priceMoveForTP).toFixed(2));
} else if (side === 'SHORT') {
  sl = parseFloat((currentPrice + priceMoveForSL).toFixed(2));
  tp = parseFloat((currentPrice - priceMoveForTP).toFixed(2));
}

    
    try {
      const token = localStorage.getItem('token');
      const tradeData = {
        symbol: selectedSymbol,
        side: side,
        size: parseFloat(orderSize),
        leverage: leverage,
        entryPrice: currentPrice,
        stopLoss: sl,
        takeProfit: tp,
        margin: marginRequired
      };
      
      const response = await fetch('https://myproject1-d097.onrender.com/api/trades', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tradeData)
      });
      
      const data = await response.json();
          if (data.success) {
  const newPosition = {
    id: data.trade.id,
    ...tradeData,
    status: 'OPEN',
    timestamp: new Date().toLocaleTimeString(),
    pnl: 0,
    positionValue: data.trade.positionValue
  };

  setPositions(prev => {
    const updated = [newPosition, ...prev];
    drawTradeLines(newPosition);
    return updated;
  });
 
  setBalance(data.newBalance);

  const newOrder = {
    id: data.trade.id,
    ...tradeData,
    status: 'OPEN',
    timestamp: new Date().toLocaleString(),
    pnl: 0,
    currentPrice: currentPrice,
    positionValue: data.trade.positionValue,
    marginUsed: (currentPrice * orderSize) / leverage
  };

  setOrderHistory(prev => [newOrder, ...prev]);

  setUserAccount(prev => ({
    ...prev,
    challengeStats: {
      ...prev.challengeStats,
      tradesCount: prev.challengeStats.tradesCount + 1
    }
  }));

  setStopLoss('');
  setTakeProfit('');
      } else {
        alert(data.error || 'Trade failed');
      }
    } catch (error) {
      console.error('Trade error:', error);
      alert('Trade failed. Please try again.');
    }
  };
    
  const handleChallengeBuy = async (challenge) => {
    setSelectedChallenge(challenge);
    
    if (!isLoggedIn) {
      setPendingChallengePurchase(true);
      setShowRegister(true);
    } else {
      initiateUPIPayment(challenge.fee.replace('₹', ''));
      
      setTimeout(() => {
        alert(`💡 IMPORTANT:\n\nAfter payment, your request will be sent for admin approval.\nYou will receive ₹${challenge.paperBalance.toLocaleString()} paper money once admin approves your payment.`);
      }, 500);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://myproject1-d097.onrender.com/api/trades/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPositions(prev => prev.filter(p => p.id !== orderId));
        
        setOrderHistory(prev => prev.map(order => 
          order.id === orderId ? {
            ...order,
            status: 'CANCELLED',
            exitTime: new Date().toLocaleString(),
            updatedAt: new Date().toISOString()
          } : order
        ));
        
        if (data.newBalance !== undefined) {
          setBalance(data.newBalance);
          setUserAccount(prev => ({
            ...prev,
            paperBalance: data.newBalance
          }));
        }
        
        if (data.newBalance !== undefined) {
          setEquity(data.newBalance + totalPnl);
        }
        
        alert('✅ Order cancelled successfully');
      } else {
        throw new Error(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(`❌ Failed to cancel order: ${error.message}`);
    }
  };

  const closePosition = async (positionId, reason = 'MANUAL') => {
    const position = positions.find(p => p.id === positionId);
    if (position) {
      const currentPrice = prices[position.symbol] || position.entryPrice;
      const pnl = (currentPrice - position.entryPrice) * position.size * position.leverage * 
                  (position.side === 'LONG' ? 1 : -1);
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://myproject1-d097.onrender.com/api/trades/${positionId}/close`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            exitPrice: currentPrice,
            closeReason: reason 
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          const newBalance = data.user?.paperBalance || (balance + pnl + position.positionValue);
          setBalance(newBalance);
          setEquity(newBalance + (totalPnl - pnl));
          
          setPositions(prev => prev.filter(p => p.id !== positionId));
          
          if (data.user) {
            setUserAccount(prev => ({
              ...prev,
              paperBalance: data.user.paperBalance
            }));
          }
          
          setOrderHistory(prev => prev.map(order => 
            order.id === positionId ? {
              ...order,
              status: 'CLOSED',
              exitPrice: currentPrice,
              exitTime: new Date().toLocaleString(),
              pnl: pnl,
              closeReason: reason,
              updatedAt: new Date().toISOString()
            } : order
          ));
          
          // Update challenge stats
          if (userAccount.currentChallenge) {
            const updatedStats = { ...userAccount.challengeStats };
            if (pnl > 0) {
              updatedStats.totalProfit += pnl;
              updatedStats.currentProfit += pnl;
            } else {
              updatedStats.totalLoss += Math.abs(pnl);
            }

                    
            // Calculate win rate
            const closedTrades = orderHistory.filter(o => o.status === 'CLOSED').length + 1;
            const winningTrades = orderHistory.filter(o => o.status === 'CLOSED' && o.pnl > 0).length + (pnl > 0 ? 1 : 0);
            updatedStats.winRate = (winningTrades / closedTrades) * 100;
            
            setUserAccount(prev => ({
              ...prev,
              challengeStats: updatedStats
            }));
            
            // Check challenge rules after trade close
            setTimeout(() => checkChallengeRules(), 100);
          }
        }
      } catch (error) {
        console.error('Error closing position:', error);
        alert('Failed to close position. Please try again.');
      }
    }
  };

  const closePositionFromChart = async (positionId) => {
    const position = positions.find(p => p.id === positionId);
    if (position) {
      const confirmClose = window.confirm(`Close ${position.side} position for ${position.symbol}?`);
      if (confirmClose) {
        await closePosition(positionId, 'MANUAL_CHART');
      }
    }
  };

  const updatePositionSLTP = async (positionId, sl, tp) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://myproject1-d097.onrender.com/api/trades/${positionId}/update-sltp`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          stopLoss: sl ? parseFloat(sl) : undefined,
          takeProfit: tp ? parseFloat(tp) : undefined
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const updatedPositions = positions.map(pos => 
          pos.id === positionId ? { 
            ...pos, 
            stopLoss: sl ? parseFloat(sl) : pos.stopLoss,
            takeProfit: tp ? parseFloat(tp) : pos.takeProfit
          } : pos
        );
        
        setPositions(updatedPositions);
        
        setOrderHistory(prev => prev.map(order => 
          order.id === positionId ? {
            ...order,
            stopLoss: sl ? parseFloat(sl) : order.stopLoss,
            takeProfit: tp ? parseFloat(tp) : order.takeProfit
          } : order
        ));
      }
    } catch (error) {
      console.error('Error updating SL/TP:', error);
    }
    
    setEditingPositionId(null);
    setEditPositionSL('');
    setEditPositionTP('');
  };
 const drawTradeLines = (position) => {
  if (!window.tvWidget || !position) return;

  try {
    const chart = window.tvWidget.chart
      ? window.tvWidget.chart()
      : window.tvWidget;

    if (!chart) return;

    chart.removeAllShapes();

    chart.createOrderLine()
      .setPrice(position.entryPrice)
      .setText('Entry')
      .setLineColor('#2962FF')
      .setLineWidth(2)
      .setEditable(false);

    if (position.stopLoss) {
      const slLine = chart.createOrderLine()
        .setPrice(position.stopLoss)
        .setText('SL')
        .setLineColor('#D32F2F')
        .setLineWidth(2)
        .setEditable(true);

      slLine.onMove((newPrice) => {
        updatePositionSLTP(position.id, newPrice, position.takeProfit);
      });
    }

    if (position.takeProfit) {
      const tpLine = chart.createOrderLine()
        .setPrice(position.takeProfit)
        .setText('TP')
        .setLineColor('#2E7D32')
        .setLineWidth(2)
        .setEditable(true);

      tpLine.onMove((newPrice) => {
        updatePositionSLTP(position.id, position.stopLoss, newPrice);
      });
    }

  } catch (e) {
    console.log("Line draw error:", e);
  }
};



 const updateOrderSLTP = async (orderId, sl, tp) => {
  const order = orderHistory.find(o => o.id === orderId);
  if (!order) return;

  // Discipline rule: user cannot widen Stop Loss
  if (sl) {
    const newSL = parseFloat(sl);

    if (order.side === 'LONG' && newSL < order.stopLoss) {
      alert('❌ You can only reduce Stop Loss (cannot increase risk)');
      return;
    }

    if (order.side === 'SHORT' && newSL > order.stopLoss) {
      alert('❌ You can only reduce Stop Loss (cannot increase risk)');
      return;
    }
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://myproject1-d097.onrender.com/api/trades/${orderId}/update-sltp`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        stopLoss: sl ? parseFloat(sl) : undefined,
        takeProfit: tp ? parseFloat(tp) : undefined
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setOrderHistory(prev => prev.map(order => 
        order.id === orderId ? {
          ...order,
          stopLoss: sl ? parseFloat(sl) : order.stopLoss,
          takeProfit: tp ? parseFloat(tp) : order.takeProfit
        } : order
      ));
      
      setPositions(prev => prev.map(pos => 
        pos.id === orderId ? {
          ...pos,
          stopLoss: sl ? parseFloat(sl) : pos.stopLoss,
          takeProfit: tp ? parseFloat(tp) : pos.takeProfit
        } : pos
      ));
    }
  } catch (error) {
    console.error('Error updating order SL/TP:', error);
  }

  setEditingOrderId(null);
  setEditSL('');
  setEditTP('');
};


  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };
  
  useEffect(() => {
    const handleResize = () => {
      if (window.TradingView && widgetScriptLoaded && activeDashboard === 'Trading') {
        const container = document.getElementById('tradingview-chart-container');
        if (container) {
          window.dispatchEvent(new Event('resize'));
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [widgetScriptLoaded, activeDashboard, isFullScreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const calculateStats = () => {
    const closedOrders = orderHistory.filter(o => o.status === 'CLOSED');
    if (closedOrders.length === 0) return { winRate: 0, profitFactor: 0, maxDrawdown: 0, avgWinLoss: 0, total: 0, win: 0, loss: 0 };
    
    const winning = closedOrders.filter(o => o.pnl > 0);
    const losing = closedOrders.filter(o => o.pnl < 0);
    
    const winRate = (winning.length / closedOrders.length) * 100;
    const totalProfit = winning.reduce((sum, o) => sum + o.pnl, 0);
    const totalLoss = Math.abs(losing.reduce((sum, o) => sum + o.pnl, 0));
    const profitFactor = totalLoss === 0 ? totalProfit : totalProfit / totalLoss;
    const avgWinLoss = closedOrders.reduce((sum, o) => sum + o.pnl, 0) / closedOrders.length;
    
    let maxDrawdown = 0;
    let peak = balance;
    let current = balance;
    
    closedOrders.forEach(order => {
      current += order.pnl || 0;
      const drawdown = (peak - current) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
      if (current > peak) peak = current;
    });
    
    return { 
      winRate: winRate || 0, 
      profitFactor: profitFactor || 0, 
      maxDrawdown: maxDrawdown * 100 || 0,
      avgWinLoss: avgWinLoss || 0,
      total: closedOrders.length,
      win: winning.length,
      loss: losing.length
    };
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userPayments');
    setIsLoggedIn(false);
    setActiveDashboard('Challenges');
    setUserAccount({
      id: null,
      name: "",
      email: "",
      realBalance: 0,
      paperBalance: 0,
      currentChallenge: null,
      notifications: [],
      transactions: [],
      accountStatus: 'pending',
      role: 'user',
      challengeStats: {
        startDate: null,
        dailyLoss: 0,
        totalLoss: 0,
        totalProfit: 0,
        currentProfit: 0,
        maxDrawdown: 0,
        tradesCount: 0,
        winRate: 0,
        status: 'not_started'
      }
    });
    setBalance(0);
    setEquity(0);
    setPositions([]);
    setOrderHistory([]);
    setPayments([]);
    setPendingChallengePurchase(false);
  };

  const handleFileDrop = (file) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      if (file.size <= 5 * 1024 * 1024) {
        setPaymentReceipt(file);
        setReceiptUploaded(true);
      } else {
        alert('File size too large. Maximum size is 5MB.');
      }
    } else {
      alert('Please upload only JPG, PNG, or PDF files.');
    }
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileDrop(file);
    }
  };

  const initiateUPIPayment = (amount) => {
    const cleanAmount = amount.toString().replace('₹', '').replace(/,/g, '');
    setUpiAmount(cleanAmount);
    setShowUPIScanner(true);
    setPaymentReceipt(null);
    setReceiptUploaded(false);
    
    loadUpiQrCode();
    
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const simulateUPIPayment = (appName) => {
    if (window.confirm(`Open ${appName} to make payment of ₹${upiAmount}? `)) {
      setTimeout(() => {
        alert(`✅ Payment of ₹${upiAmount} successful via ${appName}!\n\nNow please upload your payment receipt.`);
      }, 1500);
    }
  };

  const simulateTestPayment = () => {
    const mockFile = {
      name: 'test_payment_receipt.jpg',
      size: 1024 * 1024,
      type: 'image/jpeg'
    };
    
    setPaymentReceipt(mockFile);
    setReceiptUploaded(true);
    
    window.alert('Test receipt uploaded! You can now submit for admin approval.');
  };

  const handlePaymentSubmit = async () => {
    if (!receiptUploaded || !paymentReceipt) {
      alert('Please upload your payment receipt first.');
      return;
    }
    
    if (!selectedChallenge || !isLoggedIn) {
      alert('Invalid payment request. Please try again.');
      return;
    }
    
    setUploadingReceipt(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const rawAmount = selectedChallenge.fee.replace('₹', '').replace(/,/g, '');
      const amount = parseFloat(rawAmount);
      
      if (isNaN(amount)) {
        throw new Error(`Invalid amount: ${selectedChallenge.fee}`);
      }
      
      const paymentData = {
        challengeName: selectedChallenge.name,
        amount: amount,
        paymentMethod: 'UPI',
        transactionId: `UPI${Date.now()}`,
        notes: `Payment for ${selectedChallenge.name} via UPI`,
        receiptUrl: paymentReceipt instanceof File ? URL.createObjectURL(paymentReceipt) : 'test_receipt_placeholder'
      };
      
      try {
        const backendPayment = await submitPaymentToBackend(paymentData);
        
        const newPayment = {
          ...paymentData,
          id: backendPayment.id,
          userId: userAccount.id,
          userName: userAccount.name,
          userEmail: userAccount.email,
          status: backendPayment.status,
          createdAt: backendPayment.submittedAt,
          updatedAt: backendPayment.submittedAt,
          adminNotes: null
        };
        
        setPayments(prev => [newPayment, ...prev]);
        
        const updatedPayments = [newPayment, ...payments];
        localStorage.setItem('userPayments', JSON.stringify(updatedPayments));
        calculatePaymentStats(updatedPayments);
        
        setUploadingReceipt(false);
        
        alert(`✅ Challenge payment submitted to admin!\n\nPayment ID: ${backendPayment.id}\nChallenge: ${selectedChallenge.name}\nAmount: ₹${amount}\nStatus: Pending Approval\n\nAdmin will review your payment within 24 hours.`);
        
        setShowUPIScanner(false);
        setPaymentReceipt(null);
        setReceiptUploaded(false);
        setSelectedChallenge(null);
        setUpiAmount('');
        
      } catch (backendError) {
        console.error('Backend submission failed:', backendError);
        
        const newPayment = addNewPayment(paymentData);
        
        setUploadingReceipt(false);
        
        alert(`⚠️ Payment saved locally (Backend connection failed)\n\nPayment ID: ${newPayment.id}\nPlease contact admin manually with transaction details.`);
        
        setShowUPIScanner(false);
        setPaymentReceipt(null);
        setReceiptUploaded(false);
        setSelectedChallenge(null);
        setUpiAmount('');
      }
      
    } catch (error) {
      setUploadingReceipt(false);
      console.error('Payment submission error:', error);
      alert(`❌ Payment submission failed:\n${error.message}\n\nPlease try again or contact support.`);
    }
  };

  const simulateAdminApprovalUpdated = async (paymentId) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    setTimeout(async () => {
      const isApproved = Math.random() > 0.1;
      
      if (isApproved) {
        updatePaymentStatus(paymentId, 'approved', 'Payment verified successfully. Paper money added to account.');
        
        const token = localStorage.getItem('token');
        if (token) {
          try {
            await fetch(`https://myproject1-d097.onrender.com/api/payments/${paymentId}/status`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                status: 'approved',
                notes: 'Payment verified successfully',
                processedBy: 'admin'
              })
            });
          } catch (error) {
            console.error('Backend update failed:', error);
          }
        }
      } else {
        updatePaymentStatus(paymentId, 'rejected', 'Payment verification failed. Please contact support.');
      }
    }, 5000);
  };

  const addAlert = () => {
    if (!newAlert.symbol || !newAlert.value) return;
    
    const alert = {
      id: Date.now(),
      ...newAlert,
      createdAt: new Date().toLocaleString(),
      triggered: false
    };
    
    setAlerts(prev => [alert, ...prev]);
    setShowAlertDialog(false);
    setNewAlert({
      symbol: '',
      type: 'Price',
      condition: 'above',
      value: '',
      enabled: true
    });
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const toggleWatchlist = (symbol) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(watchlist.filter(s => s !== symbol));
    } else {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const handleMarketTrade = (symbol) => {
    const validation = validateTrade();
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    
    setSelectedSymbol(symbol);
    setActiveDashboard('Trading');
  };

  const addIndicator = (indicator) => {
    if (!activeIndicators.includes(indicator)) {
      setActiveIndicators([...activeIndicators, indicator]);
    }
  };

  const removeIndicator = (indicator) => {
    setActiveIndicators(activeIndicators.filter(i => i !== indicator));
  };

  const applyPreset = (preset) => {
    setActiveIndicators(preset.indicators);
  };

  const currentPrice = prices[selectedSymbol] || cryptoData.find(c => c.symbol === selectedSymbol)?.price || 91391.5;
  const orderBookData = {
    bids: [
      { price: currentPrice * 0.9995, amount: 2.5, total: (currentPrice * 0.9995 * 2.5).toFixed(2) },
      { price: currentPrice * 0.9990, amount: 3.2, total: (currentPrice * 0.9990 * 3.2).toFixed(2) },
      { price: currentPrice * 0.9985, amount: 1.8, total: (currentPrice * 0.9985 * 1.8).toFixed(2) },
      { price: currentPrice * 0.9980, amount: 4.1, total: (currentPrice * 0.9980 * 4.1).toFixed(2) },
      { price: currentPrice * 0.9975, amount: 2.7, total: (currentPrice * 0.9975 * 2.7).toFixed(2) },
    ],
    asks: [
      { price: currentPrice * 1.0005, amount: 1.9, total: (currentPrice * 1.0005 * 1.9).toFixed(2) },
      { price: currentPrice * 1.0010, amount: 2.3, total: (currentPrice * 1.0010 * 2.3).toFixed(2) },
      { price: currentPrice * 1.0015, amount: 3.1, total: (currentPrice * 1.0015 * 3.1).toFixed(2) },
      { price: currentPrice * 1.0020, amount: 1.5, total: (currentPrice * 1.0020 * 1.5).toFixed(2) },
      { price: currentPrice * 1.0025, amount: 2.8, total: (currentPrice * 1.0025 * 2.8).toFixed(2) },
    ]
  };

  const calculatePositionPnL = (position) => {
    const currentPrice = prices[position.symbol] || position.entryPrice;
    const pnl = (currentPrice - position.entryPrice) * position.size * position.leverage * 
                (position.side === 'LONG' ? 1 : -1);
    return pnl;
  };

 const calculateOrderPnL = (order) => {
  if (order.status?.toUpperCase() === 'CLOSED' || order.status?.toUpperCase() === 'CANCELLED') {
    return order.pnl || 0;
  } else {
    const currentPrice = prices[order.symbol] || order.entryPrice;
    const pnl = (currentPrice - order.entryPrice) * order.size * order.leverage * 
                (order.side === 'LONG' ? 1 : -1);
    return pnl;
  }
};

  const calculateSLAmount = (order) => {
    if (!order.stopLoss) return 'N/A';
    const amount = Math.abs(order.entryPrice - order.stopLoss) * order.size * order.leverage;
    return `$${amount.toFixed(2)}`;
  };

  const calculateTPAmount = (order) => {
    if (!order.takeProfit) return 'N/A';
    const amount = Math.abs(order.takeProfit - order.entryPrice) * order.size * order.leverage;
    return `$${amount.toFixed(2)}`;
  };

  const currentSymbolPositions = positions.filter(pos => pos.symbol === selectedSymbol);

  const filteredCryptoData = cryptoData.filter(crypto => 
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = payments.filter(payment => {
    if (paymentFilter === 'all') return true;
    if (paymentFilter === 'pending') return payment.status === 'pending';
    if (paymentFilter === 'completed') return payment.status === 'completed' || payment.status === 'approved';
    if (paymentFilter === 'rejected') return payment.status === 'rejected';
    return true;
  });

  const stats = calculateStats();

  const canTrade =
    isLoggedIn &&
    userAccount?.paperBalance > 0 &&
    userAccount?.challengeStats?.status === 'active';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showPaymentDetail = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  // ========== FETCH REFERRAL INFO WHEN PROFILE ACTIVE ==========
  useEffect(() => {
    if (isLoggedIn && activeDashboard === 'Profile') {
      fetchReferralInfo();
    }
  }, [isLoggedIn, activeDashboard]);

  const QuickTradeComponent = () => {
    const currentPrice = prices[selectedSymbol] || 
      cryptoData.find(c => c.symbol === selectedSymbol)?.price || 91391.5;
    const minLot = getMinLotSize(prices[selectedSymbol]);

    const totalPaperUSD = userAccount.paperBalance / dollarRate;

    const totalMarginUsedUSD = positions.reduce((sum, pos) => {
      const posValue = pos.entryPrice * pos.size;
      return sum + (posValue / pos.leverage);
    }, 0);

    const availableFundsUSD = totalPaperUSD - totalMarginUsedUSD;

    const challenge = userAccount.currentChallenge
      ? CHALLENGES.find(c => c.name === userAccount.currentChallenge)
      : null;

    const maxOrderSizePercent = challenge?.maxOrderSize || 20;
    const maxAllowedMarginUSD = totalPaperUSD * (maxOrderSizePercent / 100);

    const orderValue = currentPrice * orderSize;
    const marginRequired = orderValue / leverage;

    return (
      <div className="quick-trade-top mobile-quick-trade-component">
        <h3>Quick Trade</h3>

        {/* Trade Actions */}
        <div className="trade-actions-top">
          <button 
            className="trade-btn-top buy-btn-top"
            onClick={() => handleTrade('LONG')}
            disabled={!canTrade}
          >
            {canTrade ? 'BUY/LONG' : 'BUY CHALLENGE'}
          </button>
          <button 
            className="trade-btn-top sell-btn-top"
            onClick={() => handleTrade('SHORT')}
            disabled={!canTrade}
          >
            {canTrade ? 'SELL/SHORT' : 'BUY CHALLENGE'}
          </button>
        </div>

        {/* Funds Information - Removed Max Margin display */}
        <div className="funds-info-section">
          <div className="funds-item">
            <span className="funds-label">Available Funds:</span>
            <span className="funds-value available">${availableFundsUSD.toFixed(2)}</span>
          </div>
          <div className="funds-item">
            <span className="funds-label">Margin Required:</span>
            <span className={`funds-value ${marginRequired > maxAllowedMarginUSD + 0.0001 ? 'warning' : ''}`}>
              ${marginRequired.toFixed(2)}
              {marginRequired > maxAllowedMarginUSD + 0.0001 && 
                <span className="warning-text"> (Exceeds {maxOrderSizePercent}% of capital!)</span>}
            </span>
          </div>
        </div>

        {/* Leverage Section */}
        <div className="leverage-section-top">
          <div className="section-label">Leverage (Max: {challenge?.maxLeverage || 10}x)</div>
          <div className="leverage-buttons-top">
            {[1, 5, 10, 20].map(lev => (
              <button
                key={lev}
                className={`leverage-btn-top ${leverage === lev ? 'active' : ''}`}
                onClick={() => setLeverage(lev)}
                disabled={!canTrade}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>

        {/* SL/TP Section - Manual input only */}
{/* Hide stop loss and take profit 
        <div className="sl-tp-section-adjusted" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="sl-section-adjusted" style={{ flex: '1', minWidth: '120px' }}>
            <div className="section-label" style={{ fontSize: '0.8rem' }}>Stop Loss (optional)</div>
<input
  type="number"
  step="0.01"
  value={stopLoss}
  placeholder={prices[selectedSymbol] ? prices[selectedSymbol].toFixed(2) : ''}
  onFocus={() => {
    if (!stopLoss && prices[selectedSymbol]) {
      setStopLoss(prices[selectedSymbol].toFixed(2));
    }
  }}
  onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Enter price"
              className="sl-input-adjusted"
              disabled={!canTrade}
              style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
            />
          </div>
          <div className="tp-section-adjusted" style={{ flex: '1', minWidth: '120px' }}>
            <div className="section-label" style={{ fontSize: '0.8rem' }}>Take Profit (optional)</div>
<input
  type="number"
  step="0.01"
  value={takeProfit}
  placeholder={prices[selectedSymbol] ? prices[selectedSymbol].toFixed(2) : ''}
  onFocus={() => {
    if (!takeProfit && prices[selectedSymbol]) {
      setTakeProfit(prices[selectedSymbol].toFixed(2));
    }
  }}
  onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Enter price"
              className="tp-input-adjusted"
              disabled={!canTrade}
              style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>
*/}
{/* Order Size Section - stable cursor + custom arrows */}
<div className="order-size-section">
  <div className="section-label">
    Order size in lot (Min recommended: {minLot})
  </div>

  <div className="order-size-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    
    {/* Down button */}
    <button
      type="button"
      onClick={() => {
        const current = parseFloat(orderSize || minLot);
        const next = (current - minLot).toFixed(6);
        if (parseFloat(next) >= minLot) {
          setOrderSize(next);
        }
      }}
      disabled={!canTrade}
    >
      ▼
    </button>

    {/* Input */}
    <input
      type="text"
      inputMode="decimal"
      value={orderSize}
      onChange={(e) => {
        const val = e.target.value;
        // allow only numbers and one decimal
        if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
          setOrderSize(val);
        }
      }}
      onBlur={() => {
        if (!orderSize || parseFloat(orderSize) < minLot) {
          setOrderSize(minLot.toString());
        }
      }}
      className="order-size-input"
      disabled={!canTrade}
      style={{ textAlign: 'center' }}
    />

    {/* Up button */}
    <button
      type="button"
      onClick={() => {
        const current = parseFloat(orderSize || minLot);
        const next = (current + minLot).toFixed(6);
        setOrderSize(next);
      }}
      disabled={!canTrade}
    >
      ▲
    </button>
  </div>
</div>


        {/* Challenge Limits */}
        {challenge && (
          <div className="challenge-limits">
            <div className="limit-item">
              <span>Daily Loss:</span>
              <span className={`limit-value ${dailyLoss >= challenge.dailyLossLimit ? 'danger' : ''}`}>
                {dailyLoss.toFixed(2)}% / {challenge.dailyLossLimit}%
              </span>
            </div>
            <div className="limit-item">
              <span>Max Loss:</span>
              <span className={`limit-value ${totalLoss >= challenge.maxLossLimit ? 'danger' : ''}`}>
                {totalLoss.toFixed(2)}% / {challenge.maxLossLimit}%
              </span>
            </div>
            <div className="limit-item">
              <span>Profit Target:</span>
              <span className={`limit-value ${challengeProgress.profit >= challenge.profitTarget ? 'success' : ''}`}>
                {challengeProgress.profit.toFixed(2)}% / {challenge.profitTarget}%
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`advanced-app ${isFullScreen ? 'fullscreen' : ''}`}>
      {!isFullScreen && (
        <>
          <div className="top-horizontal-nav">
            <div className="nav-tabs-container">
              <div className={`nav-tab ${activeDashboard === 'Challenges' ? 'active' : ''}`} onClick={() => setActiveDashboard('Challenges')}>
                <span className="tab-text">CHALLENGES</span>
              </div>

              <div className={`nav-tab ${activeDashboard === 'Market' ? 'active' : ''}`} onClick={() => {
                if (!isLoggedIn) {
                  alert('Please login to view market');
                  setShowLogin(true);
                } else {
                  setActiveDashboard('Market');
                }
              }}>
                <span className="tab-text">MARKET</span>
              </div>

              <div className={`nav-tab ${activeDashboard === 'Trading' ? 'active' : ''}`} onClick={() => {
                if (!isLoggedIn) {
                  alert('Please login to trade');
                  setShowLogin(true);
                } else if (!canTrade) {
                  alert('Please purchase a challenge to start trading');
                  setActiveDashboard('Challenges');
                } else {
                  setActiveDashboard('Trading');
                }
              }}>
                <span className="tab-text">TRADING</span>
              </div>

              <div className={`nav-tab ${activeDashboard === 'Profile' ? 'active' : ''}`} onClick={() => {
                if (!isLoggedIn) {
                  alert('Please login to view profile');
                  setShowLogin(true);
                } else {
                  setActiveDashboard('Profile');
                }
              }}>
                <span className="tab-text">PROFILE</span>
              </div>

              {userAccount.role === 'admin' && (
                <div className={`nav-tab ${activeDashboard === 'AdminPanel' ? 'active' : ''}`} onClick={() => {
                  if (!isLoggedIn) {
                    alert('Please login as admin');
                    setShowLogin(true);
                  } else if (userAccount.role !== 'admin') {
                    alert('Admin access only');
                  } else {
                    setActiveDashboard('AdminPanel');
                  }
                }}>
                  <span className="tab-text">ADMIN</span>
                </div>
              )}

              <div className="nav-user-info-container">
                {isLoggedIn ? (
                  <>
                    <div className="nav-user-info">
                      <span className="nav-user-name">👤 {userAccount.name || 'User'}</span>
                      <div className="nav-user-balance">
                        <span className="nav-balance-amount">₹{userAccount.paperBalance?.toLocaleString() || '0'}</span>
                        <span className="nav-balance-dollar">
                          (${calculateDollarBalance(userAccount.paperBalance || 0)})
                        </span>
                 {/* Refresh button added here */}
        <button 
          className="refresh-balance-btn" 
          onClick={syncUserWallet} 
          title="Refresh balance"
        >
          🔄
        </button>
                      </div>
                      {userAccount.currentChallenge && (
                        <div className="nav-challenge-status">
                          <span className={`challenge-badge ${userAccount.challengeStats.status}`}>
                            {userAccount.currentChallenge.split(' ')[0]} - {userAccount.challengeStats.status.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <button className="nav-logout-btn" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="nav-auth-buttons">
                    <button className="nav-auth-btn" onClick={() => setShowLogin(true)}>Login</button>
                    <button className="nav-auth-btn register-btn" onClick={() => {
                      setPendingChallengePurchase(false);
                      setShowRegister(true);
                    }}>
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <header className="advanced-header">
            <div className="connection-info">
              <span className="api-status">Connection to API</span>
              <div className="mode-toggle">
                <button 
                  className={`mode-btn ${mode === 'DEMO' ? 'active' : ''}`}
                  onClick={() => setMode('DEMO')}
                >
                  DEMO MODE
                </button>
                <span className="separator">|</span>
                <button 
                  className={`mode-btn ${mode === 'LIVE' ? 'active' : ''}`}
                  onClick={() => setMode('LIVE')}
                >
                  LIVE
                </button>
              </div>
            </div>

            <div className="symbol-info">
              <h2 className="symbol-name">{selectedSymbol.replace('USDT', 'USD')}</h2>
              <div className="indicators-info-below-price">
                <span>Indicator ({activeIndicators.length})</span>
                <div className="indicators-list">
                  {activeIndicators.slice(0, 3).map(ind => (
                    <span key={ind} className="indicator-tag">{ind}</span>
                  ))}
                  {activeIndicators.length > 3 && (
                    <span className="indicator-tag">+{activeIndicators.length - 3}</span>
                  )}
                </div>
              </div>
            </div>
                      
            <div className="news-indicator-below-alert">
              <button 
                className="news-btn"
                onClick={() => setShowNews(!showNews)}
              >
                📰 Market News
                {marketNews.length > 0 && <span className="news-badge">{marketNews.length}</span>}
              </button>
            </div>
          </header>

          {activeDashboard === 'Trading' && (
            <div className="below-price-alert-section">
              <div className="total-balance-section">
                <div className="balance-header">
                  <h3>Total Balance</h3>
                  <span className={`pnl-badge ${totalPnl >= 0 ? 'positive' : 'negative'}`}>
                    {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
                  </span>
                </div>
                <div className="balance-display">
                  ${equity.toFixed(2)}
                </div>
                <div className="balance-details">
                  <div>Available: ${balance.toFixed(2)}</div>
                  <div>Used: ${(equity - balance).toFixed(2)}</div>
                </div>
              </div>
              
              {/* Challenge Progress Bar */}
              {userAccount.currentChallenge && (
                <div className="challenge-progress-bar">
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill profit"
                        style={{ width: `${Math.min(challengeProgress.profit, 100)}%` }}
                      ></div>
                      <div 
                        className="progress-fill loss"
                        style={{ width: `${Math.min(challengeProgress.totalLoss, 100)}%` }}
                      ></div>
                    </div>
                    <div className="progress-labels">
                      <span>Profit: {challengeProgress.profit.toFixed(1)}%</span>
                      <span>Loss: {challengeProgress.totalLoss.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="advanced-main">
        {!isFullScreen && activeDashboard === 'Trading' && (
          <div className="left-panel desktop-only">
            <div className="order-book-section">
              <div className="order-book-header">
                <h3>Order Book</h3>
                <button 
                  className="toggle-order-book"
                  onClick={() => setShowOrderBook(!showOrderBook)}
                >
                  {showOrderBook ? '▲' : '▼'}
                </button>
              </div>
              
              {showOrderBook && (
                <>
                  <div className="order-book-list">
                    <div className="order-book-asks">
                      <div className="order-book-header-row">
                        <span>Price</span>
                        <span>Amount</span>
                        <span>Total</span>
                      </div>
                      {orderBookData.asks.map((ask, index) => (
                        <div key={index} className="order-book-row ask-row">
                          <span className="ask-price">${ask.price.toFixed(2)}</span>
                          <span>{ask.amount}</span>
                          <span>${ask.total}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-book-spread">
                      <span className="spread-label">Spread</span>
                      <span className="spread-value">${(orderBookData.asks[0].price - orderBookData.bids[0].price).toFixed(2)}</span>
                    </div>
                    
                    <div className="order-book-bids">
                      {orderBookData.bids.map((bid, index) => (
                        <div key={index} className="order-book-row bid-row">
                          <span className="bid-price">${bid.price.toFixed(2)}</span>
                          <span>{bid.amount}</span>
                          <span>${bid.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="trading-tools-section">
              <h3>Trading Tools</h3>
              <div className="tools-grid">
                <button className="tool-btn">Calculator</button>
                <button className="tool-btn">Converter</button>
                <button className="tool-btn">Calendar</button>
                <button className="tool-btn">Economic News</button>
              </div>
            </div>
          </div>
        )}

        <div className={`center-panel ${isFullScreen ? 'fullscreen' : ''} ${activeDashboard === 'Challenges' || activeDashboard === 'Market' || activeDashboard === 'Profile' ? 'full-width' : ''}`}>
          {activeDashboard === 'Challenges' ? (
            <div className="challenges-content">
              {/* Carousel */}
              <div className="challenges-carousel">
                {carouselImages.map((img, index) => (
                  <div
                    key={index}
                    className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${img})` }}
                  ></div>
                ))}
              </div>
              <div className="challenges-hero">
                <h1>🚀 Paper2Real Trading Challenges</h1>
                <p className="challenges-subtitle">Learn Trading without Losing Real Money</p>
                {!isLoggedIn && (
                  <div className="discount-banner">
                    <span>Sign up to start your trading journey</span>
                  </div>
                )}
                {isLoggedIn && !userAccount.currentChallenge && (
                  <div className="no-challenge-banner">
                    <span>⚠️ Purchase a challenge to start trading</span>
                  </div>
                )}
                {isLoggedIn && userAccount.currentChallenge && (
                  <div className="active-challenge-banner">
                    <div className="challenge-status-info">
                      <span className="challenge-name">✅ Active Challenge: {userAccount.currentChallenge}</span>
                      <span className="challenge-paper-balance">Paper Balance: ₹{userAccount.paperBalance?.toLocaleString()} (${calculateDollarBalance(userAccount.paperBalance || 0)})</span>
                      <span className={`challenge-status ${userAccount.challengeStats.status}`}>
                        Status: {userAccount.challengeStats.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="challenges-section">
                <h2>Choose Your Trading Challenge</h2>
                
                <div className="challenges-container">
                  {CHALLENGES.map((challenge, index) => (
                    <div key={index} className="challenge-card" style={{ borderColor: challenge.color }}>
                      <div className="challenge-header" style={{ background: challenge.color }}>
                        <h3>{challenge.icon} {challenge.name}</h3>
                        <div className="challenge-fee">{challenge.fee}</div>
                      </div>
                      
                      <div className="challenge-features">
                        <div className="feature">
                          <span className="feature-label">💵 Fee</span>
                          <span className="feature-value">{challenge.fee}</span>
                        </div>
                        <div className="feature">
                          <span className="feature-label">📊 Paper Balance</span>
                          <span className="feature-value">₹{challenge.paperBalance.toLocaleString()}</span>
                        </div>
                        <div className="feature">
                          <span className="feature-label">🎯 Profit Target</span>
                          <span className="feature-value">{challenge.profitTarget}%</span>
                        </div>
                        <div className="feature">
                          <span className="feature-label">⚠ Daily Loss Limit</span>
                          <span className="feature-value">{challenge.dailyLossLimit}%</span>
                        </div>
                        <div className="feature">
                          <span className="feature-label">🛑 Maximum Loss</span>
                          <span className="feature-value">{challenge.maxLossLimit}%</span>
                        </div>
                        <div className="feature">
                          <span className="feature-label">📈 Max Order Size</span>
                          <span className="feature-value">{challenge.maxOrderSize}% of capital</span>
                        </div>
                        <div className="feature">
                          <span className="feature-label">⚡ Leverage</span>
                          <span className="feature-value">Upto {challenge.maxLeverage}x</span>
                        </div>
                        <div className="feature">
                          <span className="feature-label">🎯 Auto SL & Target</span>
                          <span className="feature-value">{challenge.autoStopLossTarget}% of order value</span>
                        </div>
                        <div className="feature">
                          <span className="feature-label">🔄 Trades at a Time</span>
                          <span className="feature-value">{challenge.oneTradeAtTime ? '1' : 'Multiple'}</span>
                        </div>
                        <div className="feature highlight">
                          <span className="feature-label">💰 Reward</span>
                          <span className="feature-value highlight-value">{challenge.reward}</span>
                        </div>
                      </div>
                      
                      <div className="challenge-description">
                        <p>{challenge.description}</p>
                      </div>
                      
                      <button 
                        className="get-challenge-btn"
                        style={{ background: challenge.color }}
                        onClick={() => handleChallengeBuy(challenge)}
                      >
                        {isLoggedIn ? 'Buy Now' : 'Sign Up & Buy'} - {challenge.fee}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cta-section">
                <p className="cta-text">
                  {isLoggedIn && userAccount.currentChallenge 
                    ? 'Start trading with your paper balance now!' 
                    : 'Practice with virtual money: Earn real cash rewards'}
                </p>
                <button 
                  className="cta-btn"
                  onClick={() => {
                    if (!isLoggedIn) {
                      setShowLogin(true);
                    } else if (!canTrade) {
                      alert('Please purchase a challenge to start trading');
                    } else {
                      setActiveDashboard('Market');
                    }
                  }}
                >
                  {isLoggedIn && canTrade ? 'Start Trading Now' : 'Get Started'}
                </button>
              </div>

              <div className="features-section">
                <h3>Why Choose Paper2Real Challenges?</h3>
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h4>Risk-Free Trading</h4>
                    <p>Practice with paper money before risking real capital</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">💰</div>
                    <h4>Earn Real Money</h4>
                    <p>Convert your paper profits into real cash rewards</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <h4>Real Market Data</h4>
                    <p>Trade with real-time cryptocurrency market data</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🛡️</div>
                    <h4>Loss Protection</h4>
                    <p>Daily and maximum loss limits to protect your capital</p>
                  </div>
                </div>
              </div>
              
              {/* Additional Info Section */}
              <div className="additional-info-section">
                <h3>📋 Additional Information</h3>
                <div className="info-grid">
                  <div className="info-card">
                    <h4>📈 Paper Trading Only</h4>
                    <p>All trades are executed with virtual money. No real funds are at risk during the challenge.</p>
                  </div>
                  <div className="info-card">
                    <h4>💰 Fee Refund + 20% Profit</h4>
                    <p>Successfully complete the challenge and get your fee refunded plus 20% of your paper profits as real money reward.</p>
                  </div>
                  <div className="info-card">
                    <h4>⚡ Auto Stop-Loss & Target</h4>
                    <p>Each trade automatically gets stop-loss and take-profit set at 10% of order value to manage risk.</p>
                  </div>
                  <div className="info-card">
                    <h4>🔄 One Trade at a Time</h4>
                    <p>Focus on quality over quantity. Only one open position is allowed at any time during the challenge.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeDashboard === 'Market' ? (
            <div className="market-content">
              <div className="market-header">
                <h2>Cryptocurrency Market</h2>
                <div className="market-search">
                  <input 
                    type="text"
                    placeholder="Search cryptocurrencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="market-search-input"
                  />
                  <div className="market-filters">
                    <button className="market-filter-btn active">All</button>
                    <button className="market-filter-btn">Gainers</button>
                    <button className="market-filter-btn">Losers</button>
                    <button className="market-filter-btn">Volume</button>
                  </div>
                </div>
              </div>

              <div className="market-table-container">
                <table className="market-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>24h Change</th>
                      <th>24h Volume</th>
                      <th>Market Cap</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCryptoData.map((crypto, index) => (
                      <tr key={crypto.symbol} className="market-row">
                        <td>
                          <button 
                            className="watchlist-btn"
                            onClick={() => toggleWatchlist(crypto.symbol)}
                          >
                            {watchlist.includes(crypto.symbol) ? '★' : '☆'}
                          </button>
                        </td>
                        <td>
                          <div className="crypto-info">
                            <div className="crypto-icon" style={{ backgroundColor: crypto.color }}></div>
                            <div className="crypto-name">
                              <div className="crypto-symbol">{crypto.symbol.replace('USDT', '')}</div>
                              <div className="crypto-fullname">{crypto.name}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="crypto-price">
                            ${prices[crypto.symbol] ? prices[crypto.symbol].toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : crypto.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </div>
                        </td>
                        <td>
                          <div className={`crypto-change ${crypto.change24h >= 0 ? 'positive' : 'negative'}`}>
                            {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h}%
                          </div>
                        </td>
                        <td>
                          <div className="crypto-volume">{crypto.volume}</div>
                        </td>
                        <td>
                          <div className="crypto-marketcap">{crypto.marketCap}</div>
                        </td>
                        <td>
                          <button 
                            className="trade-action-btn"
                            onClick={() => handleMarketTrade(crypto.symbol)}
                            disabled={!canTrade}
                          >
                            {canTrade ? 'Trade' : 'Buy Challenge to Trade'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="trading-signals-panel">
                <div className="signals-header">
                  <h3>Trading Signals</h3>
                  <button className="refresh-signals" onClick={() => {
                    const newSignals = signals.map(s => ({
                      ...s,
                      confidence: (Math.random() * 100).toFixed(1)
                    }));
                    setSignals(newSignals);
                  }}>
                    🔄
                  </button>
                </div>
                <div className="signals-list">
                  {signals.slice(0, 6).map((signal, index) => (
                    <div key={index} className={`signal-item ${signal.signal.toLowerCase().replace(' ', '-')}`}>
                      <div className="signal-symbol">{signal.symbol.replace('USDT', '')}</div>
                      <div className="signal-info">
                        <span className="signal-type">{signal.signal}</span>
                        <span className="signal-confidence">{signal.confidence}%</span>
                      </div>
                      <div className="signal-price">
                        ${signal.price.toFixed(2)}
                        <span className={`signal-change ${parseFloat(signal.change) >= 0 ? 'positive' : 'negative'}`}>
                          {parseFloat(signal.change) >= 0 ? '+' : ''}{signal.change}%
                        </span>
                      </div>
                      <button 
                        className="signal-action-btn"
                        onClick={() => handleMarketTrade(signal.symbol)}
                        disabled={!canTrade}
                      >
                        {canTrade ? 'Trade' : 'Buy Challenge'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="market-watchlist">
                <h3>Your Watchlist</h3>
                <div className="watchlist-items">
                  {cryptoData
                    .filter(crypto => watchlist.includes(crypto.symbol))
                    .map(crypto => (
                      <div key={crypto.symbol} className="watchlist-item">
                        <div className="watchlist-crypto">
                          <div className="watchlist-icon" style={{ backgroundColor: crypto.color }}></div>
                          <div className="watchlist-info">
                            <div className="watchlist-symbol">{crypto.symbol.replace('USDT', '')}</div>
                            <div className="watchlist-price">${prices[crypto.symbol] ? prices[crypto.symbol].toFixed(2) : crypto.price.toFixed(2)}</div>
                          </div>
                          <div className={`watchlist-change ${crypto.change24h >= 0 ? 'positive' : 'negative'}`}>
                            {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h}%
                          </div>
                        </div>
                        <button 
                          className="watchlist-trade-btn"
                          onClick={() => handleMarketTrade(crypto.symbol)}
                          disabled={!canTrade}
                        >
                          {canTrade ? '→' : '⚠️'}
                        </button>
                      </div>
                    ))}
                  {watchlist.length === 0 && (
                    <div className="no-watchlist">Add cryptocurrencies to your watchlist</div>
                  )}
                </div>
              </div>
            </div>
            
          ) : activeDashboard === 'Profile' ? (
            <div className="profile-content">
              <div className="profile-header">
                <h2>Your Profile</h2>
                <div className="profile-status">
                  <span className="profile-badge">{isLoggedIn ? 'ACTIVE ACCOUNT' : 'DEMO ACCOUNT'}</span>
                  <span className="profile-tier">{userAccount.currentChallenge || 'NO CHALLENGE'}</span>
                </div>
              </div>

              <div className="profile-grid">
                <div className="profile-card main-card">
                  <div className="profile-avatar">
                    <div className="avatar-circle">
                      {userAccount.name?.charAt(0) || 'U'}
                    </div>
                    <div className="profile-info">
                      <h3>{isLoggedIn ? userAccount.name : 'Guest User'}</h3>
                      <p>Status: {isLoggedIn ? (userAccount.currentChallenge ? 'Challenge Member' : 'Free Account') : 'Not Logged In'}</p>
                      <p>Email: {isLoggedIn ? userAccount.email : 'guest@example.com'}</p>
                      <p>User ID: {userAccount.id || 'Not Available'}</p>
                    </div>
                  </div>
                  <div className="profile-stats">
                    <div className="profile-stat">
                      <span className="stat-label">Account Level</span>
                      <span className="stat-value">{userAccount.currentChallenge ? 'Premium' : 'Basic'}</span>
                    </div>
                    <div className="profile-stat">
                      <span className="stat-label">Trading Days</span>
                      <span className="stat-value">{orderHistory.length > 0 ? Math.ceil(orderHistory.length / 5) : 0}</span>
                    </div>
                    <div className="profile-stat">
                      <span className="stat-label">Total Trades</span>
                      <span className="stat-value">{stats.total}</span>
                    </div>
                    <div className="profile-stat">
                      <span className="stat-label">Win Rate</span>
                      <span className="stat-value">{stats.winRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="profile-card performance-card">
                  <h3>Trading Performance</h3>
                  <div className="performance-stats">
                    <div className="performance-stat">
                      <span className="performance-label">Paper Balance</span>
                      <span className="performance-value">₹{userAccount.paperBalance?.toLocaleString() || '0'} (${calculateDollarBalance(userAccount.paperBalance || 0)})</span>
                    </div>
                    <div className="performance-stat">
                      <span className="performance-label">Total Profit</span>
                      <span className="performance-value positive">+${orderHistory.filter(o => o.pnl > 0).reduce((sum, o) => sum + o.pnl, 0).toFixed(2)}</span>
                    </div>
                    <div className="performance-stat">
                      <span className="performance-label">Total Loss</span>
                      <span className="performance-value negative">-${Math.abs(orderHistory.filter(o => o.pnl < 0).reduce((sum, o) => sum + o.pnl, 0)).toFixed(2)}</span>
                    </div>
                    <div className="performance-stat">
                      <span className="performance-label">Profit Factor</span>
                      <span className="performance-value">{stats.profitFactor.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-card settings-card">
                  <h3>Account Settings</h3>
                  <div className="settings-list">
                    <div className="setting-item">
                      <span className="setting-label">Current Challenge</span>
                      <span className="setting-value">{userAccount.currentChallenge || 'None'}</span>
                    </div>
                    <div className="setting-item">
                      <span className="setting-label">Challenge Status</span>
                      <span className={`setting-value challenge-status-${userAccount.challengeStats?.status || 'N/A'}`}>
                        {userAccount.challengeStats?.status || 'N/A'.toUpperCase()}
                      </span>
                    </div>
                    <div className="setting-item">
                      <span className="setting-label">Paper Balance</span>
                      <span className="setting-value">₹{userAccount.paperBalance?.toLocaleString() || '0'} (${calculateDollarBalance(userAccount.paperBalance || 0)})</span>
                    </div>
                    <div className="setting-item">
                      <span className="setting-label">Real Balance</span>
                      <span className="setting-value">₹{userAccount.realBalance?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="setting-item">
                      <span className="setting-label">Account Status</span>
                      <span className="setting-value">{userAccount.accountStatus || 'pending'}</span>
                    </div>
                  </div>
                  <div className="settings-buttons">
                    {!userAccount.currentChallenge && (
                      <button className="settings-btn upgrade-btn" onClick={() => setActiveDashboard('Challenges')}>
                        Buy Trading Challenge
                      </button>
                    )}
                    {userAccount.currentChallenge && userAccount?.challengeStats?.status === 'active' && (
                      <button className="settings-btn trade-btn" onClick={() => setActiveDashboard('Trading')}>
                        Start Trading
                      </button>
                    )}
                  </div>
                </div>

                <div className="profile-card activity-card">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    {orderHistory.slice(0, 5).map(order => {
                      const currentPnl = calculateOrderPnL(order);
                      return (
                        <div key={order.id} className="activity-item">
                          <div className="activity-info">
                            <span className={`activity-side ${order.side?.toLowerCase()}`}>{order.side}</span>
                            <span className="activity-symbol">{order.symbol}</span>
                          </div>
                          <div className="activity-details">
                            <span className="activity-time">{order.timestamp}</span>
                            <span className={`activity-pnl ${currentPnl >= 0 ? 'positive' : 'negative'}`}>
                              {currentPnl ? (currentPnl >= 0 ? '+' : '') + currentPnl.toFixed(2) : '0.00'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {orderHistory.length === 0 && (
                      <div className="no-activity">No trading activity yet</div>
                    )}
                  </div>
                </div>
                
                {/* Challenge Progress Card */}
                {userAccount.currentChallenge && (
                  <div className="profile-card challenge-card">
                    <h3>Challenge Progress</h3>
                    <div className="challenge-progress-details">
                      <div className="challenge-progress-item">
                        <span className="progress-label">Challenge:</span>
                        <span className="progress-value">{userAccount.currentChallenge}</span>
                      </div>
                      <div className="challenge-progress-item">
                        <span className="progress-label">Status:</span>
                        <span className={`progress-value challenge-status-${userAccount.challengeStats.status}`}>
                          {userAccount.challengeStats.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="challenge-progress-item">
                        <span className="progress-label">Profit Target:</span>
                        <span className="progress-value">
                          {challengeProgress.profit.toFixed(2)}% / 
                          {CHALLENGES.find(c => c.name === userAccount.currentChallenge)?.profitTarget || 10}%
                        </span>
                      </div>
                      <div className="challenge-progress-item">
                        <span className="progress-label">Daily Loss:</span>
                        <span className={`progress-value ${dailyLoss >= (CHALLENGES.find(c => c.name === userAccount.currentChallenge)?.dailyLossLimit || 4) ? 'danger' : ''}`}>
                          {dailyLoss.toFixed(2)}% / 
                          {CHALLENGES.find(c => c.name === userAccount.currentChallenge)?.dailyLossLimit || 4}%
                        </span>
                      </div>
                      <div className="challenge-progress-item">
                        <span className="progress-label">Total Loss:</span>
                        <span className={`progress-value ${totalLoss >= (CHALLENGES.find(c => c.name === userAccount.currentChallenge)?.maxLossLimit || 10) ? 'danger' : ''}`}>
                          {totalLoss.toFixed(2)}% / 
                          {CHALLENGES.find(c => c.name === userAccount.currentChallenge)?.maxLossLimit || 10}%
                        </span>
                      </div>
                      <div className="challenge-progress-item">
                        <span className="progress-label">Trades Count:</span>
                        <span className="progress-value">{userAccount.challengeStats.tradesCount}</span>
                      </div>
                      <div className="challenge-progress-item">
                        <span className="progress-label">Win Rate:</span>
                        <span className="progress-value">{userAccount.challengeStats.winRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="challenge-progress-visual">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill profit"
                          style={{ width: `${Math.min(challengeProgress.profit, 100)}%` }}
                          title={`Profit: ${challengeProgress.profit.toFixed(1)}%`}
                        ></div>
                        <div 
                          className="progress-fill loss"
                          style={{ width: `${Math.min(challengeProgress.totalLoss, 100)}%` }}
                          title={`Loss: ${challengeProgress.totalLoss.toFixed(1)}%`}
                        ></div>
                      </div>
                      <div className="progress-labels">
                        <span className="profit-label">Profit: {challengeProgress.profit.toFixed(1)}%</span>
                        <span className="loss-label">Loss: {challengeProgress.totalLoss.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========== REFERRAL CARD ========== */}
                {referralInfo && (
                  <div className="profile-card referral-card" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                    <h3 style={{ color: 'white', marginBottom: '1rem' }}>👥 Referral Program</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Your unique referral link:</p>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#2d3748', padding: '10px', borderRadius: '8px' }}>
                          <code style={{ flex: 1, color: '#e2e8f0', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                           {`${window.location.origin}/?ref=${referralInfo.referralCode}`}
                          </code>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/?ref=${referralInfo.referralCode}`);
                              alert('Referral link copied!');
                            }}
                            style={{ padding: '6px 12px', background: '#4f46e5', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ background: 'rgba(30,41,59,0.5)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Your Referrals</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{referralInfo.referralCount}</div>
                        </div>
                        <div style={{ background: 'rgba(30,41,59,0.5)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Target</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{referralSettings.target}</div>
                        </div>
                        <div style={{ background: 'rgba(30,41,59,0.5)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Reward</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>{referralSettings.rewardName}</div>
                        </div>
                      </div>

                      {referralInfo.referralCount >= referralSettings.target ? (
                        referralInfo.rewardAwarded ? (
                          <div style={{ background: '#10b981', color: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                            ✅ You have already received your reward: {referralSettings.rewardName}
                          </div>
                        ) : (
                          <div style={{ background: '#f59e0b', color: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                            ⏳ Congratulations! You've reached the target. Your reward is pending admin approval.
                          </div>
                        )
                      ) : (
                        <p style={{ color: '#94a3b8' }}>
                          {referralSettings.target - referralInfo.referralCount} more referrals needed to get a free {referralSettings.rewardName}!
                        </p>
                      )}

                      {referralInfo.referredUsers?.length > 0 && (
                        <details style={{ marginTop: '0.5rem' }}>
                          <summary style={{ cursor: 'pointer', color: '#94a3b8' }}>View your referred users</summary>
                          <ul style={{ marginTop: '0.5rem', listStyle: 'none', padding: 0 }}>
                            {referralInfo.referredUsers.map((u, idx) => (
                              <li key={idx} style={{ padding: '5px 0', borderBottom: '1px solid #334155' }}>
                                {u.name} ({u.email}) – joined {new Date(u.joinedAt).toLocaleDateString()}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="profile-card withdraw-card">
                  <h2 style={{color: 'white', marginBottom: '20px'}}>💰 Withdrawal Management</h2>
                  
                  <div className="withdrawal-options-grid">
                    <div className="withdrawal-card" onClick={() => {
                      setShowAccountSetup(true);
                      setShowWithdrawalRequest(false);
                    }}>
                      <div className="card-icon">🏦</div>
                      <h3>Bank Account Setup</h3>
                      <p>Add your bank details for withdrawals</p>
                    </div>
                    
                    <div className="withdrawal-card" onClick={() => {
                      if (!userBankAccount.accountNumber) {
                        alert('Please set up your bank account first');
                        setShowAccountSetup(true);
                      } else {
                        setShowWithdrawalRequest(true);
                        setShowAccountSetup(false);
                      }
                    }}>
                      <div className="card-icon">💰</div>
                      <h3>Request Withdrawal</h3>
                      <p>Withdraw your real balance</p>
                    </div>
                    
                    <div className="withdrawal-card" onClick={() => {
                      alert('Withdrawal history will be shown here');
                    }}>
                      <div className="card-icon">📜</div>
                      <h3>Withdrawal History</h3>
                      <p>View past withdrawal requests</p>
                    </div>
                  </div>
                  
                  {showAccountSetup && (
                    <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
                      <div className="modal-content" style={{background: '#1e293b', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '500px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                          <h3 style={{color: 'white'}}>Bank Account Setup</h3>
                          <button onClick={() => setShowAccountSetup(false)} style={{background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer'}}>×</button>
                        </div>
                        
                        <div style={{marginBottom: '20px'}}>
                          <label style={{display: 'block', color: '#a0aec0', marginBottom: '5px'}}>Account Holder Name</label>
                          <input
                            type="text"
                            value={userBankAccount.accountHolderName}
                            onChange={(e) => setUserBankAccount({...userBankAccount, accountHolderName: e.target.value})}
                            placeholder="Enter name as per bank records"
                            style={{
                              width: '100%',
                              padding: '10px',
                              background: '#2d3748',
                              border: '1px solid #4a5568',
                              borderRadius: '5px',
                              color: 'white'
                            }}
                          />
                        </div>
                        
                        <div style={{marginBottom: '20px'}}>
                          <label style={{display: 'block', color: '#a0aec0', marginBottom: '5px'}}>Account Number</label>
                          <input
                            type="text"
                            value={userBankAccount.accountNumber}
                            onChange={(e) => setUserBankAccount({...userBankAccount, accountNumber: e.target.value})}
                            placeholder="Enter your bank account number"
                            style={{width: '100%', padding: '10px', background: '#2d3748', border: '1px solid #4a5568', borderRadius: '5px', color: 'white'}}
                          />
                        </div>
                        
                        <div style={{marginBottom: '20px'}}>
                          <label style={{display: 'block', color: '#a0aec0', marginBottom: '5px'}}>Bank Name</label>
                          <select
                            value={userBankAccount.bankName}
                            onChange={(e) => setUserBankAccount({...userBankAccount, bankName: e.target.value})}
                            style={{width: '100%', padding: '10px', background: '#2d3748', border: '1px solid #4a5568', borderRadius: '5px', color: 'white'}}
                          >
                            <option value="">Select Bank</option>
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="SBI">State Bank of India</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        
                        <div style={{marginBottom: '20px'}}>
                          <label style={{display: 'block', color: '#a0aec0', marginBottom: '5px'}}>IFSC Code</label>
                          <input
                            type="text"
                            value={userBankAccount.ifscCode}
                            onChange={(e) => setUserBankAccount({...userBankAccount, ifscCode: e.target.value})}
                            placeholder="Enter IFSC code"
                            style={{width: '100%', padding: '10px', background: '#2d3748', border: '1px solid #4a5568', borderRadius: '5px', color: 'white'}}
                          />
                        </div>
                        
                        <button
                          onClick={() => {
                            if (userBankAccount.accountNumber && userBankAccount.bankName && userBankAccount.ifscCode) {
                              alert('Bank account saved successfully!');
                              setShowAccountSetup(false);
                            } else {
                              alert('Please fill all required fields');
                            }
                          }}
                          style={{width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
                        >
                          Save Bank Account
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {showWithdrawalRequest && (
                    <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
                      <div className="modal-content" style={{background: '#1e293b', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '500px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                          <h3 style={{color: 'white'}}>Request Withdrawal</h3>
                          <button onClick={() => setShowWithdrawalRequest(false)} style={{background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer'}}>×</button>
                        </div>
                        
                        <div style={{marginBottom: '20px', background: '#2d3748', padding: '15px', borderRadius: '5px'}}>
                          <p style={{color: '#a0aec0', marginBottom: '5px'}}>Available Balance:</p>
                          <h3 style={{color: 'white'}}>₹{userAccount.realBalance?.toLocaleString() || '0'}</h3>
                        </div>
                        
                        <div style={{marginBottom: '20px'}}>
                          <label style={{display: 'block', color: '#a0aec0', marginBottom: '5px'}}>Amount to Withdraw (₹)</label>
                          <input
                            type="number"
                            value={withdrawalAmount}
                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                            placeholder="Enter amount"
                            style={{width: '100%', padding: '10px', background: '#2d3748', border: '1px solid #4a5568', borderRadius: '5px', color: 'white'}}
                          />
                        </div>
                        
                        <div style={{marginBottom: '20px', background: '#2d3748', padding: '15px', borderRadius: '5px'}}>
                          <h4 style={{color: 'white', marginBottom: '10px'}}>Bank Account Details:</h4>
                          <p style={{color: '#a0aec0', marginBottom: '5px'}}>{userBankAccount.accountHolderName}</p>
                          <p style={{color: '#a0aec0', marginBottom: '5px'}}>{userBankAccount.bankName}</p>
                          <p style={{color: '#a0aec0'}}>Account: XXXX{userBankAccount.accountNumber.slice(-4) || 'XXXX'}</p>
                        </div>
                        
                        <button
                          onClick={() => {
                            const amount = parseFloat(withdrawalAmount);
                            const balance = userAccount.realBalance || 0;
                            
                            if (!amount || amount <= 0) {
                              alert('Please enter a valid amount');
                              return;
                            }
                            
                            if (amount < 100) {
                              alert('Minimum withdrawal amount is ₹100');
                              return;
                            }
                            
                            if (amount > balance) {
                              alert(`Insufficient balance. Maximum you can withdraw is ₹${balance.toLocaleString()}`);
                              return;
                            }
                            
                            const newRequest = {
                              id: `WD${Date.now()}`,
                              amount: amount,
                              status: 'pending',
                              date: new Date().toLocaleString(),
                              bankDetails: userBankAccount
                            };
                            
                            setWithdrawalRequests([newRequest, ...withdrawalRequests]);
                            
                            setUserAccount({
                              ...userAccount,
                              realBalance: balance - amount
                            });
                            
                            alert(`Withdrawal request submitted for ₹${amount.toLocaleString()}! It will be processed by admin within 24-48 hours.`);
                            setWithdrawalAmount('');
                            setShowWithdrawalRequest(false);
                          }}
                          style={{width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
                        >
                          Submit Withdrawal Request
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div style={{marginTop: '40px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px'}}>
                    <h3 style={{color: 'white', marginBottom: '20px'}}>Recent Withdrawal Requests</h3>
                    
                    {withdrawalRequests.length > 0 ? (
                      <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                          <thead>
                            <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                              <th style={{padding: '10px', color: '#a0aec0', textAlign: 'left'}}>ID</th>
                              <th style={{padding: '10px', color: '#a0aec0', textAlign: 'left'}}>Amount</th>
                              <th style={{padding: '10px', color: '#a0aec0', textAlign: 'left'}}>Status</th>
                              <th style={{padding: '10px', color: '#a0aec0', textAlign: 'left'}}>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {withdrawalRequests.slice(0, 5).map(request => (
                              <tr key={request.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                <td style={{padding: '10px', color: 'white'}}>{request.id}</td>
                                <td style={{padding: '10px', color: 'white'}}>₹{request.amount?.toLocaleString()}</td>
                                <td style={{padding: '10px'}}>
                                  <span style={{
                                    padding: '5px 10px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    background: request.status === 'pending' ? '#f59e0b' : 
                                               request.status === 'approved' ? '#10b981' : 
                                               request.status === 'rejected' ? '#ef4444' : '#6b7280',
                                    color: 'white'
                                  }}>
                                    {request.status}
                                  </span>
                                </td>
                                <td style={{padding: '10px', color: '#a0aec0'}}>{request.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{color: '#a0aec0', textAlign: 'center', padding: '20px'}}>No withdrawal requests yet</p>
                    )}
                  </div>
                </div>

                <div className="profile-card" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Payment History</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        className="refresh-payments-btn"
                        onClick={syncPaymentsWithBackend}
                        disabled={loadingPayments}
                      >
                        {loadingPayments ? '🔄 Loading...' : '🔄 Sync with Backend'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="payment-summary-stats">
                    <div className="payment-stat">
                      <span className="payment-stat-label">Total Payments</span>
                      <span className="payment-stat-value">{paymentStats.total}</span>
                    </div>
                    <div className="payment-stat">
                      <span className="payment-stat-label">Pending</span>
                      <span className="payment-stat-value status-pending">{paymentStats.pending}</span>
                    </div>
                    <div className="payment-stat">
                      <span className="payment-stat-label">Approved</span>
                      <span className="payment-stat-value status-approved">{paymentStats.completed}</span>
                    </div>
                    <div className="payment-stat">
                      <span className="payment-stat-label">Total Amount</span>
                      <span className="payment-stat-value">₹{paymentStats.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="payment-filter-buttons">
                    <button 
                      className={`payment-filter-btn ${paymentFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setPaymentFilter('all')}
                    >
                      All Payments
                    </button>
                    <button 
                      className={`payment-filter-btn ${paymentFilter === 'pending' ? 'active' : ''}`}
                      onClick={() => setPaymentFilter('pending')}
                    >
                      Pending ({paymentStats.pending})
                    </button>
                    <button 
                      className={`payment-filter-btn ${paymentFilter === 'completed' ? 'active' : ''}`}
                      onClick={() => setPaymentFilter('completed')}
                    >
                      Approved ({paymentStats.completed})
                    </button>
                    <button 
                      className={`payment-filter-btn ${paymentFilter === 'rejected' ? 'active' : ''}`}
                      onClick={() => setPaymentFilter('rejected')}
                    >
                      Rejected ({paymentStats.rejected})
                    </button>
                  </div>
                  
                  <div className="payment-tracking-steps">
                    <div className="payment-tracking-step completed">
                      <div className="payment-step-icon">1</div>
                      <span className="payment-step-text">Payment Initiated</span>
                    </div>
                    <div className="payment-tracking-step completed">
                      <div className="payment-step-icon">2</div>
                      <span className="payment-step-text">Receipt Uploaded</span>
                    </div>
                    <div className={`payment-tracking-step ${payments.some(p => p.status === 'pending') ? 'active' : 'completed'}`}>
                      <div className="payment-step-icon">3</div>
                      <span className="payment-step-text">Admin Review</span>
                    </div>
                    <div className={`payment-tracking-step ${payments.some(p => p.status === 'approved') ? 'active' : ''}`}>
                      <div className="payment-step-icon">4</div>
                      <span className="payment-step-text">Paper Money Added</span>
                    </div>
                  </div>
                  
                  <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                    <table className="payments-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Challenge</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Transaction ID</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.slice(0, 10).map(payment => (
                          <tr key={payment.id}>
                            <td>{formatDate(payment.createdAt || payment.submittedAt)}</td>
                            <td>{payment.challengeName || payment.planName}</td>
                            <td>₹{typeof payment.amount === 'string' ? payment.amount : payment.amount?.toLocaleString() || '0'}</td>
                            <td>
                              <span className={`payment-status-badge ${payment.status}`}>
                                {payment.status}
                              </span>
                            </td>
                            <td>
                              <code style={{ fontSize: '0.75rem' }}>{payment.transactionId}</code>
                            </td>
                            <td>
                              <button 
                                className="payment-action-btn"
                                onClick={() => showPaymentDetail(payment)}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredPayments.length === 0 && (
                      <div className="no-payments" style={{ textAlign: 'center', padding: '2rem' }}>
                        {paymentFilter === 'all' ? 'No payments found' : `No ${paymentFilter} payments found`}
                        {paymentFilter !== 'all' && (
                          <button 
                            className="payment-filter-btn" 
                            onClick={() => setPaymentFilter('all')}
                            style={{ marginTop: '1rem' }}
                          >
                            View All Payments
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="payment-tracking-widget">
                    <h3>Recent Payment Status</h3>
                    <div className="recent-payments-list">
                      {payments.slice(0, 3).map(payment => (
                        <div key={payment.id} className="recent-payment-item">
                          <div className="recent-payment-info">
                            <div className="recent-payment-plan">{payment.challengeName || payment.planName}</div>
                            <div className="recent-payment-date">{formatDate(payment.createdAt || payment.submittedAt)}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span className={`payment-status-badge ${payment.status}`}>
                              {payment.status}
                            </span>
                            <span className="recent-payment-amount">
                              ₹{typeof payment.amount === 'string' ? payment.amount : payment.amount?.toLocaleString() || '0'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {payments.length === 0 && (
                        <div className="no-payments">No payment history yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeDashboard === 'AdminPanel' ? (
            <div className="admin-panel-content">
              <h2 style={{color: 'white', marginBottom: '20px'}}>👑 Admin Withdrawal Panel</h2>
              
              <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px', marginBottom: '20px'}}>
                <h3 style={{color: 'white', marginBottom: '15px'}}>Pending Withdrawal Requests</h3>
                
                {withdrawalRequests.filter(req => req.status === 'pending').length > 0 ? (
                  withdrawalRequests.filter(req => req.status === 'pending').map(request => (
                    <div key={request.id} style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                        <div>
                          <h4 style={{color: 'white', marginBottom: '5px'}}>Request #{request.id}</h4>
                          <p style={{color: '#a0aec0'}}>Amount: ₹{request.amount?.toLocaleString()}</p>
                        </div>
                        <span style={{
                          padding: '5px 10px',
                          background: '#f59e0b',
                          borderRadius: '20px',
                          fontSize: '12px',
                          color: 'white',
                          fontWeight: '600'
                        }}>
                          Pending
                        </span>
                      </div>
                      
                      <div style={{background: '#2d3748', padding: '10px', borderRadius: '5px', marginBottom: '10px'}}>
                        <p style={{color: '#a0aec0', marginBottom: '5px'}}>Bank: {request.bankDetails?.bankName}</p>
                        <p style={{color: '#a0aec0', marginBottom: '5px'}}>Account: {request.bankDetails?.accountHolderName}</p>
                        <p style={{color: '#a0aec0'}}>Submitted: {request.date}</p>
                      </div>
                      
                      <div style={{display: 'flex', gap: '10px'}}>
                        <button
                          onClick={() => {
                            const updatedRequests = withdrawalRequests.map(req => 
                              req.id === request.id ? {...req, status: 'approved'} : req
                            );
                            setWithdrawalRequests(updatedRequests);
                            alert(`Withdrawal #${request.id} approved! Funds released to user.`);
                          }}
                          style={{flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
                        >
                          Approve & Release Funds
                        </button>
                        
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) {
                              const updatedRequests = withdrawalRequests.map(req => 
                                req.id === request.id ? {...req, status: 'rejected', reason: reason} : req
                              );
                              setWithdrawalRequests(updatedRequests);
                              
                              setUserAccount({
                                ...userAccount,
                                realBalance: (userAccount.realBalance || 0) + request.amount
                              });
                              
                              alert(`Withdrawal #${request.id} rejected. Reason: ${reason}`);
                            }
                          }}
                          style={{flex: 1, padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{color: '#a0aec0', textAlign: 'center', padding: '20px'}}>No pending withdrawal requests</p>
                )}
              </div>
              
              <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px'}}>
                <h3 style={{color: 'white', marginBottom: '15px'}}>All Withdrawal Requests</h3>
                
                <div style={{overflowX: 'auto'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                        <th style={{padding: '10px', color: '#a0aec0', textAlign: 'left'}}>ID</th>
                        <th style={{padding: '10px', color: '#a0aec0', textAlign: 'left'}}>Amount</th>
                        <th style={{padding: '10px', color: '#a0aec0', textAlign: 'left'}}>Status</th>
                        <th style={{padding: '10px', color: '#a0aec0', textAlign: 'left'}}>Date</th>
                        <th style={{padding: '10px', color: '#a0aec0', textAlign: 'left'}}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawalRequests.map(request => (
                        <tr key={request.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                          <td style={{padding: '10px', color: 'white'}}>{request.id}</td>
                          <td style={{padding: '10px', color: 'white'}}>₹{request.amount?.toLocaleString()}</td>
                          <td style={{padding: '10px'}}>
                            <span style={{
                              padding: '5px 10px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: request.status === 'pending' ? '#f59e0b' : 
                                         request.status === 'approved' ? '#10b981' : 
                                         request.status === 'rejected' ? '#ef4444' : '#6b7280',
                              color: 'white'
                            }}>
                              {request.status}
                            </span>
                          </td>
                          <td style={{padding: '10px', color: '#a0aec0'}}>{request.date}</td>
                          <td style={{padding: '10px'}}>
                            {request.status === 'pending' && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Approve withdrawal of ₹${request.amount}?`)) {
                                    const updatedRequests = withdrawalRequests.map(req => 
                                      req.id === request.id ? {...req, status: 'approved'} : req
                                    );
                                    setWithdrawalRequests(updatedRequests);
                                  }
                                }}
                                style={{padding: '5px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer'}}
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
          ) : (
            <>
              <div className="chart-header-simplified">
                <div className="chart-controls-left">
                  <div className="symbol-selector">
                    {SYMBOLS.slice(0, 8).map(symbol => (
                      <button
                        key={symbol}
                        className={`symbol-btn ${selectedSymbol === symbol ? 'active' : ''}`}
                        onClick={() => setSelectedSymbol(symbol)}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    className="indicators-btn-shifted"
                    onClick={() => setShowIndicatorsPanel(!showIndicatorsPanel)}
                  >
                    📈 Indicators ({activeIndicators.length})
                  </button>
                  
                  <button 
                    className="theme-toggle-btn"
                    onClick={() => setChartTheme(chartTheme === 'dark' ? 'light' : 'dark')}
                    title={`Switch to ${chartTheme === 'dark' ? 'Light' : 'Dark'} theme`}
                  >
                    {chartTheme === 'dark' ? '☀️' : '🌙'}
                  </button>
                  
                  <button 
                    className="fullscreen-btn"
                    onClick={toggleFullScreen}
                  >
                    {isFullScreen ? '↩ Exit Full' : '⛶ Full'}
                  </button>
                </div>
              </div>

              {showIndicatorsPanel && (
                <div className="indicators-panel">
                  <h4>Technical Indicators</h4>
                  <div className="indicators-presets">
                    <h5>Presets</h5>
                    <div className="preset-buttons">
                      {INDICATOR_PRESETS.map(preset => (
                        <button
                          key={preset.name}
                          className="preset-btn"
                          onClick={() => applyPreset(preset)}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                    
                    <h5>Popular Indicators</h5>
                    <div className="indicators-grid">
                      {['Moving Average', 'EMA', 'RSI', 'MACD', 'Bollinger Bands', 'Volume', 'VWAP', 'Stochastic', 'Ichimoku Cloud', 'Parabolic SAR', 'Average True Range', 'Money Flow Index'].map(indicator => (
                        <div key={indicator} className="indicator-item">
                          <label>
                            <input 
                              type="checkbox"
                              checked={activeIndicators.includes(indicator)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  addIndicator(indicator);
                                } else {
                                  removeIndicator(indicator);
                                }
                              }}
                            />
                            {indicator}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="chart-container tradingview-chart" style={isFullScreen ? { height: 'calc(100vh - 100px)' } : {}}>
                <div id="tradingview-chart-container" style={{ width: '100%', height: '100%' }}>
                  {!widgetScriptLoaded && (
                    <div className="chart-fallback">
                      <div className="fallback-content">
                        <div className="fallback-icon">📊</div>
                        <h3>Loading Professional Chart...</h3>
                        <p>Real-time TradingView chart is loading</p>
                        <div className="fallback-grid">
                          <div className="fallback-candle"></div>
                          <div className="fallback-candle"></div>
                          <div className="fallback-candle"></div>
                          <div className="fallback-candle"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {chartHorizontalLines.length > 0 && (
                  <div className="chart-horizontal-lines-overlay">
                    {chartHorizontalLines.map(line => (
                      <div key={line.id} className="chart-horizontal-line-container">
                        <div 
                          className={`chart-horizontal-line ${line.side === 'LONG' ? 'line-long' : 'line-short'}`}
                          style={{ top: '50%' }}
                        >
                          <div className="line-info-box">
                            <div className="line-header">
                              <span className={`line-side ${line.side === 'LONG' ? 'side-long' : 'side-short'}`}>
                                {line.side}
                              </span>
                              <button 
                                className="close-line-btn"
                                onClick={() => closePositionFromChart(line.id)}
                                title="Close Position"
                              >
                                ×
                              </button>
                            </div>
                            <div className="line-details">
                              <div>Entry: <strong>${line.entryPrice.toFixed(2)}</strong></div>
                              <div>Size: <strong>{line.size}</strong></div>
                              {line.stopLoss > 0 && (
                                <div>SL: <strong>${line.stopLoss.toFixed(2)}</strong> (${line.stopLossAmount.toFixed(2)})</div>
                              )}
                              {line.takeProfit > 0 && (
                                <div>TP: <strong>${line.takeProfit.toFixed(2)}</strong> (${line.takeProfitAmount.toFixed(2)})</div>
                              )}
                              <div>Value: <strong>${line.positionValue.toFixed(2)}</strong></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!showChartLines && activeDashboard === 'Trading' && (
                  <button 
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      zIndex: '100',
                      padding: '0.5rem 1rem',
                      background: 'rgba(26, 31, 46, 0.9)',
                      border: '1px solid #2d3748',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      cursor: 'pointer',
                      backdropFilter: 'blur(5px)'
                    }}
                    onClick={() => setShowChartLines(true)}
                  >
                    Show Position Lines
                  </button>
                )}
              </div>

              {activeDashboard === 'Trading' && window.innerWidth <= 768 && (
                <div className="mobile-quick-trade-container">
                  <QuickTradeComponent />
                </div>
              )}

              {activeDashboard === 'Trading' && (
                <div className={`trading-controls ${isFullScreen ? 'fullscreen-trading-controls' : ''}`}>
                  <div className="advanced-stats">
                    <h3>Order History</h3>
                    <div className="order-history" style={{ maxHeight: isFullScreen ? '200px' : '300px', overflowY: 'auto' }}>
                      <div className="order-history-header enhanced">
                        <span>Side</span>
                        <span>Size</span>
                        <span>Margin</span>
                        <span>Lev</span>
                        <span>Entry</span>
                        <span>SL</span>
                        <span>TP</span>
                        <span>Status</span>
                        <span>PnL</span>
                        <span>Action</span>
                      </div>
                      <div className="order-history-list">
                        {orderHistory.slice(0, isFullScreen ? 5 : 10).map(order => {
                          const currentPnl = calculateOrderPnL(order);
                          const slAmount = calculateSLAmount(order);
                          const tpAmount = calculateTPAmount(order);
                          const isOpenOrder = order.status === 'OPEN';
                          const isCancellable = isOpenOrder;
                          
                          return (
                            <div key={order.id} className={`order-history-item enhanced ${order.side?.toLowerCase()}`}>
                              <span className={`order-side ${order.side?.toLowerCase()}`}>{order.side}</span>
                              <span>{order.size}</span>
                              <span>${order.marginUsed ? order.marginUsed.toFixed(2) : '0.00'}</span>
                              <span>
                                <span className="leverage-badge">{order.leverage}x</span>
                              </span>
                              <span>${order.entryPrice?.toFixed(2)}</span>
                              <span>
                                {isOpenOrder && editingOrderId === order.id ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <input
                                      type="number"
                                      value={editSL}
                                      onChange={(e) => setEditSL(e.target.value)}
                                      placeholder="SL"
                                      style={{ width: '60px', fontSize: '0.7rem' }}
                                    />
                                  </div>
                                ) : (
                                  <div className="sl-info">
                                    <div>${order.stopLoss?.toFixed(2) || 'N/A'}</div>
                                    <div className="sl-amount">{slAmount}</div>
                                    {isOpenOrder && (
                                      <button
                                        className="edit-sltp-btn"
                                        onClick={() => {
                                          setEditingOrderId(order.id);
                                          setEditSL(order.stopLoss?.toString() || '');
                                          setEditTP(order.takeProfit?.toString() || '');
                                        }}
                                        style={{ marginLeft: '5px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                        title="Edit SL/TP"
                                      >
                                        ✎
                                      </button>
                                    )}
                                  </div>
                                )}
                              </span>
                              <span>
                                {isOpenOrder && editingOrderId === order.id ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <input
                                      type="number"
                                      value={editTP}
                                      onChange={(e) => setEditTP(e.target.value)}
                                      placeholder="TP"
                                      style={{ width: '60px', fontSize: '0.7rem' }}
                                    />
                                  </div>
                                ) : (
                                  <div className="tp-info">
                                    <div>${order.takeProfit?.toFixed(2) || 'N/A'}</div>
                                    <div className="tp-amount">{tpAmount}</div>
                                  </div>
                                )}
                              </span>
                              {isOpenOrder && editingOrderId === order.id && (
                                <span>
                                  <button onClick={() => updateOrderSLTP(order.id, editSL, editTP)} style={{ fontSize: '0.7rem', padding: '2px 4px', background: '#4f46e5' }}>Save</button>
                                  <button onClick={() => setEditingOrderId(null)} style={{ fontSize: '0.7rem', padding: '2px 4px', background: '#6b7280', marginLeft: '2px' }}>Cancel</button>
                                </span>
                              )}
                              <span>
                                <span className={`order-status ${order.status === 'OPEN' ? 'active-badge' : 'triggered-badge'}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                                  {order.status}
                                </span>
                              </span>
                              <span>
                                <div className="order-pnl-section">
                                  <span className={`order-pnl ${currentPnl >= 0 ? 'positive' : 'negative'}`}>
                                    {currentPnl ? (currentPnl >= 0 ? '+' : '') + currentPnl.toFixed(2) : '0.00'}
                                  </span>
                                </div>
                              </span>
                              <span>
                                <div className="order-actions">
                                  {isCancellable && (
                                    <button 
                                      className="cancel-order-btn"
                                      onClick={() => handleCancelOrder(order.id)}
                                      style={{
                                        marginLeft: '5px',
                                        padding: '0.1rem 0.3rem',
                                        fontSize: '0.7rem',
                                        background: '#dc2626',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                      title="Cancel Order"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                  {order.status === 'OPEN' && !isCancellable && (
                                    <button 
                                      className="close-position-btn"
                                      onClick={() => closePosition(order.id)}
                                      style={{
                                        marginLeft: '5px',
                                        padding: '0.1rem 0.3rem',
                                        fontSize: '0.7rem',
                                        background: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                      title="Close Position"
                                    >
                                      Close
                                    </button>
                                  )}
                                </div>
                              </span>
                            </div>
                          );
                        })}
                        {orderHistory.length === 0 && (
                          <div className="no-orders">No orders yet</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="positions-panel" style={{ maxHeight: isFullScreen ? '150px' : '200px', overflowY: 'auto' }}>
                    <h3>Active Positions ({positions.length})</h3>
                    <div className="positions-list">
                      {positions.slice(0, isFullScreen ? 2 : 3).map(pos => {
                        const currentPrice = prices[pos.symbol] || pos.entryPrice;
                        const positionPnl = (currentPrice - pos.entryPrice) * pos.size * pos.leverage * 
                                            (pos.side === 'LONG' ? 1 : -1);
                        return (
                          <div key={pos.id} className="position-item">
                            <div className="position-header">
                              <span className={`position-side ${pos.side.toLowerCase()}`}>{pos.side}</span>
                              <span className="position-symbol">{pos.symbol}</span>
                              <span className={`position-pnl ${positionPnl >= 0 ? 'positive' : 'negative'}`}>
                                ${positionPnl.toFixed(2)}
                              </span>
                              <button 
                                className="cancel-position-btn"
                                onClick={() => handleCancelOrder(pos.id)}
                                style={{
                                  marginLeft: 'auto',
                                  marginRight: '5px',
                                  padding: '0.1rem 0.3rem',
                                  fontSize: '0.7rem',
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                                title="Cancel Position"
                              >
                                Cancel
                              </button>
                              <button 
                                className="close-position-btn"
                                onClick={() => closePosition(pos.id)}
                                style={{
                                  padding: '0.1rem 0.3rem',
                                  fontSize: '0.7rem',
                                  background: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                                title="Close Position"
                              >
                                Close
                              </button>
                            </div>
                            <div className="position-details">
                              <div>Entry: ${pos.entryPrice.toFixed(2)}</div>
                              <div>Size: ${pos.size}</div>
                              <div>Leverage: {pos.leverage}x</div>
                            </div>
                            <div className="position-controls">
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span className="sl-value">SL: ${pos.stopLoss?.toFixed(2) || 'N/A'}</span>
                                {pos.stopLoss && (
                                  <span className="sl-amount-small">
                                    ${Math.abs(pos.entryPrice - pos.stopLoss) * pos.size * pos.leverage}
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span className="tp-value">TP: ${pos.takeProfit?.toFixed(2) || 'N/A'}</span>
                                {pos.takeProfit && (
                                  <span className="tp-amount-small">
                                    ${Math.abs(pos.takeProfit - pos.entryPrice) * pos.size * pos.leverage}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {positions.length === 0 && (
                        <div className="no-positions">No active positions</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!isFullScreen && activeDashboard === 'Trading' && (
          <div className="right-panel desktop-only">
            <div className="top-right-trading desktop-only">
              <QuickTradeComponent />
            </div>

            <div className="trading-journal">
              <h3>Trading Journal</h3>
              <div className="win-rate-circle">
                <div className="circle-progress" style={{background: `conic-gradient(#3b82f6 0% ${stats.winRate}%, #1e293b ${stats.winRate}% 100%)`}}>
                  <span>{stats.winRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="journal-stats">
                <div className="journal-stat">
                  <span>Win Rate</span>
                  <span>{stats.winRate.toFixed(1)}%</span>
                </div>
                <div className="journal-stat">
                  <span>Profit Factor</span>
                  <span>{stats.profitFactor.toFixed(2)}</span>
                </div>
                <div className="journal-stat">
                  <span>Total Trades</span>
                  <span>{stats.total}</span>
                </div>
                <div className="journal-stat">
                  <span>Win/Loss</span>
                  <span>{stats.win}/{stats.loss}</span>
                </div>
              </div>
            </div>

            <div className="alerts-panel">
              <div className="alerts-header">
                <h3>Price Alerts ({alerts.filter(a => !a.triggered).length})</h3>
                <button className="add-alert-btn" onClick={() => setShowAlertDialog(true)}>
                  + Add Alert
                </button>
              </div>
              <div className="alerts-list">
                {alerts.slice(0, 3).map(alert => (
                  <div key={alert.id} className={`alert-item ${alert.triggered ? 'triggered' : ''}`}>
                    <div className="alert-info">
                      <span className="alert-symbol">{alert.symbol}</span>
                      <span className="alert-condition">
                        {alert.type} {alert.condition} ${alert.value}
                      </span>
                    </div>
                    <div className="alert-status">
                      {alert.triggered ? (
                        <span className="triggered-badge">Triggered</span>
                      ) : (
                        <span className="active-badge">Active</span>
                      )}
                      <button className="remove-alert-btn" onClick={() => removeAlert(alert.id)}>
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="no-alerts">No alerts set</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals and Dialogs */}
      {showNews && (
        <div className="news-panel">
          <div className="news-header">
            <h3>Market News</h3>
            <button className="close-news" onClick={() => setShowNews(false)}>×</button>
          </div>
          <div className="news-list">
            {marketNews.map(news => (
              <div key={news.id} className="news-item">
                <div className="news-impact">
                  <span className={`impact-badge ${news.impact.toLowerCase()}`}>{news.impact}</span>
                </div>
                <div className="news-content">
                  <h4>{news.title}</h4>
                  <div className="news-meta">
                    <span className="news-source">{news.source}</span>
                    <span className="news-time">{news.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showRegister && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h2 className="dialog-title">
              {pendingChallengePurchase ? 'Register & Buy Challenge' : 'Create Account'}
            </h2>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={userData.name}
                  onChange={handleRegisterChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={userData.email}
                  onChange={handleRegisterChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={userData.password}
                  onChange={handleRegisterChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={userData.confirmPassword}
                  onChange={handleRegisterChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="dialog-buttons">
                <button type="submit" className="dialog-btn primary">
                  {pendingChallengePurchase ? 'Register & Continue to Payment' : 'Register'}
                </button>
                <button
                  type="button"
                  className="dialog-btn secondary"
                  onClick={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                  }}
                >
                  Already have account? Login
                </button>
                <button
                  type="button"
                  className="dialog-btn cancel"
                  onClick={() => {
                    setShowRegister(false);
                    setPendingChallengePurchase(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogin && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h2 className="dialog-title">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="dialog-buttons">
                <button type="submit" className="dialog-btn primary">
                  Login
                </button>
                <button
                  type="button"
                  className="dialog-btn secondary"
                  onClick={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                  }}
                >
                  Create New Account
                </button>
                <button
                  type="button"
                  className="dialog-btn cancel"
                  onClick={() => setShowLogin(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAlertDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box alert-dialog">
            <h2 className="dialog-title">Set Price Alert</h2>
            <div className="alert-form">
              <div className="form-group">
                <label>Cryptocurrency</label>
                <select 
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({...newAlert, symbol: e.target.value})}
                  className="form-select"
                >
                  <option value="">Select Symbol</option>
                  {SYMBOLS.map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Alert Type</label>
                <select 
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
                  className="form-select"
                >
                  <option value="Price">Price</option>
                  <option value="Volume">Volume</option>
                  <option value="RSI">RSI</option>
                  <option value="MACD">MACD</option>
                </select>
              </div>
                          
              <div className="form-group">
                <label>Condition</label>
                <select 
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert({...newAlert, condition: e.target.value})}
                  className="form-select"
                >
                  <option value="above">Price Above</option>
                  <option value="below">Price Below</option>
                  <option value="equals">Price Equals</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Value</label>
                <input 
                  type="number"
                  value={newAlert.value}
                  onChange={(e) => setNewAlert({...newAlert, value: e.target.value})}
                  placeholder="Enter price value"
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="dialog-buttons">
              <button className="dialog-btn primary" onClick={addAlert}>
                Set Alert
              </button>
              <button className="dialog-btn cancel" onClick={() => setShowAlertDialog(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI Payment Dialog */}
      {showUPIScanner && (
        <div className="dialog-overlay">
          <div className="dialog-box upi-dialog">
            <h2 className="dialog-title">UPI Payment - {selectedChallenge?.name}</h2>
            
            <div className="payment-instructions">
              <div className="instruction-alert">
                <strong>⚠️ IMPORTANT:</strong><br/>
                1. Make payment using UPI QR code below<br/>
                2. Upload payment receipt/screenshot<br/>
                3. Submit for admin approval<br/>
                Paper money will be added after admin verification.
              </div>
              
              <div className="plan-summary">
                <h4>Challenge Summary:</h4>
                <div className="summary-item">
                  <span>Challenge:</span>
                  <span>{selectedChallenge?.name}</span>
                </div>
                <div className="summary-item">
                  <span>Amount to Pay:</span>
                  <span>{selectedChallenge?.fee}</span>
                </div>
                <div className="summary-item">
                  <span>Paper Money After Approval:</span>
                  <span>₹{selectedChallenge?.paperBalance?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>
            
            <div className="upi-payment-section">
              <div className="qr-code-container">
                <div className="real-upi-qr">
                  <h3>Scan QR Code to Pay</h3>
                  <div className="upi-qr-wrapper">
                    <div className={`upi-qr-code ${upiQrCode ? 'real' : 'placeholder'}`}>
                      {upiQrCode ? (
                        <>
                          <img src={upiQrCode} alt="UPI QR Code" className="real-qr-image" />
                        </>
                      ) : (
                        <div className="qr-placeholder">
                          <div className="qr-grid">
                            {Array.from({ length: 25 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`qr-cell ${Math.random() > 0.5 ? 'filled' : ''}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="upi-details-below-qr">
                    <div className="upi-merchant">
                      <strong>Merchant:</strong> {upiSettings.merchantName}
                    </div>
                    <div className="upi-amount">
                      <strong>Amount:</strong> ₹{upiAmount}
                    </div>
                    <div className="upi-id">
                      <strong>UPI ID:</strong> {upiSettings.upiId}
                    </div>
                  </div>
                  
                  <div className="manual-upi-option">
                    <h4>Send Payment Manually:</h4>
                    <div className="upi-manual-details">
                      <div className="upi-field">
                        <span>UPI ID:</span>
                        <div className="upi-value-container">
                          <code className="upi-value">{upiSettings.upiId}</code>
                          <button 
                            className="copy-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(upiSettings.upiId);
                              alert('UPI ID copied to clipboard!');
                            }}
                          >
                            📋 Copy
                          </button>
                        </div>
                      </div>
                      <div className="upi-field">
                        <span>Amount:</span>
                        <code className="upi-value">₹{upiAmount}</code>
                        <button 
                          className="copy-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(`₹${upiAmount}`);
                            alert('Amount copied to clipboard!');
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                      <div className="upi-field">
                        <span>Note:</span>
                        <code className="upi-value">Paper2Real - {selectedChallenge?.name} - {userAccount.name || userAccount.email || 'User'}</code>
                        <button 
                          className="copy-btn"
                          onClick={() => {
                            const note = `Paper2Real - ${selectedChallenge?.name} - ${userAccount.name || userAccount.email || 'User'}`;
                            navigator.clipboard.writeText(note);
                            alert('Payment note copied!');
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                    <div className="upi-important-note">
                      <strong>📝 Important:</strong> Please include the note when making payment for faster verification
                    </div>
                  </div>
                </div>
              </div>
              <div className="receipt-upload-section">
                <h3>Upload Payment Receipt</h3>
                
                {!receiptUploaded ? (
                  <div className="upload-area">
                    <div className="upload-box" 
                      onClick={() => document.getElementById('receipt-upload').click()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFileDrop(e.dataTransfer.files[0]);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="upload-icon">📁</div>
                      <p>Drag & drop payment screenshot here</p>
                      <p className="upload-subtext">or click to browse</p>
                      <p className="file-types">Supported: JPG, PNG, PDF (Max 5MB)</p>
                    </div>
                    
                    <input
                      id="receipt-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleReceiptUpload}
                      style={{ display: 'none' }}
                    />
                    
                    <div className="upload-requirements">
                      <h4>What to include in screenshot:</h4>
                      <ul>
                        <li>✓ UPI transaction ID</li>
                        <li>✓ Payment amount (₹{upiAmount})</li>
                        <li>✓ Date & time of payment</li>
                        <li>✓ UPI ID ({upiSettings.upiId})</li>
                        <li>✓ Transaction status (Success)</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="upload-preview">
                    <div className="preview-header">
                      <span className="preview-icon">✅</span>
                      <span>Receipt Uploaded Successfully!</span>
                    </div>
                    <div className="preview-file">
                      <span className="file-icon">📄</span>
                      <span className="file-name">
                        {paymentReceipt.name}
                        <span className="file-size">
                          ({(paymentReceipt.size / 1024).toFixed(1)} KB)
                        </span>
                      </span>
                      <button 
                        className="remove-file-btn"
                        onClick={() => {
                          setPaymentReceipt(null);
                          setReceiptUploaded(false);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="preview-actions">
                      <button 
                        className="preview-btn"
                        onClick={() => document.getElementById('receipt-upload').click()}
                      >
                        Change File
                      </button>
                    </div>
                  </div>
                )}
                
                {uploadingReceipt && (
                  <div className="uploading-indicator">
                    <div className="uploading-spinner"></div>
                    <span>Uploading receipt...</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="dialog-buttons">
              <button 
                className={`dialog-btn primary ${!receiptUploaded ? 'disabled' : ''}`}
                onClick={handlePaymentSubmit}
                disabled={!receiptUploaded || uploadingReceipt}
              >
                {uploadingReceipt ? 'Uploading...' : '✓ I Have Paid - Submit Request'}
              </button>
              <button 
                className="dialog-btn cancel"
                onClick={() => {
                  setShowUPIScanner(false);
                  setPaymentReceipt(null);
                  setReceiptUploaded(false);
                  setSelectedChallenge(null);
                }}
              >
                Cancel Payment
              </button>
            </div>
            
            <div className="payment-process-info">
              <div className="process-steps">
                <div className={`process-step ${!receiptUploaded ? 'active' : 'completed'}`}>
                  <span className="step-number">1</span>
                  <span className="step-text">Make Payment via UPI</span>
                </div>
                <div className={`process-step ${receiptUploaded ? 'active' : ''}`}>
                  <span className="step-number">2</span>
                  <span className="step-text">Upload Receipt</span>
                </div>
                <div className="process-step">
                  <span className="step-number">3</span>
                  <span className="step-text">Admin Approval</span>
                </div>
                <div className="process-step">
                  <span className="step-number">4</span>
                  <span className="step-text">Get Paper Money</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Dialog */}
      {showPaymentDetails && selectedPayment && (
        <div className="dialog-overlay">
          <div className="dialog-box upi-dialog">
            <h2 className="dialog-title">Payment Details</h2>
            
            <div className="plan-summary">
              <div className="summary-item">
                <span>Payment ID:</span>
                <span style={{ fontFamily: 'monospace' }}>{selectedPayment.id}</span>
              </div>
              <div className="summary-item">
                <span>Transaction ID:</span>
                <span style={{ fontFamily: 'monospace' }}>{selectedPayment.transactionId}</span>
              </div>
              <div className="summary-item">
                <span>Challenge:</span>
                <span>{selectedPayment.challengeName || selectedPayment.planName}</span>
              </div>
              <div className="summary-item">
                <span>Amount:</span>
                <span>₹{typeof selectedPayment.amount === 'string' ? selectedPayment.amount : selectedPayment.amount?.toLocaleString() || '0'}</span>
              </div>
              <div className="summary-item">
                <span>Payment Method:</span>
                <span>{selectedPayment.paymentMethod || 'UPI'}</span>
              </div>
              <div className="summary-item">
                <span>Status:</span>
                <span className={`payment-status-badge ${selectedPayment.status}`}>
                  {selectedPayment.status}
                </span>
              </div>
              <div className="summary-item">
                <span>Date Submitted:</span>
                <span>{formatDate(selectedPayment.createdAt || selectedPayment.submittedAt)}</span>
              </div>
              <div className="summary-item">
                <span>Last Updated:</span>
                <span>{formatDate(selectedPayment.updatedAt)}</span>
              </div>
            </div>
            
            {selectedPayment.adminNotes && (
              <div className="instruction-alert" style={{ marginTop: '1rem' }}>
                <strong>Admin Notes:</strong><br/>
                {selectedPayment.adminNotes}
              </div>
            )}
            
            <div className="dialog-buttons">
              <button 
                className="dialog-btn secondary"
                onClick={() => {
                  syncPaymentsWithBackend();
                }}
              >
                Sync with Backend
              </button>
              <button 
                className="dialog-btn cancel"
                onClick={() => setShowPaymentDetails(false)}
              >
                Close
              </button>
            </div>
            
            <div className="payment-process-info">
              <div className="process-steps">
                <div className="process-step completed">
                  <span className="step-number">1</span>
                  <span className="step-text">Payment Initiated</span>
                </div>
                <div className="process-step completed">
                  <span className="step-number">2</span>
                  <span className="step-text">Receipt Uploaded</span>
                </div>
                <div className={`process-step ${selectedPayment.status === 'pending' ? 'active' : selectedPayment.status === 'approved' || selectedPayment.status === 'completed' ? 'completed' : ''}`}>
                  <span className="step-number">3</span>
                  <span className="step-text">Admin Review</span>
                </div>
                <div className={`process-step ${selectedPayment.status === 'approved' || selectedPayment.status === 'completed' ? 'active' : ''}`}>
                  <span className="step-number">4</span>
                  <span className="step-text">Paper Money Added</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chart Button - Draggable */}
      <div
        ref={buttonRef}
        className="floating-chart-btn"
        style={{
          position: 'fixed',
          left: `${buttonPos.x}px`,
          top: `${buttonPos.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 9999,
          userSelect: 'none',
          touchAction: 'none',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={() => {
          if (!isDragging) {
            window.open('https://t.me/+c0cqqAHpqkEwNDE1', '_blank');
          }
        }}
      >
        📊
        <span className="tooltip">Chat on Telegram</span>
      </div>

    </div>
  );
}

export default App;
