// frontend/src/pages/LeaderboardPage.jsx
import { useState, useEffect } from 'react';
import { lbAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DIFFS = ['all', 'easy', 'medium', 'hard'];
const DIFF_COLOR = { easy: '#c8f135', medium: '#ffd700', hard: '#ff4d6d' };

export default function LeaderboardPage({ onBack }) {
  const { user } = useAuth();
  const [tab,     setTab]    = useState('all');
  const [rows,    setRows]   = useState([]);
  const [myRank,  setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [tab]);

  useEffect(() => {
    if (user) {
      lbAPI.myRank().then(r => setMyRank(r.data)).catch(() => {});
    }
  }, [user]);

  async function load() {
    setLoading(true);
    try {
      const res = tab === 'all'
        ? await lbAPI.global(20)
        : await lbAPI.byDiff(tab);
      setRows(res.data);
    } catch (e) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const S = {
    page: {
      minHeight: '100vh', background: '#09090b',
      color: '#e8e8f0', fontFamily: "'Space Mono', monospace",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 16px',
    },
    badge: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 10, letterSpacing: 7, color: '#c8f135', marginBottom: 8,
    },
    title: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 'clamp(44px,8vw,72px)', lineHeight: 0.9,
      letterSpacing: 5, marginBottom: 24,
      background: 'linear-gradient(135deg,#e8e8f0 30%,#c8f135 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    myRankCard: {
      background: 'rgba(200,241,53,.06)',
      border: '1px solid rgba(200,241,53,.2)',
      borderRadius: 4, padding: '12px 20px',
      display: 'flex', gap: 24, marginBottom: 20,
      flexWrap: 'wrap', justifyContent: 'center',
    },
    statItem: { textAlign: 'center' },
    statVal:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#c8f135' },
    statLbl:  { fontSize: 9, letterSpacing: 2, color: '#55556a' },
    tabs: {
      display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center',
    },
    tab: (active, diff) => ({
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 13, letterSpacing: 2,
      padding: '8px 18px', cursor: 'pointer', borderRadius: 4,
      border: '1px solid',
      background: active ? 'rgba(200,241,53,.1)' : '#18181d',
      borderColor: active ? (DIFF_COLOR[diff] || '#c8f135') : '#34343f',
      color: active ? (DIFF_COLOR[diff] || '#c8f135') : '#55556a',
      transition: 'all 0.2s',
    }),
    table: { width: '100%', maxWidth: 560, borderCollapse: 'collapse' },
    th: {
      fontFamily: "'Bebas Neue', sans-serif", fontSize: 11,
      letterSpacing: 3, color: '#55556a',
      padding: '8px 12px', borderBottom: '1px solid #26262f', textAlign: 'left',
    },
    td: { padding: '11px 12px', fontSize: 12, borderBottom: '1px solid #1a1a1f' },
    backBtn: {
      marginTop: 28, background: 'transparent',
      border: '1px solid #34343f', color: '#55556a',
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 14, letterSpacing: 3, padding: '10px 24px',
      cursor: 'pointer', borderRadius: 4,
    },
  };

  const medals = ['🥇','🥈','🥉'];
  const rowColor = (i) => i === 0 ? '#ffd700' : i === 1 ? '#e8e8f0' : i === 2 ? '#94b820' : '#55556a';

  return (
    <div style={S.page}>
      <div style={S.badge}>Hall of Fame</div>
      <div style={S.title}>LEADER<br/>BOARD</div>

      {/* My rank card */}
      {user && myRank && (
        <div style={S.myRankCard}>
          {[
            { val: `#${myRank.rank}`,         lbl: 'MY RANK'   },
            { val: myRank.total_score,         lbl: 'SCORE'     },
            { val: myRank.total_wins,          lbl: 'WINS'      },
            { val: myRank.best_streak + '🔥',  lbl: 'STREAK'   },
          ].map(s => (
            <div key={s.lbl} style={S.statItem}>
              <div style={S.statVal}>{s.val}</div>
              <div style={S.statLbl}>{s.lbl}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={S.tabs}>
        {DIFFS.map(d => (
          <div key={d} style={S.tab(tab === d, d)}
               onClick={() => setTab(d)}>
            {d.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ color: '#55556a', letterSpacing: 2, fontSize: 11 }}>LOADING...</div>
      ) : rows.length === 0 ? (
        <div style={{ color: '#55556a', letterSpacing: 2, fontSize: 11, marginTop: 20 }}>
          NO ENTRIES YET — BE THE FIRST!
        </div>
      ) : (
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>#</th>
              <th style={S.th}>PLAYER</th>
              <th style={S.th}>SCORE</th>
              <th style={S.th}>WINS</th>
              <th style={S.th}>W%</th>
              <th style={S.th}>STREAK</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{
                background: user?.username === r.username ? 'rgba(200,241,53,.04)' : 'transparent',
              }}>
                <td style={{ ...S.td, fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: rowColor(i) }}>
                  {medals[i] || i + 1}
                </td>
                <td style={{ ...S.td, color: '#e8e8f0' }}>
                  <span style={{ marginRight: 6 }}>{r.avatar || '🎮'}</span>
                  {r.username}
                  {user?.username === r.username && (
                    <span style={{ marginLeft: 6, fontSize: 9, color: '#c8f135', letterSpacing: 1 }}>YOU</span>
                  )}
                </td>
                <td style={{ ...S.td, color: '#c8f135', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18 }}>
                  {(r.score || r.best_score || 0).toLocaleString()}
                </td>
                <td style={S.td}>{r.wins || 0}</td>
                <td style={S.td}>{r.win_rate != null ? r.win_rate + '%' : '—'}</td>
                <td style={S.td}>{r.streak || 0}🔥</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button style={S.backBtn} onClick={onBack}>← BACK</button>
    </div>
  );
}
