import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublicData } from '../hooks/usePublicData';
import { useAuth } from '../hooks/useAuth';
import BottomSheet from '../components/ui/BottomSheet';
import CopyButton from '../components/ui/CopyButton';
import { format } from 'date-fns';

// ── Bank Details Sheet ────────────────────────────────────────
function BankDetailsSheet({ isOpen, onClose, accounts }: {
  isOpen: boolean; onClose: () => void;
  accounts: Array<{ bankName: string; branch: string; accountNumber: string; accountHolder: string; paymentMethod: string }>;
}) {
  const banks = accounts.filter((a) => a.paymentMethod === 'bank');
  const ipay = accounts.filter((a) => a.paymentMethod === 'ipay');

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Bank Details" icon="🏦">
      {banks.map((acc, i) => (
        <div key={i} className="card-dark p-4 mb-3">
          <div
            className="teko text-base font-bold tracking-wide text-bright mb-3 flex items-center gap-2 flex-wrap"
          >
            🏛️ {acc.bankName}
            <small className="text-muted font-semibold text-sm" style={{ fontFamily: 'Rajdhani' }}>
              ({acc.branch})
            </small>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-muted text-[11px] font-bold uppercase tracking-wider min-w-[52px]">ගිණුම</span>
            <span className="text-xgray font-bold text-sm font-mono flex-1">{acc.accountNumber}</span>
            <CopyButton value={acc.accountNumber} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted text-[11px] font-bold uppercase tracking-wider min-w-[52px]">නම</span>
            <span className="text-xgray font-bold text-sm flex-1">{acc.accountHolder}</span>
            <CopyButton value={acc.accountHolder} />
          </div>
        </div>
      ))}

      {ipay.length > 0 && (
        <>
          <hr className="border-bright/15 my-4" />
          <div className="teko text-base font-bold tracking-widest text-xgold mb-3 flex items-center gap-2">
            📱 iPay Numbers
          </div>
          {ipay.map((acc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 mb-2 rounded-xl"
              style={{ background: 'rgba(255,215,0,.05)', border: '1px solid rgba(255,215,0,.22)' }}
            >
              <div>
                <div className="font-bold text-white font-mono tracking-wide">
                  {acc.accountNumber.replace(/(\d{3})(\d+)/, '$1 $2')}
                </div>
                <div className="text-muted text-xs mt-0.5">{acc.accountHolder}</div>
              </div>
              <CopyButton value={acc.accountNumber} />
            </div>
          ))}
        </>
      )}
    </BottomSheet>
  );
}

// ── Deposit Request Sheet ─────────────────────────────────────
function DepositSheet({ isOpen, onClose, contacts }: {
  isOpen: boolean; onClose: () => void;
  contacts: Array<{ name: string; phone: string; whatsapp?: string }>;
}) {
  const openWA = (number: string) => {
    const url = `https://wa.me/${number.replace(/\D/g, '')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Deposit Request" icon="💲">
      <div
        className="rounded-xl p-4 mb-4 sinhala text-sm leading-relaxed"
        style={{ background: 'rgba(58,127,255,.08)', border: '1px solid rgba(58,127,255,.25)' }}
      >
        ඩිපෝසිට් කිරීමට පළමු <strong className="text-bright">Bank Details</strong> බලා ගිණුමට ගෙවීම කරන්න.<br /><br />
        ඉන් පසු ඔබගේ <strong className="text-bright">1xBet ID</strong>, ගෙවූ <strong className="text-bright">Amount</strong> සහ{' '}
        <strong className="text-bright">Payment Slip</strong> WhatsApp හරහා අප වෙත එවන්න.
      </div>

      {contacts.map((c, i) => (
        <div key={i} className="card-dark p-4 mb-3">
          <div className="teko text-base font-bold text-bright mb-2">📱 WhatsApp — {c.name}</div>
          <div className="flex items-center gap-2">
            <span className="text-xgray font-bold text-sm flex-1 font-mono">
              {c.phone.replace(/(\d{3})(\d{7})/, '$1 $2')}
            </span>
            <CopyButton value={c.phone} />
          </div>
        </div>
      ))}

      <button
        className="btn-wa mt-2"
        onClick={() => contacts[0]?.whatsapp && openWA(contacts[0].whatsapp)}
      >
        WhatsApp හරහා යොමු කරන්න 💬
      </button>
    </BottomSheet>
  );
}

// ── Withdrawal Sheet ──────────────────────────────────────────
function WithdrawalSheet({ isOpen, onClose, contacts }: {
  isOpen: boolean; onClose: () => void;
  contacts: Array<{ name: string; phone: string; whatsapp?: string }>;
}) {
  const openWA = (number: string) => {
    window.open(`https://wa.me/${number.replace(/\D/g, '')}`, '_blank', 'noopener,noreferrer');
  };

  const steps = [
    { n: 1, text: <><strong>1xBet Cash</strong> තෝරන්න.</> },
    { n: 2, text: <>City: <strong>Walasmulla</strong><br />Street: <strong>Beliatta Road 24/7</strong> ඇතුළත් කරන්න.</> },
    { n: 3, text: <>Approved වූ පසු <strong>Get Code</strong> ඔබා ආරක්ෂණ කේතය ලබාගන්න.</> },
    { n: 4, text: <><strong>1xBet ID</strong>, <strong>Amount</strong>, <strong>Security Code</strong> ඇතුළත් කර <strong>Submit</strong> කරන්න.</> },
    { n: 5, text: <>ඔබගේ <strong>බැංකු විස්තර</strong> WhatsApp හරහා අප වෙත එවන්න.</> },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Withdrawal" icon="💸">
      <div className="space-y-3 mb-4">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-3 items-start card-dark p-3.5">
            <div
              className="min-w-[30px] h-[30px] rounded-full flex items-center justify-center teko text-base font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#1e5be8,#3a7fff)' }}
            >
              {s.n}
            </div>
            <div className="sinhala text-sm leading-relaxed text-xgray">{s.text}</div>
          </div>
        ))}
      </div>
      <button
        className="btn-wa"
        onClick={() => contacts[0]?.whatsapp && openWA(contacts[0].whatsapp)}
      >
        WhatsApp හරහා ඉල්ලීම යොමු කරන්න 💬
      </button>
    </BottomSheet>
  );
}

// ── Contact Sheet ─────────────────────────────────────────────
function ContactSheet({ isOpen, onClose, contacts }: {
  isOpen: boolean; onClose: () => void;
  contacts: Array<{ name: string; phone: string; whatsapp?: string }>;
}) {
  const openWA = (number: string) => {
    window.open(`https://wa.me/${number.replace(/\D/g, '')}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Contact Us" icon="📞">
      {contacts.map((c, i) => (
        <div key={i} className="card-dark p-4 mb-3">
          <div className="teko text-base font-bold text-bright mb-2">📱 {c.name}</div>
          <div className="flex items-center gap-2">
            <span className="text-muted text-[11px] font-bold uppercase tracking-wider">දු.අ.</span>
            <span className="text-xgray font-bold text-sm flex-1 font-mono">
              {c.phone.replace(/(\d{3})(\d{7})/, '$1 $2')}
            </span>
            <CopyButton value={c.phone} />
          </div>
        </div>
      ))}
      <button
        className="btn-wa mt-2"
        onClick={() => contacts[0]?.whatsapp && openWA(contacts[0].whatsapp)}
      >
        WhatsApp කරන්න 💬
      </button>
    </BottomSheet>
  );
}

// ── Main Home Page ─────────────────────────────────────────────
export default function Home() {
  const { data, isLoading } = usePublicData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sheet, setSheet] = useState<'bank' | 'deposit' | 'withdraw' | 'contact' | null>(null);

  const promo = data?.promo;
  const tickers: Array<{ icon: string; message: string }> = data?.tickers || [];
  const contacts: Array<{ name: string; phone: string; whatsapp?: string }> = data?.contacts || [];
  const accounts: Array<{ bankName: string; branch: string; accountNumber: string; accountHolder: string; paymentMethod: string }> = data?.paymentAccounts || [];
  const recentTx: Array<{ username: string; amount: string | number; time: string; status: string }> = data?.recentTransactions || [];

  const allTickers = tickers.length > 0
    ? tickers
    : [
        { icon: '🔔', message: 'Promo Code: VGSL' },
        { icon: '💎', message: '24/7 Fast Deposit & Withdrawals' },
        { icon: '🏆', message: 'Trusted Agent Since 2012' },
        { icon: '🎁', message: '200% Welcome Bonus' },
        { icon: '⚡', message: 'Instant Withdrawals' },
      ];

  const doubledTickers = [...allTickers, ...allTickers];

  const handleRegister = () => navigate('/register');
  const openWA = (number: string) =>
    window.open(`https://wa.me/${number.replace(/\D/g, '')}`, '_blank', 'noopener,noreferrer');

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-[520px] relative z-10">

        {/* Header */}
        <header
          className="sticky top-0 z-40 w-full px-5 py-3.5 flex items-center justify-between"
          style={{
            background: 'linear-gradient(180deg, #08121f, #0d1f3c)',
            borderBottom: '1px solid rgba(58,127,255,.22)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div className="teko text-2xl font-bold tracking-wider">
            Xbet <span className="text-bright">Fast Cash</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-bright"
            style={{ background: 'rgba(58,127,255,.1)', border: '1px solid rgba(58,127,255,.38)' }}
          >
            <div className="w-2 h-2 rounded-full bg-xgreen animate-blink" />
            ONLINE SERVICE
          </div>
        </header>

        {/* Hero */}
        <section className="text-center px-5 pt-9 pb-4">
          <h1
            className="teko font-bold tracking-widest leading-tight animate-fade-in"
            style={{
              fontSize: 'clamp(2rem, 8vw, 3rem)',
              background: 'linear-gradient(135deg, #fff 0%, #8ab4ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Xbet Fast Cash Official<br />Sri Lanka
          </h1>

          {user && (
            <div className="mt-3 flex gap-2 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-all btn-blue"
              >
                My Dashboard
              </button>
            </div>
          )}
        </section>

        {/* Ticker */}
        <div
          className="w-full overflow-hidden py-2.5 relative"
          style={{
            background: 'linear-gradient(90deg, rgba(10,25,55,.9), rgba(20,50,110,.7), rgba(10,25,55,.9))',
            borderTop: '1px solid rgba(58,127,255,.2)',
            borderBottom: '1px solid rgba(58,127,255,.2)',
          }}
        >
          <div
            style={{
              position: 'absolute', top: 0, bottom: 0, left: 0, width: 44, zIndex: 2,
              background: 'linear-gradient(90deg, rgba(8,18,31,.95), transparent)',
            }}
          />
          <div
            style={{
              position: 'absolute', top: 0, bottom: 0, right: 0, width: 44, zIndex: 2,
              background: 'linear-gradient(-90deg, rgba(8,18,31,.95), transparent)',
            }}
          />
          <div className="flex w-max animate-ticker">
            {doubledTickers.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-7 text-sm font-semibold text-xgray whitespace-nowrap"
                style={{ borderRight: '1px solid rgba(58,127,255,.2)' }}
              >
                {t.icon && <span>{t.icon}</span>}
                {t.message.includes('VGSL') ? (
                  <>Promo Code: <strong className="text-white ml-1">VGSL</strong></>
                ) : (
                  t.message
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Promo Card */}
        <section className="px-4 py-6 w-full">
          <div className="card-blue p-8 text-center relative">
            <div
              className="absolute inset-0 opacity-70 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse, rgba(255,255,255,.07) 0%, transparent 60%)',
                animation: 'spin 6s linear infinite',
              }}
            />
            <div className="text-5xl mb-2">🎁</div>
            <h2 className="teko text-5xl font-bold tracking-widest leading-none text-white">
              {promo ? `${promo.bonusPercentage}% BONUS` : '200% BONUS'}
            </h2>
            <div className="teko text-2xl tracking-[4px] text-white/84 mt-1 mb-5">PROMO CODE</div>

            <div className="flex items-center justify-center gap-3 mb-6">
              <div
                className="teko text-4xl font-bold tracking-[5px] text-white px-8 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,.13)', border: '2.5px dashed rgba(255,255,255,.55)' }}
              >
                {isLoading ? '...' : (promo?.code || 'VGSL')}
              </div>
              <CopyButton value={promo?.code || 'VGSL'} label="Copy" />
            </div>

            <button className="btn-gold" onClick={handleRegister}>
              REGISTER NOW ›
            </button>
          </div>
        </section>

        {/* Service Cards */}
        <section className="px-4 pb-6 grid grid-cols-2 gap-3">
          {[
            {
              id: 'bank', icon: '🏦', title: 'Bank Details', desc: 'ගෙවීමට බැංකු ගිණුම් විස්තර ලබා ගන්න',
              style: { background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' },
            },
            {
              id: 'deposit', icon: '💲', title: 'Deposit Request', desc: 'ඩිපෝසිට් කිරීම සඳහා විස්තර ලබා ගන්න',
              style: { background: 'linear-gradient(135deg,#0e245a,#1a3a8f)', border: '1px solid rgba(58,127,255,.45)' },
            },
            {
              id: 'withdraw', icon: '💸', title: 'Withdrawal', desc: 'ගෙවීම් ලබා ගැනීම මෙතැනින් ඉල්ලන්න',
              style: { background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' },
            },
            {
              id: 'contact', icon: '📞', title: 'Contact Us', desc: 'ඕනෑම ගැටළුවකට සම්බන්ධ වන්න',
              style: { background: 'rgba(58,127,255,.09)', border: '1px solid rgba(58,127,255,.28)' },
            },
          ].map((card) => (
            <button
              key={card.id}
              onClick={() => setSheet(card.id as typeof sheet)}
              className="text-center rounded-2xl p-5 cursor-pointer select-none transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.96]"
              style={card.style}
            >
              <div className="text-3xl mb-2">{card.icon}</div>
              <h3 className="teko text-lg font-bold tracking-widest uppercase text-white mb-1.5">{card.title}</h3>
              <p className="sinhala text-xs text-muted leading-relaxed">{card.desc}</p>
            </button>
          ))}
        </section>

        {/* Live Transactions */}
        <section className="px-4 pb-9">
          <div className="teko text-xl font-semibold tracking-widest text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-4 rounded-sm bg-bright inline-block" />
            Live Transactions
            <span className="w-2 h-2 rounded-full bg-xgreen ml-1 animate-blink" />
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(58,127,255,.15)' }}
          >
            <table className="w-full text-sm">
              <thead style={{ background: 'rgba(30,91,232,.2)', borderBottom: '1px solid rgba(58,127,255,.25)' }}>
                <tr>
                  {['Time', 'Player', 'Amount', 'Status'].map((h) => (
                    <th key={h} className="text-left px-3.5 py-2.5 text-bright text-xs font-bold tracking-widest uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTx.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted text-sm">
                      No recent transactions
                    </td>
                  </tr>
                ) : (
                  recentTx.map((tx, i) => (
                    <tr key={i} className="border-b border-white/4 last:border-0 hover:bg-bright/5 transition-colors">
                      <td className="px-3.5 py-2.5 text-muted text-xs font-mono">
                        {format(new Date(tx.time), 'HH:mm')}
                      </td>
                      <td className="px-3.5 py-2.5 text-xgray text-xs font-mono">{tx.username}</td>
                      <td className="px-3.5 py-2.5 text-xgray text-xs font-bold">
                        Rs. {Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: 'rgba(0,232,122,.12)', color: '#00e87a', border: '1px solid rgba(0,232,122,.3)' }}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="w-full py-4.5 px-5 text-center text-muted text-xs tracking-wide"
          style={{ background: 'rgba(8,18,31,.98)', borderTop: '1px solid rgba(58,127,255,.15)' }}
        >
          © 2026 <strong className="text-bright">Xbet Fast Cash</strong> — Official Sri Lanka Agent — Trusted Since 2012
        </footer>
      </div>

      {/* Sheets */}
      <BankDetailsSheet
        isOpen={sheet === 'bank'}
        onClose={() => setSheet(null)}
        accounts={accounts}
      />
      <DepositSheet
        isOpen={sheet === 'deposit'}
        onClose={() => setSheet(null)}
        contacts={contacts}
      />
      <WithdrawalSheet
        isOpen={sheet === 'withdraw'}
        onClose={() => setSheet(null)}
        contacts={contacts}
      />
      <ContactSheet
        isOpen={sheet === 'contact'}
        onClose={() => setSheet(null)}
        contacts={contacts}
      />
    </div>
  );
}
