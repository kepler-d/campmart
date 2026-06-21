import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMessages, getProfile, getOtherProfile, markThreadAsRead, createChatReport } from '../db';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
  const threadEndRef = useRef(null);

  // State
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [participantProfiles, setParticipantProfiles] = useState({});
  
  // Report State
  const [showOptions, setShowOptions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Abusive Language');

  useEffect(() => {
    getProfile().then(setCurrentUser);
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      let newProfiles = { ...participantProfiles };
      let changed = false;
      for (const thread of threads) {
        const otherEmail = thread.participants?.find(e => e !== currentUser?.email);
        if (otherEmail && !newProfiles[otherEmail]) {
          const profile = await getOtherProfile(otherEmail);
          if (profile) {
            newProfiles[otherEmail] = profile;
            changed = true;
          }
        }
      }
      if (changed) setParticipantProfiles(newProfiles);
    };
    if (threads.length > 0 && currentUser?.email) {
      fetchProfiles();
    }
  }, [threads, currentUser]);

  // Sync threads and select active conversation
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!currentUser?.email) return;
      const dbThreads = await getMessages(currentUser.email);
      setThreads(dbThreads);

      const params = new URLSearchParams(location.search);
      const urlThreadId = params.get('threadId');
      if (urlThreadId && dbThreads.some(t => t.threadId === urlThreadId)) {
        setActiveThreadId(urlThreadId);
      } else if (dbThreads.length > 0) {
        setActiveThreadId(dbThreads[0].threadId);
      }
    };
    if (currentUser?.email) {
      fetchInitialData();
    }
  }, [location.search, currentUser]);

  // Sync messages on dynamic triggers
  useEffect(() => {
    const handleMessagesUpdate = async () => {
      if (currentUser?.email) {
        setThreads(await getMessages(currentUser.email));
      }
    };
    window.addEventListener('messagesUpdated', handleMessagesUpdate);
    
    // Socket.io listener
    const handleReceiveMessage = (data) => {
      setThreads(prevThreads => prevThreads.map(t => {
        if (t.threadId === data.threadId) {
          return {
            ...t,
            messages: [...t.messages, { sender: data.sender, text: data.text, time: data.time }]
          };
        }
        return t;
      }));
    };
    
    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      window.removeEventListener('messagesUpdated', handleMessagesUpdate);
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, []);

  const activeThread = threads.find(t => t.threadId === activeThreadId);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages?.length, isTyping]);

  useEffect(() => {
    if (activeThreadId && currentUser?.email) {
      const activeT = threads.find(t => t.threadId === activeThreadId);
      if (activeT && activeT.unreadCount && activeT.unreadCount[currentUser.email] > 0) {
        markThreadAsRead(activeThreadId, currentUser.email);
        setThreads(prev => prev.map(t => {
          if (t.threadId === activeThreadId) {
            return { ...t, unreadCount: { ...t.unreadCount, [currentUser.email]: 0 } };
          }
          return t;
        }));
      }
    }
  }, [activeThreadId, activeThread?.messages?.length, currentUser]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || !activeThreadId) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    socket.emit('sendMessage', {
      threadId: activeThreadId,
      sender: currentUser?.email,
      text,
      time: timeString,
      clientId: socket.id
    });

    setInputMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations
  const filteredThreads = threads.filter(t => {
    const otherEmail = t.participants?.find(e => e !== currentUser?.email);
    const otherProfile = otherEmail ? participantProfiles[otherEmail] : null;
    const fallbackName = otherEmail ? otherEmail.split('@')[0] : 'User';
    const displaySenderName = otherProfile?.name || fallbackName;
    return displaySenderName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-grow flex w-full h-[calc(100vh-72px)] bg-surface-container-lowest overflow-hidden">
      {/* Left Column: Chat List */}
      <section className="w-full md:w-[360px] flex-shrink-0 flex flex-col border-r border-outline-variant/30 bg-surface/50 backdrop-blur-md h-full z-10">
        
        {/* List Header */}
        <div className="px-md py-lg border-b border-outline-variant/20">
          <div className="flex justify-between items-center mb-md">
            <h2 className="font-headline-md text-headline-md text-on-surface font-black">Messages</h2>
            <button 
              onClick={() => alert("Start new message thread by tapping 'Message Seller' on a product detail page.")}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors border-0 cursor-pointer"
            >
              <span className="material-symbols-outlined">edit_square</span>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary/50 transition-shadow outline-none placeholder:text-outline-variant" 
              placeholder="Search conversations..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List Items */}
        <div id="chat-list" className="flex-grow overflow-y-auto no-scrollbar">
          {filteredThreads.length === 0 ? (
            <p className="text-center text-outline text-body-md py-8">No chats found</p>
          ) : (
            filteredThreads.map(thread => {
              const isActive = thread.threadId === activeThreadId;
              const bgClass = isActive 
                ? "bg-primary-container/10 border-l-4 border-primary" 
                : "border-l-4 border-transparent hover:bg-surface-container-low";
              const onlineTag = thread.online 
                ? <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-secondary border-2 border-surface rounded-full"></div> 
                : null;
              
              const lastMsg = thread.messages[thread.messages.length - 1];
              const lastMsgText = lastMsg ? lastMsg.text : 'No messages yet';
              const lastMsgTime = lastMsg ? lastMsg.time : '';
              
              const otherEmail = thread.participants?.find(e => e !== currentUser?.email);
              const otherProfile = otherEmail ? participantProfiles[otherEmail] : null;
              const fallbackName = otherEmail ? otherEmail.split('@')[0] : 'User';
              const displaySenderName = otherProfile?.name || fallbackName;
              const displaySenderAvatar = otherProfile?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${displaySenderName}`;
              
              const unreadCount = thread.unreadCount?.[currentUser?.email] || 0;
              const hasUnread = unreadCount > 0;

              const initials = displaySenderName
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2);

              return (
                <div 
                  key={thread.threadId}
                  onClick={() => navigate(`/messages?threadId=${thread.threadId}`)}
                  className={`flex items-center gap-md p-md cursor-pointer transition-colors ${bgClass}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/20 shadow-sm flex items-center justify-center bg-surface-container-high text-on-surface-variant font-bold">
                      {displaySenderAvatar ? (
                        <img alt={displaySenderName} className="w-full h-full object-cover" src={displaySenderAvatar} />
                      ) : (
                        initials
                      )}
                    </div>
                    {onlineTag}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-baseline mb-xs">
                      <h3 className={`font-label-md text-label-md ${isActive ? 'font-bold text-primary' : 'font-medium text-on-surface'} truncate`}>
                        {displaySenderName}
                      </h3>
                      <span className={`font-label-sm text-label-sm shrink-0 ${hasUnread ? 'text-primary font-bold' : (isActive ? 'text-primary font-semibold' : 'text-outline')}`}>
                        {lastMsgTime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className={`font-body-md text-body-md truncate text-sm ${hasUnread ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
                        {lastMsgText}
                      </p>
                      {hasUnread && (
                        <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Right Column: Active Chat Window */}
      <section className="flex flex-col flex-grow bg-surface-container-lowest relative h-full overflow-hidden">
        {activeThread ? (
          (() => {
            const otherEmail = activeThread.participants?.find(e => e !== currentUser?.email);
            const otherProfile = otherEmail ? participantProfiles[otherEmail] : null;
            const fallbackName = otherEmail ? otherEmail.split('@')[0] : 'User';
            const activeDisplayName = otherProfile?.name || fallbackName;
            const activeDisplayAvatar = otherProfile?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${activeDisplayName}`;
            return (
          <>
            {/* Chat Header */}
            <header className="h-[88px] px-lg border-b border-outline-variant/20 flex items-center justify-between bg-surface/80 backdrop-blur-xl z-20 shrink-0">
              <div className="flex items-center gap-md">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-surface-container-high text-on-surface-variant font-headline-md text-headline-md border border-outline-variant/20">
                    {activeDisplayAvatar ? (
                      <img alt={activeDisplayName} className="w-full h-full object-cover" src={activeDisplayAvatar} />
                    ) : (
                      activeDisplayName.split(' ').map(n => n[0]).join('').slice(0, 2)
                    )}
                  </div>
                  {activeThread.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-secondary border-2 border-surface rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface leading-none mb-1 font-bold">
                    {activeDisplayName}
                  </h2>
                  <span className="font-label-sm text-label-sm flex items-center gap-1">
                    {activeThread.online ? (
                      <span className="text-secondary font-semibold">Online</span>
                    ) : (
                      <span className="text-outline">Offline • Last active {activeThread.lastActive}</span>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-sm">
                <button 
                  onClick={() => alert(`Initiating mock voice call to ${activeDisplayName}...`)}
                  className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined">call</span>
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowOptions(!showOptions)}
                    className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                  {showOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant/30 rounded-xl shadow-lg z-50 py-2">
                      <button 
                        onClick={() => {
                          setShowOptions(false);
                          setShowReportModal(true);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-surface-container flex items-center gap-2 text-error cursor-pointer border-0 bg-transparent font-label-md"
                      >
                        <span className="material-symbols-outlined text-[20px]">flag</span>
                        Report Conversation
                      </button>
                      <button 
                        onClick={() => {
                          setShowOptions(false);
                          alert('Chat cleared locally.');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-surface-container flex items-center gap-2 text-on-surface cursor-pointer border-0 bg-transparent font-label-md"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                        Clear Chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Message Thread Area */}
            <div className="flex-1 overflow-y-auto p-lg flex flex-col gap-md bg-[#F9FAFB]">
              {/* Render Product Context Card */}
              {activeThread.productContext && (
                <div className="flex self-start mb-2 max-w-[80%]">
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-outline-variant/10 flex gap-4 w-full">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                      <img 
                        alt="Product" 
                        className="w-full h-full object-cover" 
                        src={activeThread.productContext.image || 'https://via.placeholder.com/80'} 
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="font-label-sm text-label-sm text-primary mb-1 uppercase tracking-wider font-semibold">Inquiry Context</span>
                      <h4 className="font-label-md text-label-md font-semibold text-on-surface line-clamp-1">{activeThread.productContext.title}</h4>
                      <p className="font-body-md text-body-md font-bold text-on-surface-variant mt-1">{activeThread.productContext.price}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat history list */}
              {activeThread.messages.map((msg, index) => {
                const isMe = msg.sender === currentUser?.email || (msg.sender === 'me' && currentUser?.name === 'Hardik');
                if (isMe) {
                  return (
                    <div key={index} className="flex items-end gap-2 self-end max-w-[75%] mt-sm">
                      <div className="bg-primary px-4 py-3 rounded-2xl rounded-br-sm shadow-sm">
                        <p className="font-body-md text-body-md text-on-primary leading-normal">{msg.text}</p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={index} className="flex items-end gap-2 self-start max-w-[75%] mt-sm">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mb-1 shadow-sm flex items-center justify-center border border-outline-variant/10 bg-surface-container-high font-bold text-xs text-on-surface-variant">
                        {activeDisplayAvatar ? (
                          <img alt={activeDisplayName} className="w-full h-full object-cover" src={activeDisplayAvatar} />
                        ) : (
                          activeDisplayName.split(' ').map(n => n[0]).join('').slice(0, 2)
                        )}
                      </div>
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-outline-variant/10">
                        <p className="font-body-md text-body-md text-on-surface leading-normal">{msg.text}</p>
                      </div>
                    </div>
                  );
                }
              })}

              {/* Typing Response bubble */}
              {isTyping && (
                <div className="flex items-end gap-2 self-start max-w-[75%] mt-sm">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mb-1 shadow-sm flex items-center justify-center border border-outline-variant/10 bg-surface-container-high font-bold text-xs text-on-surface-variant">
                    {activeThread.senderAvatar ? (
                      <img alt={activeThread.senderName} className="w-full h-full object-cover" src={activeThread.senderAvatar} />
                    ) : (
                      activeThread.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)
                    )}
                  </div>
                  <div className="bg-white px-4 py-4 rounded-2xl rounded-bl-sm shadow-sm border border-outline-variant/10 flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-outline-variant rounded-full typing-dot"></div>
                    <div className="w-2 h-2 bg-outline-variant rounded-full typing-dot"></div>
                    <div className="w-2 h-2 bg-outline-variant rounded-full typing-dot"></div>
                  </div>
                </div>
              )}

              <div ref={threadEndRef} />
            </div>

            {/* Input area */}
            <div className="p-md bg-white border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] shrink-0">
              <div className="flex items-end gap-sm bg-surface-container-low rounded-2xl p-2 border border-outline-variant/30 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                {/* Attach File Button */}
                <button 
                  onClick={() => alert("Upload media files, PDF receipts, or listing reference documents.")}
                  className="w-10 h-10 flex-shrink-0 rounded-xl hover:bg-surface-container flex items-center justify-center text-outline transition-colors mb-1 border-0 bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                
                {/* Text area */}
                <textarea 
                  disabled={activeThread.messages.length >= 20}
                  className={`flex-grow bg-transparent border-none focus:ring-0 resize-none font-body-md text-body-md text-on-surface py-3 px-2 max-h-[120px] outline-none border-0 ${activeThread.messages.length >= 20 ? 'placeholder:text-error cursor-not-allowed' : 'placeholder:text-outline-variant'}`} 
                  placeholder={activeThread.messages.length >= 20 ? "Message limit reached. Please complete handover." : "Type a message..."}
                  rows="1" 
                  style={{ minHeight: "44px" }}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                
                {/* Send button */}
                <button 
                  disabled={activeThread.messages.length >= 20}
                  onClick={() => handleSendMessage()}
                  className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors shadow-sm mb-1 ml-1 border-0 ${activeThread.messages.length >= 20 ? 'bg-surface-variant text-outline cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-on-primary cursor-pointer active:scale-95 duration-100'}`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>
                    send
                  </span>
                </button>
              </div>
            </div>
          </>
            );
          })()
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[64px] mb-4">chat</span>
            <p className="font-headline-md text-headline-md text-on-surface-variant font-semibold">
              No active conversations
            </p>
          </div>
        )}
      </section>

      {/* Report Modal */}
      {showReportModal && activeThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-3xl p-6 md:p-8 max-w-[400px] w-full shadow-lg border border-outline-variant/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center text-2xl font-bold shrink-0">
                <span className="material-symbols-outlined">flag</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Report Conversation</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Report this chat to admins.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-label-md font-semibold text-on-surface mb-2">Select Reason</label>
                <div className="grid grid-cols-1 gap-2">
                  {['Abusive Language', 'Spam / Scam', 'Inappropriate Content', 'Other'].map(reason => (
                    <label key={reason} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${reportReason === reason ? 'border-primary bg-primary-container/20 text-on-surface font-semibold' : 'border-outline-variant/30 text-on-surface hover:bg-surface-container'}`}>
                      <input 
                        type="radio" 
                        name="chatReportReason"
                        className="hidden" 
                        checked={reportReason === reason} 
                        onChange={() => setReportReason(reason)} 
                      />
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${reportReason === reason ? 'border-primary' : 'border-outline'}`}>
                        {reportReason === reason && <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>}
                      </span>
                      {reason}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-outline-variant/20">
              <button 
                onClick={() => setShowReportModal(false)}
                className="px-6 py-2.5 rounded-full font-label-lg font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer border-none bg-transparent"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    const otherEmail = activeThread.participants?.find(e => e !== currentUser?.email);
                    await createChatReport({
                      threadId: activeThread.threadId,
                      reporterEmail: currentUser.email,
                      reportedUserEmail: otherEmail || 'Unknown',
                      reason: reportReason
                    });
                    setShowReportModal(false);
                    alert("Report submitted successfully. Admins will review the conversation.");
                  } catch (err) {
                    alert("Failed to submit report. Please try again later.");
                  }
                }}
                className="px-6 py-2.5 rounded-full font-label-lg font-bold bg-error hover:bg-error/90 text-on-error transition-colors shadow-sm cursor-pointer border-none"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
