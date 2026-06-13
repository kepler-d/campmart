import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMessages, saveMessages } from '../db';

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

  // Sync threads and select active conversation
  useEffect(() => {
    const fetchInitialData = async () => {
      const dbThreads = await getMessages();
      setThreads(dbThreads);

      const params = new URLSearchParams(location.search);
      const urlThreadId = params.get('threadId');
      if (urlThreadId && dbThreads.some(t => t.threadId === urlThreadId)) {
        setActiveThreadId(urlThreadId);
      } else if (dbThreads.length > 0) {
        setActiveThreadId(dbThreads[0].threadId);
      }
    };
    fetchInitialData();
  }, [location.search]);

  // Sync messages on dynamic triggers
  useEffect(() => {
    const handleMessagesUpdate = async () => {
      setThreads(await getMessages());
    };
    window.addEventListener('messagesUpdated', handleMessagesUpdate);
    return () => window.removeEventListener('messagesUpdated', handleMessagesUpdate);
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

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || !activeThreadId) return;

    const updatedThreads = threads.map(t => {
      if (t.threadId === activeThreadId) {
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...t,
          messages: [...t.messages, { sender: 'me', text, time: timeString }]
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    saveMessages(updatedThreads); // Let it fire and forget
    setInputMessage('');

    // Simulate Typing Auto-Responder
    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      const replies = [
        "Yeah, sounds perfect! See you then.",
        "Awesome! I will check the fit and let you know.",
        "Does 4:00 PM work for you instead?",
        "Sounds good, I'll bring the charger too.",
        "Perfect, thanks! See you on campus."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const currentThreads = await getMessages();
      const threadsAfterReply = currentThreads.map(t => {
        if (t.threadId === activeThreadId) {
          const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...t,
            messages: [...t.messages, { sender: 'them', text: randomReply, time: timeString }]
          };
        }
        return t;
      });

      setThreads(threadsAfterReply);
      saveMessages(threadsAfterReply);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations
  const filteredThreads = threads.filter(t =>
    t.senderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              
              const initials = thread.senderName
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
                      {thread.senderAvatar ? (
                        <img alt={thread.senderName} className="w-full h-full object-cover" src={thread.senderAvatar} />
                      ) : (
                        initials
                      )}
                    </div>
                    {onlineTag}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-baseline mb-xs">
                      <h3 className={`font-label-md text-label-md ${isActive ? 'font-bold text-primary' : 'font-medium text-on-surface'} truncate`}>
                        {thread.senderName}
                      </h3>
                      <span className={`font-label-sm text-label-sm shrink-0 ${isActive ? 'text-primary font-semibold' : 'text-outline'}`}>
                        {lastMsgTime}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant truncate text-sm">
                      {lastMsgText}
                    </p>
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
          <>
            {/* Chat Header */}
            <header className="h-[88px] px-lg border-b border-outline-variant/20 flex items-center justify-between bg-surface/80 backdrop-blur-xl z-20 shrink-0">
              <div className="flex items-center gap-md">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-surface-container-high text-on-surface-variant font-headline-md text-headline-md border border-outline-variant/20">
                    {activeThread.senderAvatar ? (
                      <img alt={activeThread.senderName} className="w-full h-full object-cover" src={activeThread.senderAvatar} />
                    ) : (
                      activeThread.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)
                    )}
                  </div>
                  {activeThread.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-secondary border-2 border-surface rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface leading-none mb-1 font-bold">
                    {activeThread.senderName}
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
                  onClick={() => alert(`Initiating mock voice call to ${activeThread.senderName}...`)}
                  className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined">call</span>
                </button>
                <button 
                  onClick={() => alert("Options: Report User, Block User, Clear Chat History.")}
                  className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
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
                const isMe = msg.sender === 'me';
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
                        {activeThread.senderAvatar ? (
                          <img alt={activeThread.senderName} className="w-full h-full object-cover" src={activeThread.senderAvatar} />
                        ) : (
                          activeThread.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)
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
                  className="flex-grow bg-transparent border-none focus:ring-0 resize-none font-body-md text-body-md text-on-surface py-3 px-2 max-h-[120px] outline-none placeholder:text-outline-variant border-0" 
                  placeholder="Type a message..." 
                  rows="1" 
                  style={{ minHeight: "44px" }}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                
                {/* Send button */}
                <button 
                  onClick={() => handleSendMessage()}
                  className="w-10 h-10 flex-shrink-0 rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center text-on-primary transition-colors shadow-sm mb-1 ml-1 border-0 cursor-pointer active:scale-95 duration-100"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>
                    send
                  </span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[64px] mb-4">chat</span>
            <p className="font-headline-md text-headline-md text-on-surface-variant font-semibold">
              No active conversations
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
