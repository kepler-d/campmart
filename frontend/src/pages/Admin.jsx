import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCampusRequests, approveCampusRequest, getReports, updateReportStatus, getChatReports, updateChatReportStatus, getAdminThreadMessages } from '../db';

export default function Admin() {
  const [campusRequests, setCampusRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [chatReports, setChatReports] = useState([]);
  
  // Modal State for Chat History
  const [showChatHistoryModal, setShowChatHistoryModal] = useState(false);
  const [chatHistoryThread, setChatHistoryThread] = useState(null);

  useEffect(() => {
    getCampusRequests().then(setCampusRequests);
    getReports().then(setReports);
    getChatReports().then(setChatReports);
  }, []);

  const handleApproveCampus = async (id) => {
    try {
      await approveCampusRequest(id);
      setCampusRequests(prev => prev.map(req => req._id === id ? { ...req, status: 'Approved' } : req));
      alert("Campus Approved and Added to Allowed Domains!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApproveReport = async (id) => {
    try {
      const updatedReport = await updateReportStatus(id, 'approve');
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: updatedReport.report.status } : r));
    } catch (err) {
      alert('Failed to approve report');
    }
  };

  const handleDismissReport = async (id) => {
    try {
      const updatedReport = await updateReportStatus(id, 'dismiss');
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: updatedReport.report.status } : r));
    } catch (err) {
      alert('Failed to dismiss report');
    }
  };

  const handleResolveChatReport = async (id) => {
    try {
      const updatedReport = await updateChatReportStatus(id, 'resolve');
      setChatReports(prev => prev.map(r => r._id === id ? { ...r, status: updatedReport.report.status } : r));
    } catch (err) {
      alert('Failed to resolve chat report');
    }
  };

  const handleDismissChatReport = async (id) => {
    try {
      const updatedReport = await updateChatReportStatus(id, 'dismiss');
      setChatReports(prev => prev.map(r => r._id === id ? { ...r, status: updatedReport.report.status } : r));
    } catch (err) {
      alert('Failed to dismiss chat report');
    }
  };

  const handleViewChatHistory = async (threadId) => {
    const thread = await getAdminThreadMessages(threadId);
    if (thread) {
      setChatHistoryThread(thread);
      setShowChatHistoryModal(true);
    } else {
      alert("Failed to load chat history or thread does not exist.");
    }
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
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface font-black">₹24.5k</h3>
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
                  <tr key={report._id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-variant flex-shrink-0 overflow-hidden flex items-center justify-center text-outline">
                        {report.image ? (
                          <img alt={report.listingTitle} className="w-full h-full object-cover" src={report.image}/>
                        ) : (
                          <span className="material-symbols-outlined">person</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface line-clamp-1">{report.listingTitle}</p>
                        <p className="text-label-sm text-outline">ID: #{report.listingId}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
                          {report.reporterEmail[0].toUpperCase()}
                        </div>
                        <span>{report.reporterEmail}</span>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      <p className="font-semibold">{report.reason}</p>
                      {report.description && <p className="text-xs text-outline line-clamp-2 mt-1">{report.description}</p>}
                    </td>
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
                          <Link 
                            to={`/product/${report.listingId}`}
                            className="p-2 rounded-lg text-primary border-0 bg-transparent hover:bg-primary-container/20 transition-all cursor-pointer active:scale-90 flex items-center justify-center" 
                            title="View Reported Listing"
                            target="_blank"
                          >
                            <span className="material-symbols-outlined text-[20px] font-bold">visibility</span>
                          </Link>
                          <button 
                            onClick={() => handleApproveReport(report._id)}
                            className="p-2 rounded-lg text-secondary border-0 bg-transparent hover:bg-secondary-container/20 transition-all cursor-pointer active:scale-90" 
                            title="Approve Report (Remove Listing)"
                          >
                            <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                          </button>
                          <button 
                            onClick={() => handleDismissReport(report._id)}
                            className="p-2 rounded-lg text-outline border-0 bg-transparent hover:bg-surface-container-high transition-all cursor-pointer active:scale-90" 
                            title="Reject Report (Keep Listing)"
                          >
                            <span className="material-symbols-outlined text-[20px] font-bold">close</span>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => alert(`Reviewing archived case history for ${report._id}`)}
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

      {/* Campus Access Requests Table */}
      <div className="mt-xl glass-card rounded-xl overflow-hidden shadow-sm mb-xl">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest/50">
          <h3 className="font-headline-md text-headline-md font-semibold text-on-surface font-bold">Campus Access Requests</h3>
          <span className="text-outline text-label-sm font-semibold">{campusRequests.filter(r => r.status === 'Pending').length} Pending</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                <th className="p-4 font-bold">Domain</th>
                <th className="p-4 font-bold">Institution Name</th>
                <th className="p-4 font-bold">Requested By</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
              {campusRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-on-surface-variant">No campus requests found.</td>
                </tr>
              ) : campusRequests.map((req) => (
                <tr key={req._id} className="hover:bg-surface-container-lowest/50 transition-colors">
                  <td className="p-4 font-semibold text-primary">{req.domain}</td>
                  <td className="p-4">{req.institutionName}</td>
                  <td className="p-4">{req.requesterEmail}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      req.status === 'Pending' 
                        ? 'bg-secondary-container/30 text-secondary' 
                        : 'bg-primary-container text-on-primary-container'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {req.status === 'Pending' ? (
                      <button 
                        onClick={() => handleApproveCampus(req._id)}
                        className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm shadow-sm cursor-pointer border-0 hover:bg-primary/95"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="text-outline text-sm">Added</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    {/* Flagged Conversations Table */}
      <div className="mt-xl glass-card rounded-xl overflow-hidden shadow-sm mb-xl">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest/50">
          <h3 className="font-headline-md text-headline-md font-semibold text-on-surface font-bold">Flagged Conversations</h3>
          <span className="text-outline text-label-sm font-semibold">{chatReports.filter(r => r.status === 'Pending').length} Pending Cases</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                <th className="p-4 font-bold">Reported By</th>
                <th className="p-4 font-bold">Reported User</th>
                <th className="p-4 font-bold">Reason</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
              {chatReports.map((report) => {
                const isPending = report.status === 'Pending';
                
                return (
                  <tr key={report._id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold">{report.reporterEmail}</p>
                    </td>
                    <td className="p-4 text-error font-semibold">
                      {report.reportedUserEmail}
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      <p className="font-semibold">{report.reason}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isPending 
                          ? 'bg-error-container/30 text-error' 
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
                            onClick={() => handleViewChatHistory(report.threadId)}
                            className="p-2 rounded-lg text-primary border-0 bg-transparent hover:bg-primary-container/20 transition-all cursor-pointer active:scale-90 flex items-center justify-center" 
                            title="View Chat History"
                          >
                            <span className="material-symbols-outlined text-[20px] font-bold">chat</span>
                          </button>
                          <button 
                            onClick={() => handleResolveChatReport(report._id)}
                            className="p-2 rounded-lg text-secondary border-0 bg-transparent hover:bg-secondary-container/20 transition-all cursor-pointer active:scale-90" 
                            title="Resolve Case (Warn User)"
                          >
                            <span className="material-symbols-outlined text-[20px] font-bold">gavel</span>
                          </button>
                          <button 
                            onClick={() => handleDismissChatReport(report._id)}
                            className="p-2 rounded-lg text-outline border-0 bg-transparent hover:bg-surface-container-high transition-all cursor-pointer active:scale-90" 
                            title="Dismiss Report"
                          >
                            <span className="material-symbols-outlined text-[20px] font-bold">close</span>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleViewChatHistory(report.threadId)}
                          className="text-primary hover:text-primary-fixed-dim font-label-md text-label-md transition-colors underline decoration-transparent hover:decoration-primary cursor-pointer border-0 bg-transparent"
                        >
                          View Transcript
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

      {/* Chat History Modal */}
      {showChatHistoryModal && chatHistoryThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-3xl overflow-hidden max-w-[600px] w-full shadow-lg border border-outline-variant/20 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">forum</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface leading-tight">Chat Transcript</h3>
                  <p className="text-label-sm text-outline">Thread ID: {chatHistoryThread.threadId}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowChatHistoryModal(false)}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center border-0 cursor-pointer text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow bg-surface-container-lowest">
              <div className="space-y-4">
                {chatHistoryThread.messages.length === 0 ? (
                  <p className="text-center text-outline">No messages in this thread.</p>
                ) : (
                  chatHistoryThread.messages.map((msg, i) => (
                    <div key={i} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="font-bold text-on-surface text-label-md">{msg.sender}</span>
                        <span className="text-label-sm text-outline">{msg.time}</span>
                      </div>
                      <p className="text-body-md text-on-surface whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-4 bg-surface border-t border-outline-variant/20 flex justify-end">
               <button 
                onClick={() => setShowChatHistoryModal(false)}
                className="px-6 py-2.5 rounded-full font-label-lg font-bold text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border-none"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
