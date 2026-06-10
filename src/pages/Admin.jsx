import React, { useState } from 'react';

export default function Admin() {
  // Moderate reports list
  const [reports, setReports] = useState([
    {
      id: "LST-9921",
      name: "Intro to Calculus 4th Ed",
      type: "item",
      reporter: "john.d@university.edu",
      reason: "Misleading Price",
      status: "Pending",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9XIsf1P-nmmva_naYlTtl6Qx5HC3x2hIp4ju97aJpSn-TumjwsbNQK4c3XOrk989FDr_48Ak4Y0BhOQDeJHMRFKhpPtPb9x8XAUu0hHHwAzE1O2y30SR1h372TRSXPhuXezpr7H82quv6_bjzCyIBVQzdQ4TyBW4abufRXKHDTfG358hCq-s_XuYPwum_k7ZZqwbMRU_5awB7jIzw8O5Vxf5q1AqcyR0Ji4Cau0SUo91m-g06xJfUbeSO4WQwWIkzvQA1JI9MD2Vv"
    },
    {
      id: "LST-8834",
      name: "MacBook Pro 2019",
      type: "item",
      reporter: "sarah.m@university.edu",
      reason: "Counterfeit Item",
      status: "Pending",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXBRxqYywlk5xvGTCqJ4ly5RI0Pia8oTqACASMMYfKAxXC764SiHRMFFgbEipLEnCkB8ymryZ9wuicslVsd-7iu-5-VYUpNvksD3ngT_8VQMvLyWTRZb14WPLPJ_LJJ1rV-MROvIWqOfYoo_g9PLlR6mxThNOGBkrRMxkhz8xZVJeIitvtG3Bo1qkN-37hJQ4ucdCH4KtP4-6O-aZtSFFh76nVsJWRssaq4kiXYdp2FtjeGgewWB6ubET7KcgG9b7h1413zAUf_CKW"
    },
    {
      id: "USR-102",
      name: "User Profile: \"CampusTrader1\"",
      type: "user",
      reporter: "alex.k@university.edu",
      reason: "Inappropriate Behavior",
      status: "Reviewed",
      image: null
    }
  ]);

  const handleApproveReport = (id) => {
    setReports(prev =>
      prev.map(r => r.id === id ? { ...r, status: "Approved (Removed)" } : r)
    );
  };

  const handleDismissReport = (id) => {
    setReports(prev =>
      prev.map(r => r.id === id ? { ...r, status: "Dismissed" } : r)
    );
  };

  return (
    <div className="p-margin-mobile md:p-margin-desktop max-w-max-width mx-auto space-y-lg pt-6">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface font-black">Platform Pulse</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Real-time metrics for Campus Marketplace operations.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert("Report period changed to Last 30 Days")}
            className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            Last 30 Days
          </button>
          <button 
            onClick={() => alert("Moderation records exported as CSV")}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-2 hover:bg-primary/95 transition-colors shadow-sm cursor-pointer border-0 font-semibold"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="bento-grid">
        
        {/* Stat Card 1 */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 glass-card rounded-xl p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            </div>
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-secondary bg-secondary-container/30 px-2 py-1 rounded-full font-bold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 12.5%
            </span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Users</p>
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface font-black">14,205</h3>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 glass-card rounded-xl p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
            </div>
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-secondary bg-secondary-container/30 px-2 py-1 rounded-full font-bold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 8.2%
            </span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">Active Listings</p>
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface font-black">3,842</h3>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 glass-card rounded-xl p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>sync_alt</span>
            </div>
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-error bg-error-container/30 px-2 py-1 rounded-full font-bold">
              <span className="material-symbols-outlined text-[14px]">trending_down</span> 2.1%
            </span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">Transactions (MTD)</p>
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface font-black">1,204</h3>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 glass-card rounded-xl p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 text-primary pointer-events-none">
            <span className="material-symbols-outlined text-[120px]">payments</span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-secondary bg-secondary-container/30 px-2 py-1 rounded-full font-bold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 24.8%
            </span>
          </div>
          <div className="relative z-10">
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">Platform Revenue</p>
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface font-black">$24.5k</h3>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-headline-md font-semibold text-on-surface font-bold">Transaction Trends</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-primary inline-block mt-1"></span>
              <span className="font-label-sm text-label-sm text-outline font-semibold">Completed</span>
              <span className="w-3 h-3 rounded-full bg-surface-dim inline-block mt-1 ml-2"></span>
              <span className="font-label-sm text-label-sm text-outline font-semibold">Pending</span>
            </div>
          </div>
          <div className="flex-grow w-full min-h-[250px] chart-placeholder-line rounded-lg relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-label-sm text-outline pb-6 pl-2">
              <span>500</span>
              <span>400</span>
              <span>300</span>
              <span>200</span>
              <span>100</span>
              <span>0</span>
            </div>
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-8 right-0 flex justify-between text-label-sm text-outline pt-2 border-t border-outline-variant/30">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Secondary Category Donut Area */}
        <div className="col-span-12 lg:col-span-4 glass-card rounded-xl p-6 flex flex-col">
          <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-6 font-bold">Category Usage</h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[180px]">
            <div className="w-40 h-40 rounded-full relative flex items-center justify-center" style={{ background: "conic-gradient(#3525cd 0% 40%, #006c49 40% 70%, #a04500 70% 85%, #7b3300 85% 95%, #777587 95% 100%)" }}>
              <div className="absolute inset-[14px] bg-surface-container-lowest dark:bg-inverse-surface rounded-full flex items-center justify-center">
                <div className="text-center">
                  <span className="block font-headline-md text-headline-md font-bold text-on-surface">5</span>
                  <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Categories</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3 shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="font-label-md text-label-md text-on-surface">Textbooks</span>
              </div>
              <span className="font-label-md text-label-md font-semibold">40%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary"></span>
                <span className="font-label-md text-label-md text-on-surface">Electronics</span>
              </div>
              <span className="font-label-md text-label-md font-semibold">30%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-tertiary-container"></span>
                <span className="font-label-md text-label-md text-on-surface">Furniture</span>
              </div>
              <span className="font-label-md text-label-md font-semibold">15%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-tertiary"></span>
                <span className="font-label-md text-label-md text-on-surface">Apparel</span>
              </div>
              <span className="font-label-md text-label-md font-semibold">10%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-outline"></span>
                <span className="font-label-md text-label-md text-on-surface">Other</span>
              </div>
              <span className="font-label-md text-label-md font-semibold">5%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Moderation Cases Table */}
      <div className="mt-xl glass-card rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest/50">
          <h3 className="font-headline-md text-headline-md font-semibold text-on-surface font-bold">Recent Reports &amp; Moderation</h3>
          <span className="text-outline text-label-sm font-semibold">{reports.filter(r => r.status === 'Pending').length} Pending Cases</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                <th className="p-4 font-bold">Item / Listing</th>
                <th className="p-4 font-bold">Reported By</th>
                <th className="p-4 font-bold">Reason</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
              {reports.map((report) => {
                const isPending = report.status === 'Pending';
                
                return (
                  <tr key={report.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-variant flex-shrink-0 overflow-hidden flex items-center justify-center text-outline">
                        {report.image ? (
                          <img alt={report.name} className="w-full h-full object-cover" src={report.image}/>
                        ) : (
                          <span className="material-symbols-outlined">person</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface line-clamp-1">{report.name}</p>
                        <p className="text-label-sm text-outline">ID: #{report.id}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
                          {report.reporter[0].toUpperCase()}
                        </div>
                        <span>{report.reporter}</span>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant">{report.reason}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isPending 
                          ? 'bg-error-container/30 text-error' 
                          : report.status.includes('Removed') 
                            ? 'bg-error text-on-primary' 
                            : 'bg-surface-variant text-on-surface-variant'
                      }`}>
                        {isPending && <span className="w-1.5 h-1.5 rounded-full bg-error"></span>}
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {isPending ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleApproveReport(report.id)}
                            className="p-2 rounded-lg text-secondary border-0 bg-transparent hover:bg-secondary-container/20 transition-all cursor-pointer active:scale-90" 
                            title="Approve Report (Remove Listing)"
                          >
                            <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                          </button>
                          <button 
                            onClick={() => handleDismissReport(report.id)}
                            className="p-2 rounded-lg text-outline border-0 bg-transparent hover:bg-surface-container-high transition-all cursor-pointer active:scale-90" 
                            title="Reject Report (Keep Listing)"
                          >
                            <span className="material-symbols-outlined text-[20px] font-bold">close</span>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => alert(`Reviewing archived case history for ${report.id}`)}
                          className="text-primary hover:text-primary-fixed-dim font-label-md text-label-md transition-colors underline decoration-transparent hover:decoration-primary cursor-pointer border-0 bg-transparent"
                        >
                          View Case
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
