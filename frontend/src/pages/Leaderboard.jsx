import React, { useState } from 'react';

export default function Leaderboard() {
  const [filterPeriod, setFilterPeriod] = useState('This Month');

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

      {/* Top 3 Podium (Bento Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl relative">
        {/* 2nd Place */}
        <div className="order-2 md:order-1 glass-panel rounded-xl p-lg flex flex-col items-center relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border border-outline-variant/30 md:mt-8 shadow-sm">
          <div className="absolute -top-10 -right-10 text-surface-container-highest opacity-50 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[120px]">military_tech</span>
          </div>
          <div className="w-20 h-20 rounded-full bg-surface-container ring-4 ring-outline-variant/50 relative mb-md z-10">
            <img alt="Sarah J." className="w-full h-full rounded-full object-cover" src="https://api.dicebear.com/7.x/adventurer/svg?seed=zjl6v"/>
            <div className="absolute -bottom-2 -right-2 bg-surface-container-highest text-on-surface font-label-sm text-label-sm w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow-sm font-bold">#2</div>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface z-10 font-bold">Sarah J.</h3>
          <p className="font-label-md text-label-md text-secondary mb-md z-10 flex items-center gap-xs font-semibold">
            <span className="material-symbols-outlined text-[16px] icon-fill">verified</span>
            Top Renter
          </p>
          <div className="w-full bg-surface/50 rounded-lg p-sm text-center border border-outline-variant/20 z-10">
            <p className="font-label-sm text-label-sm text-on-surface-variant">Total Volume</p>
            <p className="font-headline-md text-headline-md font-bold text-primary">₹1,240</p>
          </div>
        </div>

        {/* 1st Place (Center, Elevated) */}
        <div className="order-1 md:order-2 bg-white rounded-xl p-lg flex flex-col items-center relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border border-primary/20 shadow-[0_10px_20px_rgba(79,70,229,0.1)] z-10 trophy-glow">
          <div className="absolute -top-4 text-primary opacity-20 group-hover:scale-110 transition-transform z-0">
            <span className="material-symbols-outlined text-[180px] icon-fill">emoji_events</span>
          </div>
          <div className="w-28 h-28 rounded-full bg-surface-container ring-4 ring-primary relative mb-md z-10">
            <img alt="Marcus T." className="w-full h-full rounded-full object-cover" src="https://api.dicebear.com/7.x/adventurer/svg?seed=lvcc5w"/>
            <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary font-label-sm text-label-sm w-10 h-10 flex items-center justify-center rounded-full border-2 border-white shadow-md font-bold">#1</div>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface font-black z-10">Marcus T.</h3>
          <p className="font-label-md text-label-md text-secondary mb-md z-10 flex items-center gap-xs font-semibold">
            <span className="material-symbols-outlined text-[16px] icon-fill">local_fire_department</span>
            Power Seller
          </p>
          <div className="w-full bg-primary-container/10 rounded-lg p-md text-center border border-primary/10 z-10">
            <p className="font-label-sm text-label-sm text-primary">Total Volume</p>
            <p className="font-headline-lg text-headline-lg font-black text-primary">₹3,850</p>
            <p className="font-label-sm text-[10px] text-on-surface-variant mt-1">42 Transactions</p>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="order-3 glass-panel rounded-xl p-lg flex flex-col items-center relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border border-outline-variant/30 md:mt-8 shadow-sm">
          <div className="absolute -bottom-10 -left-10 text-surface-container-highest opacity-50 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[120px]">workspace_premium</span>
          </div>
          <div className="w-20 h-20 rounded-full bg-surface-container ring-4 ring-tertiary-fixed-dim/50 relative mb-md z-10">
            <img alt="David L." className="w-full h-full rounded-full object-cover" src="https://api.dicebear.com/7.x/adventurer/svg?seed=st2gms"/>
            <div className="absolute -bottom-2 -right-2 bg-surface-container-highest text-on-surface font-label-sm text-label-sm w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow-sm font-bold">#3</div>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface z-10 font-bold">David L.</h3>
          <p className="font-label-md text-label-md text-secondary mb-md z-10 flex items-center gap-xs font-semibold">
            <span className="material-symbols-outlined text-[16px] icon-fill">handshake</span>
            Most Trusted
          </p>
          <div className="w-full bg-surface/50 rounded-lg p-sm text-center border border-outline-variant/20 z-10">
            <p className="font-label-sm text-label-sm text-on-surface-variant">Total Volume</p>
            <p className="font-headline-md text-headline-md font-bold text-primary">₹980</p>
          </div>
        </div>
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
          {/* Rank 4 */}
          <div className="flex items-center justify-between p-md border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors group">
            <div className="flex items-center gap-md">
              <span className="font-headline-md text-headline-md text-outline font-bold w-8 text-center group-hover:text-primary transition-colors">4</span>
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container">
                <img alt="Emma W." className="w-full h-full object-cover" src="https://api.dicebear.com/7.x/adventurer/svg?seed=cw4uxj"/>
              </div>
              <div>
                <p className="font-label-md text-label-md font-semibold text-on-surface">Emma W.</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Seller Score: 98</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-label-md text-label-md font-bold text-on-surface">₹845</p>
              <p className="font-label-sm text-label-sm text-secondary flex items-center justify-end gap-[2px]">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +12%
              </p>
            </div>
          </div>

          {/* Rank 5 */}
          <div className="flex items-center justify-between p-md border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors group">
            <div className="flex items-center gap-md">
              <span className="font-headline-md text-headline-md text-outline font-bold w-8 text-center group-hover:text-primary transition-colors">5</span>
              <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                JL
              </div>
              <div>
                <p className="font-label-md text-label-md font-semibold text-on-surface">James L.</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Seller Score: 95</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-label-md text-label-md font-bold text-on-surface">₹720</p>
              <p className="font-label-sm text-label-sm text-outline flex items-center justify-end gap-[2px]">
                <span className="material-symbols-outlined text-[14px]">trending_flat</span> 0%
              </p>
            </div>
          </div>

          {/* Rank 6 */}
          <div className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors group">
            <div className="flex items-center gap-md">
              <span className="font-headline-md text-headline-md text-outline font-bold w-8 text-center group-hover:text-primary transition-colors">6</span>
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container">
                <img alt="Michael B." className="w-full h-full object-cover" src="https://api.dicebear.com/7.x/adventurer/svg?seed=y39q5l"/>
              </div>
              <div>
                <p className="font-label-md text-label-md font-semibold text-on-surface">Michael B.</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Seller Score: 92</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-label-md text-label-md font-bold text-on-surface">₹650</p>
              <p className="font-label-sm text-label-sm text-error flex items-center justify-end gap-[2px]">
                <span className="material-symbols-outlined text-[14px]">trending_down</span> -3%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
