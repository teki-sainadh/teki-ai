import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Send, Menu, Plus, Settings, PanelLeftClose, Trash2, MessageSquare, Heart, Flame, GraduationCap, Paperclip, X, Image as ImageIcon, SquarePen, Search, ArrowUp, Sun, Moon } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import Onboarding from './Onboarding';
import SettingsPage from './components/SettingsPage';
import MessageItem from './components/MessageItem';
import LoadingAnimation from './components/LoadingAnimation';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message, ChatSession } from './types';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // App UI State
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Only auto-close on mobile, never auto-open
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsView, setSettingsView] = useState<'main' | 'appearance' | 'profile' | 'data'>('main');
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Modes
  type Mode = 'normal' | 'love' | 'roast' | 'study';
  const [activeMode, setActiveMode] = useState<Mode>('normal');

  // Image Upload
  const [selectedImage, setSelectedImage] = useState<{ preview: string; data: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // User info
  const [displayName, setDisplayName] = useState('User');
  const [firstName, setFirstName] = useState('User');
  
  // Modals
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sidebarImgError, setSidebarImgError] = useState(false);

  // Chat Data
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const getLoveGreetings = (name: string) => [
    `hi ${name}. missed you. 💕`,
    `you again, ${name}. my favorite person. 💕`,
    `look who showed up, ${name}. 💕`,
    `i was just thinking about you, ${name}. 💕`,
    `hey ${name}. you okay? 💕`,
    `finally ${name}. i was waiting. 💕`
  ];
  
  const getRoastGreetings = (name: string) => [
    `oh great. ${name}'s back. 🔥`,
    `took you long enough, ${name}. 🔥`,
    `what disaster brought you here, ${name}. 🔥`,
    `ah yes. my favorite mistake, ${name}. 🔥`,
    `say something ${name}. i need a laugh. 🔥`,
    `brace yourself ${name}. i'm not being nice today. 🔥`
  ];

  const [loveGreeting, setLoveGreeting] = useState('');
  const [roastGreeting, setRoastGreeting] = useState('');

  useEffect(() => {
    if (messages.length === 0) {
      const love = getLoveGreetings(firstName);
      const roast = getRoastGreetings(firstName);
      setLoveGreeting(love[Math.floor(Math.random() * love.length)]);
      setRoastGreeting(roast[Math.floor(Math.random() * roast.length)]);
    }
  }, [currentSessionId, activeMode, messages.length, firstName]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const targetTextRef = useRef('');
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Edit Message
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Ensure plus menu is closed on mount
  useEffect(() => {
    setIsPlusMenuOpen(false);
  }, []);

  // Handle Auth
  useEffect(() => {
    console.log('Initializing Auth context...');
    const timeout = setTimeout(() => {
      if (authLoading) {
        console.warn('Auth state check timed out after 10s. Forcing loading state to false.');
        setAuthLoading(false);
      }
    }, 10000);

    const unsub = onAuthStateChanged(auth, (u) => {
      console.log('Auth state changed:', u ? u.uid : 'no user');
      clearTimeout(timeout);
      setUser(u);
      setAuthLoading(false);
      if (u) {
        const fullDisplayName = localStorage.getItem('teki_user_name') || u.displayName;
        setDisplayName(fullDisplayName || 'User');
        
        let fName = 'User';
        if (fullDisplayName) {
          fName = fullDisplayName.split(' ')[0];
        } else if (u.email) {
          const emailPrefix = u.email.split('@')[0];
          // Take everything before any dot or number
          const match = emailPrefix.match(/^[a-zA-Z]+/);
          if (match) {
            fName = match[0];
          } else {
            fName = emailPrefix;
          }
        }
        
        // Clean name: remove numbers, capitalize first letter
        fName = fName.replace(/[0-9]/g, '');
        if (fName) {
          fName = fName.charAt(0).toUpperCase() + fName.slice(1).toLowerCase();
        } else {
          fName = 'User';
        }
        
        setFirstName(fName);
      }
    }, (error) => {
      console.error('Auth state error:', error);
      clearTimeout(timeout);
      setAuthLoading(false);
    });
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, []);

  // Theme Logic
  useEffect(() => {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#ffffff';
    }
  }, [theme]);

  // Load Sessions
  useEffect(() => {
    if (!user) return;
    try {
      const q = query(collection(db, 'users', user.uid, 'sessions'), orderBy('updatedAt', 'desc'));
      let isFirstSnapshot = true;
      const unsub = onSnapshot(q, (snap) => {
        const loaded: ChatSession[] = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as ChatSession));
        setSessions(loaded);
        
        // Auto-select session:
        // REMOVED: Auto-selection on mount as per user request to always start fresh.
        // We only set isFirstSnapshot to false now.
        if (isFirstSnapshot) {
          isFirstSnapshot = false;
        }
      }, (error) => {
        // Only report if it's not a permission error initially during auth transition
        if (user) {
          handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/sessions`);
        }
      });
      return unsub;
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const createNewSession = async () => {
    if (!user) return;
    try {
      const ref = await addDoc(collection(db, `users/${user.uid}/sessions`), {
        title: 'New Chat',
        messages: [],
        updatedAt: serverTimestamp()
      });
      setCurrentSessionId(ref.id);
      setMessages([]); // Clear messages immediately
      setIsPlusMenuOpen(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/sessions`);
    }
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages || []);
    setIsPlusMenuOpen(false);
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/sessions`, id));
      if (currentSessionId === id) {
        setMessages([]);
        setCurrentSessionId(null);
        // The next snapshot will trigger selecting the top session if sessions still exist
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/sessions/${id}`);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Handle click outside plus menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setIsPlusMenuOpen(false);
      }
    };

    if (isPlusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPlusMenuOpen]);

  const generateTitle = (text: string) => {
    const greetings = ['hi', 'hii', 'hiii', 'hello', 'hey', 'sup'];
    const cleanText = text.trim().toLowerCase();
    if (text.length < 5 || greetings.includes(cleanText)) {
      return 'New Chat';
    }
    return text.slice(0, 28);
  };

  const getDisplayTitle = (s: ChatSession) => {
    if (s.title && s.title !== 'New Chat' && s.title !== 'New conversation') {
      // If it's already a meaningful title (not a greeting/short one), respect it,
      // but still re-run through generateTitle to apply length constraints if it was 'hiii' before
      return generateTitle(s.title);
    }
    
    if (s.messages && s.messages.length > 0) {
      const firstUserMsg = s.messages.find(m => m.role === 'user');
      if (firstUserMsg) {
        return generateTitle(firstUserMsg.text);
      }
    }
    return 'New Chat';
  };

  const sendMessage = async (overrideText?: string) => {
    const text = overrideText || inputValue;
    if ((!text.trim() && !selectedImage) || !user) return;
    
    let sessionId = currentSessionId;
    const currentMsgs = [...messages];
    const imageToSend = selectedImage;
    
    // 1. Optimistic UI update: Clear input and show user message immediately
    setInputValue('');
    setSelectedImage(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
      imageUrls: imageToSend ? [imageToSend.preview] : []
    };

    const newMsgs = [...currentMsgs, userMessage];
    setMessages(newMsgs);
    setIsLoading(true);
    setStreamingText('');
    targetTextRef.current = '';

    try {
      // 2. Handle session creation in background if needed
      let sessionPromise: Promise<string> | null = null;
      if (!sessionId) {
        sessionPromise = addDoc(collection(db, `users/${user.uid}/sessions`), {
          title: generateTitle(text),
          messages: [],
          updatedAt: serverTimestamp()
        }).then(ref => {
          sessionId = ref.id;
          setCurrentSessionId(sessionId);
          return sessionId;
        }).catch(e => {
          handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/sessions`);
          throw e;
        });
      }
      
      const responsePromise = (async () => {
        const greetings = ["hi", "hello", "hey", "how are you", "what are you doing", "good morning", "thanks", "ok", "yes", "no", "greetings", "sup"];
        const isImage = !!imageToSend || /image|photo|picture|draw|generate|show me|describe this|what is this|look at this/i.test(text);
        const words = text.trim().split(/\s+/).length;
        const isCasual = (words < 4) || (words < 8 && greetings.some(g => text.toLowerCase().includes(g)));
        
        // Use gemini-3-flash-preview for everything for stability
        const modelName = "gemini-3-flash-preview";

        console.log("Requesting directly with model:", modelName);
        
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("VITE_GEMINI_API_KEY is not defined in environment variables");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const genModel = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: getSystemPrompt()
        });

        const history = currentMsgs.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

        const chat = genModel.startChat({
          history: history,
        });

        const result = await chat.sendMessageStream(
          imageToSend 
            ? [{ text }, { inlineData: { data: imageToSend.data, mimeType: imageToSend.mimeType } }]
            : text
        );

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            targetTextRef.current += chunkText;
          }
        }
        
        return { ok: true };
      })();

      // Simulation logic
      let streamFinished = false;

      responsePromise.then(() => {
        streamFinished = true;
      });

      let displayedChars = 0;
      let hasStartedStreaming = false;

      const simulationInterval = setInterval(() => {
        if (displayedChars < targetTextRef.current.length) {
          if (!hasStartedStreaming) {
            hasStartedStreaming = true;
            setIsStreaming(true);
          }
          displayedChars++;
          setStreamingText(targetTextRef.current.slice(0, displayedChars));
        } else if (streamFinished) {
          clearInterval(simulationInterval);
          // Start fade out of the leader spinner
          setIsLoading(false);
          setTimeout(() => {
            finalizeMessage();
          }, 300);
        }
      }, 8);

      const finalizeMessage = async () => {
        const finalText = targetTextRef.current;
        const botMessage: Message = {
          id: Date.now().toString(),
          role: 'bot',
          text: finalText,
          timestamp: new Date().toISOString(),
          isStreaming: false
        };
        const finalMessages = [...newMsgs, botMessage];
        setMessages(finalMessages);
        setIsStreaming(false);
        setStreamingText('');
        
        if (sessionPromise) await sessionPromise;
        const currentId = sessionId || currentSessionId;
        if (currentId) {
          const updateData: any = {
            messages: finalMessages,
            updatedAt: serverTimestamp()
          };
          if (currentMsgs.length === 0) {
            updateData.title = generateTitle(text);
          }
          await updateDoc(doc(db, `users/${user.uid}/sessions`, currentId), updateData);
        }
      };

      await responsePromise;
      streamFinished = true;
      
      // If we finished the stream but targetText was empty (unlikely but possible)
      if (targetTextRef.current === "" && !hasStartedStreaming) {
        setIsLoading(false);
        finalizeMessage();
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setIsStreaming(false);
      const errBotMessage: Message = {
        id: Date.now().toString(),
        role: 'bot',
        text: err instanceof Error ? `Error: ${err.message}` : 'Sorry, I encountered an error.',
        timestamp: new Date().toISOString()
      };
      setMessages([...newMsgs, errBotMessage]);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditMessage = (id: string, text: string) => {
    setEditingMessageId(id);
    setEditInput(text);
  };

  const submitEdit = () => {
    if (!editingMessageId) return;
    const msgIndex = messages.findIndex(m => m.id === editingMessageId);
    if (msgIndex === -1) return;
    const previousMessages = messages.slice(0, msgIndex);
    setMessages(previousMessages);
    setInputValue(editInput);
    setEditingMessageId(null);
  };

  const onRetry = () => {
    if (messages.length >= 2) {
      const prevMessage = messages[messages.length - 2];
      const previousMessages = messages.slice(0, messages.length - 2);
      setMessages(previousMessages);
      setInputValue(prevMessage.text);
    }
  };

  const handleModeChange = (mode: Mode) => {
    if (activeMode === mode) {
      setActiveMode('normal');
    } else {
      setActiveMode(mode);
    }
    // "Switching mode clears the current chat messages"
    setMessages([]);
  };

  const getSystemPrompt = () => {
    const basePrompt = `You are Teki, a smart and helpful AI assistant. Follow these response length rules strictly:

- Greetings and casual chat (hi, hello, how are you, thanks, ok): 1-2 sentences MAX
- Simple factual questions (what is X, who is Y): 2-4 sentences
- Technical or complex questions (explain X, how does Y work, code for Z): Give a FULL detailed answer with examples, steps, and explanation. Never cut short on technical topics.
- Code requests: Always provide complete working code with explanation
- Always refer to the user by their first name: ${firstName}`;

    switch (activeMode) {
      case 'love': return `${basePrompt}

Additional Mode Rule: You are currently in Love Mode. Be warm, romantic and sweet but still follow the length rules above. End every message with ♥`;
      case 'roast': return `${basePrompt}

Additional Mode Rule: You are currently in Roast Mode. Roast the user in 1-2 savage, witty sentences max for casual chat, or more for complex requests. End every message with 🔥`;
      case 'study': return `${basePrompt}

Additional Mode Rule: You are currently in Study Mode. Act like a world-class tutor. Break down topics clearly with examples and encourage the user.`;
      default: return basePrompt;
    }
  };

  const getInputPlaceholder = () => {
    switch (activeMode) {
      case 'love': return "Share what's on your heart…";
      case 'roast': return "Say something. I dare you…";
      case 'study': return "Ask me anything to learn…";
      default: return "Ask me anything...";
    }
  };

  const getSuggestions = () => {
    switch (activeMode) {
      case 'love': return ["Tell me something sweet", "Write me a love poem", "How do I express my feelings?", "Compliment me"];
      case 'roast': return ["Roast my life choices", "Roast my outfit idea", "Roast my business idea", "Say something savage"];
      case 'study': return ["Explain photosynthesis", "Help me with calculus", "Quiz me on history", "Explain like I'm 10"];
      default: return ["What can you help me with?", "Explain quantum computing", "Write a professional email", "Help me debug my code"];
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const data = base64.split(',')[1];
      setSelectedImage({
        preview: base64,
        data: data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setUser(null);
      setShowLogoutConfirm(false);
      setIsSettingsOpen(false);
    });
  };

  const handleAccountDelete = async () => {
    if (auth.currentUser) {
      try {
        await deleteUser(auth.currentUser);
        setUser(null);
        setShowDeleteConfirm(false);
        setIsSettingsOpen(false);
      } catch (err) {
        alert("Failed to delete account. Please login again to do this.");
      }
    }
  };

  if (authLoading) return <div className="h-screen w-full bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-main)]">Loading...</div>;
  if (!user) return <Onboarding onContinue={setUser} />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 font-sans">
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        animate={{ 
          width: isSidebarOpen ? (isMobile ? 260 : 240) : 0, 
          opacity: isSidebarOpen ? 1 : 0,
          x: isSidebarOpen ? 0 : -20 
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'flex-shrink-0'} bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col overflow-hidden`}
      >
        {/* Top Section */}
        <div className={`p-[12px] flex flex-col gap-3 ${isMobile ? 'min-w-[260px]' : 'min-w-[240px]'} shrink-0`}>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-black dark:text-white hover:bg-[var(--border-color)] transition-all"
              title="Hide Sidebar"
            >
              <PanelLeftClose size={20} strokeWidth={1.5} />
            </button>
            <button 
              onClick={createNewSession}
              className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-black dark:text-white hover:bg-[var(--border-color)] transition-all"
              title="New Chat"
            >
              <SquarePen size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg py-1.5 pl-9 pr-3 text-[13px] outline-none transition-all focus:border-black dark:focus:border-white"
              style={{ color: 'var(--text-main)' }}
            />
          </div>
        </div>
        
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 custom-scrollbar min-w-[240px]">
          {sessions
            .filter(s => (s.title || 'New conversation').toLowerCase().includes(searchQuery.toLowerCase()))
            .map(s => (
            <div 
              key={s.id} 
              className={`group flex items-center justify-between px-[10px] py-[8px] rounded-md transition-colors cursor-pointer ${currentSessionId === s.id ? 'bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-main)]/50' }`}
              onClick={() => loadSession(s)}
              style={{ cursor: 'pointer' }}
            >
              <div className="flex-1 min-w-0">
                  <p 
                    className={`text-[13px] truncate ${currentSessionId === s.id ? 'font-medium' : 'font-normal'}`}
                    style={{ color: 'var(--text-main)' }}
                  >
                    {getDisplayTitle(s)}
                  </p>
              </div>
              <button 
                onClick={(e) => deleteSession(e, s.id)} 
                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-1"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Section - Pinned Bottom */}
        <div className="p-[12px] border-t border-[var(--border-color)] bg-[var(--bg-sidebar)] min-w-[240px] flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2.5">
            {user?.photoURL && !sidebarImgError ? (
              <img 
                src={user.photoURL} 
                alt={firstName} 
                className="w-8 h-8 rounded-full border border-[var(--border-color)] object-cover"
                referrerPolicy="no-referrer"
                onError={() => setSidebarImgError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[11px] font-medium text-[var(--text-main)]">
                {firstName.charAt(0)}
              </div>
            )}
            <span 
              className="text-[13px] font-light"
              style={{ color: 'var(--text-main)' }}
            >
              {firstName} <span className="text-[10px] opacity-40 ml-1">v1.2</span>
            </span>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 text-black dark:text-white transition-colors"
          >
            <Settings size={18} strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative bg-[var(--bg-main)] no-scrollbar overflow-hidden">
        
        {/* Decorative elements for modes */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <AnimatePresence>
            {activeMode === 'love' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {[
                  { left: '10%', size: 16, delay: 0, duration: 8 },
                  { left: '25%', size: 20, delay: 2, duration: 11 },
                  { left: '45%', size: 14, delay: 4, duration: 14 },
                  { left: '65%', size: 18, delay: 6, duration: 9 },
                  { left: '80%', size: 12, delay: 8, duration: 12 }
                ].map((heart, i) => (
                  <div 
                    key={`heart-new-${i}`}
                    className="absolute bottom-[-30px] text-[#ff6b8a] animate-float-heart"
                    style={{ 
                      left: heart.left, 
                      fontSize: `${heart.size}px`,
                      animationDelay: `${heart.delay}s`,
                      animationDuration: `${heart.duration}s`,
                      opacity: 0.25
                    }}
                  >
                    ♥
                  </div>
                ))}
              </motion.div>
            )}
            {activeMode === 'roast' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {[
                  { left: '12%', delay: 0, duration: 7 },
                  { left: '30%', delay: 1.5, duration: 10 },
                  { left: '50%', delay: 3, duration: 13 },
                  { left: '70%', delay: 4.5, duration: 8 },
                  { left: '88%', delay: 6, duration: 11 }
                ].map((ember, i) => (
                  <div 
                    key={`ember-new-${i}`}
                    className="absolute bottom-[-20px] animate-float-ember"
                    style={{ 
                      left: ember.left,
                      animationDelay: `${ember.delay}s`,
                      animationDuration: `${ember.duration}s`,
                      color: '#ff5500',
                      opacity: 0.3
                    }}
                  >
                    <div className="w-[5px] h-[5px] bg-[#ff5500] rounded-full shadow-[0_0_8px_#ff5500]" />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Header Bar */}
        <header className={`${isMobile ? 'h-[50px] px-4' : 'h-[60px] px-6'} flex items-center justify-between shrink-0 bg-[var(--bg-main)]/80 backdrop-blur-md z-10 w-full`}>
          <div className="flex items-center gap-4">
            {(isMobile || !isSidebarOpen) && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-8 h-8 rounded-full bg-[var(--bg-sidebar)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                title="Open sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 pt-4 pb-2' : 'px-4 sm:px-6 md:px-8 pt-6 pb-24'} no-scrollbar chat-messages`} style={{ paddingBottom: '120px' }}>
          <div className="max-w-[760px] mx-auto w-full flex flex-col">
            {messages.length === 0 ? (
              <div className={`flex flex-col items-start justify-center ${isMobile ? 'mt-10' : 'mt-20'} animate-fade-up`}>
                <h2 
                  className={`${isMobile ? 'text-[24px]' : 'text-[40px]'} font-light tracking-tight leading-loose mb-10 mode-transition`}
                  style={{ 
                    color: activeMode === 'love' ? (isDarkMode ? '#fff5f5' : '#d7003a') : 
                           activeMode === 'roast' ? (isDarkMode ? '#ffffff' : '#f97316') : 
                           'var(--text-main)'
                  }}
                >
                  {activeMode === 'love' ? loveGreeting : 
                   activeMode === 'roast' ? roastGreeting : 
                   activeMode === 'study' ? `what are we learning today${firstName !== 'User' ? ', ' + firstName : ''}?` : 
                   `Hey ${firstName}! 👋 How's your day going?`}
                </h2>
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3 w-full`}>
                  {getSuggestions().map((suggestion, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        sendMessage(suggestion);
                      }}
                      className={`p-4 text-left rounded-xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] hover:bg-[var(--bg-sidebar)]/80 transition-all text-[13px] font-light`}
                      style={{ color: 'var(--text-main)' }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 md:gap-2">
                {messages.map((m, i) => {
                  const greetings = ["hi", "hello", "hey", "how are you", "what are you doing", "good morning", "thanks", "ok", "yes", "no", "greetings", "sup"];
                  
                  let speed: 'fast' | 'normal' | 'slow' = 'normal';
                  if (m.role === 'bot' && i > 0) {
                    const queryMsg = messages[i-1];
                    if (queryMsg && queryMsg.role === 'user') {
                      const isImage = (queryMsg.imageUrls && queryMsg.imageUrls.length > 0) || /image|photo|picture|draw|generate|show me|describe this|what is this|look at this/i.test(queryMsg.text);
                      const words = queryMsg.text.trim().split(/\s+/).length;
                      const isCasual = (words < 4) || (words < 8 && greetings.some(g => queryMsg.text.toLowerCase().includes(g)));

                      if (isImage) speed = 'slow';
                      else if (isCasual) speed = 'fast';
                    }
                  }

                  return (
                    <MessageItem
                      key={m.id}
                      message={m}
                      index={i}
                      messagesCount={messages.length}
                      editingMessageId={editingMessageId}
                      editInput={editInput}
                      setEditInput={setEditInput}
                      setEditingMessageId={setEditingMessageId}
                      submitEdit={submitEdit}
                      copyToClipboard={copyToClipboard}
                      copiedId={copiedId}
                      handleEditMessage={handleEditMessage}
                      isDarkMode={isDarkMode}
                      activeMode={activeMode}
                      onImageClick={() => {}}
                      onRetry={onRetry}
                      isMobile={isMobile}
                      speed={speed}
                    />
                  );
                })}
                
                {/* Loading/Streaming Message Bubble */}
                {(isLoading || isStreaming) && (
                  <div className="flex gap-3 w-full group message-final justify-start items-start">
                    <div className="flex flex-col min-w-0 max-w-[90%] md:max-w-full items-start flex-1 pt-1">
                      <div className="text-[16px] leading-[1.5] font-medium tracking-wide transition-colors duration-300 pt-1" style={{ color: 'var(--text-ai)' }}>
                        <div className="max-w-none min-w-0 break-words whitespace-pre-wrap font-medium flex items-center flex-wrap">
                          {!isStreaming && isLoading ? (
                            <div className="-ml-4">
                              <LoadingAnimation 
                                mode={activeMode} 
                                speed={(() => {
                                  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                                  if (!lastUserMsg) return 'normal';
                                  const greetings = ["hi", "hello", "hey", "how are you", "what are you doing", "good morning", "thanks", "ok", "yes", "no", "greetings", "sup"];
                                  const isImage = (lastUserMsg.imageUrls && lastUserMsg.imageUrls.length > 0) || /image|photo|picture|draw|generate|show me|describe this|what is this|look at this/i.test(lastUserMsg.text);
                                  const words = lastUserMsg.text.trim().split(/\s+/).length;
                                  const isCasual = (words < 4) || (words < 8 && greetings.some(g => lastUserMsg.text.toLowerCase().includes(g)));
                                  if (isImage) return 'slow';
                                  if (isCasual) return 'fast';
                                  return 'normal';
                                })()} 
                              />
                            </div>
                          ) : (
                            <>
                              <span className="inline">{streamingText}</span>
                              {isStreaming && (
                                <span 
                                  className="transition-opacity duration-300 pointer-events-none flex-shrink-0"
                                  style={{ 
                                    display: 'inline-flex',
                                    verticalAlign: 'middle',
                                    marginLeft: '6px',
                                    width: '48px',
                                    height: '48px',
                                    opacity: isLoading ? 1 : 0
                                  }}
                                >
                                  <LoadingAnimation 
                                    size={48}
                                    mode={activeMode} 
                                    speed={(() => {
                                      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                                      if (!lastUserMsg) return 'normal';
                                      const greetings = ["hi", "hello", "hey", "how are you", "what are you doing", "good morning", "thanks", "ok", "yes", "no", "greetings", "sup"];
                                      const isImage = (lastUserMsg.imageUrls && lastUserMsg.imageUrls.length > 0) || /image|photo|picture|draw|generate|show me|describe this|what is this|look at this/i.test(lastUserMsg.text);
                                      const words = lastUserMsg.text.trim().split(/\s+/).length;
                                      const isCasual = (words < 4) || (words < 8 && greetings.some(g => lastUserMsg.text.toLowerCase().includes(g)));
                                      if (isImage) return 'slow';
                                      if (isCasual) return 'fast';
                                      return 'normal';
                                    })()} 
                                  />
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className={`absolute bottom-0 w-full ${isMobile ? 'px-3 pb-2' : 'px-4 sm:px-8 pb-8'} pt-4 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/95 to-transparent flex justify-center`}>
          <div className="max-w-[680px] w-full flex flex-col gap-3">
            {/* Image Preview */}
            <AnimatePresence>
              {selectedImage && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-2 relative w-20 h-20 group"
                >
                  <img 
                    src={selectedImage.preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover rounded-lg border border-[var(--border-color)]"
                  />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-1.5 -right-1.5 bg-[var(--bg-sidebar)] border border-[var(--border-color)] text-[var(--text-main)] p-1 rounded-full hover:bg-[var(--bg-input)] transition-colors"
                  >
                    <X size={10} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex flex-col w-full items-center">
              <div 
                className={`relative flex flex-col transition-all duration-200 overflow-visible border focus-within:ring-1 focus-within:ring-[var(--text-secondary)]/20 ${
                  activeMode !== 'normal' ? 'rounded-[20px]' : 'rounded-[26px]'
                } bg-[var(--bg-input)] border-[var(--input-border)] shadow-lg w-full`}
                style={{
                  transition: 'all 0.2s ease'
                }}
              >
                {/* ROW 1: Mode Tag */}
                <AnimatePresence>
                  {activeMode !== 'normal' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="w-full overflow-hidden"
                    >
                      <div className={`w-full pt-2 px-3 pb-[10px] mt-0 mb-[20px] flex items-center border-b border-[var(--border-color)]`}>
                        <div 
                          className="flex items-center gap-[6px] px-[10px] py-[3px] rounded-full"
                          style={{
                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                            fontSize: '11px',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {activeMode === 'love' && <Heart size={11} strokeWidth={1.5} />}
                          {activeMode === 'roast' && <Flame size={11} strokeWidth={1.5} />}
                          {activeMode === 'study' && <GraduationCap size={11} strokeWidth={1.5} />}
                          <span className="capitalize">{activeMode} Mode</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleModeChange('normal');
                            }}
                            className={`ml-1 transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-main)]`}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                   )}
                </AnimatePresence>

                {/* ROW 2: Input Controls */}
                <div className="flex items-end p-2 pb-[7px] w-full relative">
                  {/* Plus Menu Popup */}
                  <AnimatePresence>
                    {isPlusMenuOpen && (
                      <motion.div 
                        ref={plusMenuRef}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-[calc(100%+8px)] left-[12px] bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-[10px] p-[6px] min-w-[200px] shadow-2xl z-50 overflow-hidden"
                      >
                      <button 
                        onClick={() => {
                          handleModeChange('love');
                          setIsPlusMenuOpen(false);
                        }}
                        className={`flex items-center gap-[10px] w-full p-[10px_14px] text-[13px] rounded-[8px] cursor-pointer transition-colors text-left ${activeMode === 'love' ? 'bg-[var(--text-main)] text-[var(--bg-main)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)]'}`}
                      >
                        <Heart size={15} strokeWidth={1.5} />
                        <span>Love Mode</span>
                      </button>
                      <button 
                        onClick={() => {
                          handleModeChange('roast');
                          setIsPlusMenuOpen(false);
                        }}
                        className={`flex items-center gap-[10px] w-full p-[10px_14px] text-[13px] rounded-[8px] cursor-pointer transition-colors text-left ${activeMode === 'roast' ? 'bg-[var(--text-main)] text-[var(--bg-main)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)]'}`}
                      >
                        <Flame size={15} strokeWidth={1.5} />
                        <span>Roast Mode</span>
                      </button>
                      <button 
                        onClick={() => {
                          handleModeChange('study');
                          setIsPlusMenuOpen(false);
                        }}
                        className={`flex items-center gap-[10px] w-full p-[10px_14px] text-[13px] rounded-[8px] cursor-pointer transition-colors text-left ${activeMode === 'study' ? 'bg-[var(--text-main)] text-[var(--bg-main)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)]'}`}
                      >
                        <GraduationCap size={15} strokeWidth={1.5} />
                        <span>Study Mode</span>
                      </button>
                      
                      <div className="h-[1px] bg-[var(--border-color)] my-1 mx-1" />

                      <button 
                        onClick={() => {
                          fileInputRef.current?.click();
                          setIsPlusMenuOpen(false);
                        }}
                        className="flex items-center gap-[10px] w-full p-[10px_14px] text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-input)] rounded-[8px] cursor-pointer transition-colors text-left"
                      >
                        <Paperclip size={15} strokeWidth={1.5} />
                        <span>Upload Image</span>
                      </button>
                    </motion.div>
                  )}
                  </AnimatePresence>

                  {/* Plus Button inside pill */}
                  <button 
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlusMenuOpen(!isPlusMenuOpen);
                    }}
                    className="w-[26px] h-[26px] rounded-full border flex items-center justify-center transition-colors flex-shrink-0 mb-1.5 ml-0.5"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      color: 'var(--text-secondary)'
                    }}
                    title="More options"
                  >
                    <Plus size={16} className={`transition-transform duration-200 ${isPlusMenuOpen ? 'rotate-45' : ''}`} />
                  </button>

                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <textarea 
                    value={inputValue}
                    onChange={e => {
                      setInputValue(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                        e.currentTarget.style.height = "40px";
                      }
                    }}
                    placeholder={getInputPlaceholder()}
                    className={`flex-1 max-h-[140px] min-h-[40px] bg-transparent resize-none outline-none py-2 px-3 text-[13px] font-light leading-relaxed no-scrollbar placeholder-[var(--text-secondary)]`}
                    style={{ fontSize: '16px', color: 'var(--text-main)' }}
                    rows={1}
                  />
                  <button 
                    onClick={() => {
                      sendMessage();
                      const textarea = document.querySelector('textarea');
                      if (textarea) (textarea as HTMLTextAreaElement).style.height = "40px";
                    }}
                    disabled={(!inputValue.trim() && !selectedImage) || isStreaming}
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 transition-all mb-1.5 shadow-sm border pl-[1px] ml-0 mr-[5px] ${
                      inputValue.trim() || selectedImage 
                        ? 'bg-[var(--text-main)] text-[var(--bg-main)] border-[var(--text-main)] hover:scale-[1.02] active:scale-[0.98]' 
                        : 'bg-[var(--text-main)]/10 text-[var(--text-main)]/30 border-[var(--border-color)]'
                    }`}
                  >
                    <ArrowUp size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsPage 
            isSettingsOpen={isSettingsOpen}
            setIsSettingsOpen={setIsSettingsOpen}
            settingsView={settingsView}
            setSettingsView={setSettingsView}
            theme={theme}
            setTheme={setTheme}
            displayName={displayName}
            setDisplayName={setDisplayName}
            user={user}
            isDarkMode={isDarkMode}
            showLogoutConfirm={showLogoutConfirm}
            setShowLogoutConfirm={setShowLogoutConfirm}
            showDeleteConfirm={showDeleteConfirm}
            setShowDeleteConfirm={setShowDeleteConfirm}
            handleSignOut={handleSignOut}
            deleteAccount={handleAccountDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

