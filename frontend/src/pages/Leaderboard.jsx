import React, { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [filterPeriod, setFilterPeriod] = useState('This Month');
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const periodParam = filterPeriod === 'This Month' ? 'thisMonth' : 'allTime';
        const res = await fetch(`http://localhost:5000/api/leaderboard?period=${periodParam}`);
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        const data = await res.json();
        setLeaders(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [filterPeriod]);

  // Handle empty state gracefully if DB doesn't have many users
  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="p-margin-mobile md:p-margin-desktop max-w-max-width mx-auto w-full pt-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-lg mb-xl">
        <div>
          <h2 className="font-display text-display text-on-surface mb-xs md:text-[48px] text-[36px] font-black">
            Campus Legends
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Recognizing the top traders and most trusted peers this month.
          </p>
        </div>
        {/* Filters */}
        <div className="flex bg-surface-container-highest rounded-lg p-1 glass-panel">
          <button 
            onClick={() => setFilterPeriod('This Month')}
            className={`px-6 py-2 rounded font-label-md text-label-md transition-all border-0 cursor-pointer ${filterPeriod === 'This Month' ? 'bg-white shadow-sm text-primary font-semibold' : 'bg-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            This Month
          </button>
          <button 
            onClick={() => setFilterPeriod('All Time')}
            className={`px-6 py-2 rounded font-label-md text-label-md transition-all border-0 cursor-pointer ${filterPeriod === 'All Time' ? 'bg-white shadow-sm text-primary font-semibold' : 'bg-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <p className="font-label-lg text-secondary">Loading Legends...</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium (Bento Grid Style) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl relative">
        {/* 2nd Place */}
        {top3[1] && (
          <div className="order-2 md:order-1 glass-panel rounded-xl p-lg flex flex-col items-center relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border border-outline-variant/30 md:mt-8 shadow-sm">
            <div className="absolute -top-10 -right-10 text-surface-container-highest opacity-50 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[120px]">military_tech</span>
            </div>
            <div className="w-20 h-20 rounded-full bg-surface-container ring-4 ring-outline-variant/50 relative mb-md z-10">
              <img alt={top3[1].name} className="w-full h-full rounded-full object-cover" src={top3[1].avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${top3[1].name}`}/>
              <div className="absolute -bottom-2 -right-2 bg-surface-container-highest text-on-surface font-label-sm text-label-sm w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow-sm font-bold">#2</div>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface z-10 font-bold">{top3[1].name}</h3>
            <p className="font-label-md text-label-md text-secondary mb-md z-10 flex items-center gap-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] icon-fill">verified</span>
              {top3[1].label || 'Top Renter'}
            </p>
            <div className="w-full bg-surface/50 rounded-lg p-sm text-center border border-outline-variant/20 z-10">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Total Points</p>
              <p className="font-headline-md text-headline-md font-bold text-primary">{top3[1].points}</p>
            </div>
          </div>
        )}

        {/* 1st Place (Center, Elevated) */}
        {top3[0] && (
          <div className="order-1 md:order-2 bg-white rounded-xl p-lg flex flex-col items-center relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border border-primary/20 shadow-[0_10px_20px_rgba(79,70,229,0.1)] z-10 trophy-glow">
            <div className="absolute -top-4 text-primary opacity-20 group-hover:scale-110 transition-transform z-0">
              <span className="material-symbols-outlined text-[180px] icon-fill">emoji_events</span>
            </div>
            <div className="w-28 h-28 rounded-full bg-surface-container ring-4 ring-primary relative mb-md z-10">
              <img alt={top3[0].name} className="w-full h-full rounded-full object-cover" src={top3[0].avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${top3[0].name}`}/>
              <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary font-label-sm text-label-sm w-10 h-10 flex items-center justify-center rounded-full border-2 border-white shadow-md font-bold">#1</div>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-black z-10">{top3[0].name}</h3>
            <p className="font-label-md text-label-md text-secondary mb-md z-10 flex items-center gap-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] icon-fill">local_fire_department</span>
              {top3[0].label || 'Power Seller'}
            </p>
            <div className="w-full bg-primary-container/10 rounded-lg p-md text-center border border-primary/10 z-10">
              <p className="font-label-sm text-label-sm text-primary">Total Points</p>
              <p className="font-headline-lg text-headline-lg font-black text-primary">{top3[0].points}</p>
              <p className="font-label-sm text-[10px] text-on-surface-variant mt-1">{top3[0].salesCount} Transactions</p>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div className="order-3 glass-panel rounded-xl p-lg flex flex-col items-center relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border border-outline-variant/30 md:mt-8 shadow-sm">
            <div className="absolute -bottom-10 -left-10 text-surface-container-highest opacity-50 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[120px]">workspace_premium</span>
            </div>
            <div className="w-20 h-20 rounded-full bg-surface-container ring-4 ring-tertiary-fixed-dim/50 relative mb-md z-10">
              <img alt={top3[2].name} className="w-full h-full rounded-full object-cover" src={top3[2].avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${top3[2].name}`}/>
              <div className="absolute -bottom-2 -right-2 bg-surface-container-highest text-on-surface font-label-sm text-label-sm w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow-sm font-bold">#3</div>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface z-10 font-bold">{top3[2].name}</h3>
            <p className="font-label-md text-label-md text-secondary mb-md z-10 flex items-center gap-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] icon-fill">handshake</span>
              {top3[2].label || 'Most Trusted'}
            </p>
            <div className="w-full bg-surface/50 rounded-lg p-sm text-center border border-outline-variant/20 z-10">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Total Points</p>
              <p className="font-headline-md text-headline-md font-bold text-primary">{top3[2].points}</p>
            </div>
          </div>
        )}
      </div>

      {/* List Section: Rest of Top 10 */}
      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden mb-xl">
        <div className="px-lg py-md border-b border-outline-variant/20 bg-surface/50 flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Top 10 Rankings</h3>
          <button 
            onClick={() => alert("Loading more ranks...")}
            className="font-label-sm text-label-sm text-primary hover:text-primary-fixed-dim flex items-center gap-xs transition-colors border-0 bg-transparent cursor-pointer font-semibold"
          >
            View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
        
        <div className="flex flex-col">
          {rest.map((user, index) => (
            <div key={user.email} className="flex items-center justify-between p-md border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors group">
              <div className="flex items-center gap-md">
                <span className="font-headline-md text-headline-md text-outline font-bold w-8 text-center group-hover:text-primary transition-colors">
                  {index + 4}
                </span>
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container">
                  <img alt={user.name} className="w-full h-full object-cover" src={user.avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${user.name}`}/>
                </div>
                <div>
                  <p className="font-label-md text-label-md font-semibold text-on-surface">{user.name}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Seller Score: {user.rating}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-label-md text-label-md font-bold text-on-surface">{user.points} pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
