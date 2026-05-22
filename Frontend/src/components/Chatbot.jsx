import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Trash2, Bot, Loader2, Package, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import chatbotAPI from "../../services/chatbot";
import { openSnackbar } from "../redux/snackbarSlice";
import { useDispatch } from "react-redux";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, myOrders } = useSelector((state) => state.user);
  
  const isHomePage = location.pathname === "/";

  // Only show chatbot for users
  if (!userData || userData.role !== "user") {
    return null;
  }

  // Show greeting bubble on home page after 5 seconds (only once)
  useEffect(() => {
    if (isHomePage && !isOpen) {
      const hasSeenGreeting = localStorage.getItem("chatbot_greeting_shown");
      if (!hasSeenGreeting) {
        const timer = setTimeout(() => {
          setShowGreeting(true);
          localStorage.setItem("chatbot_greeting_shown", "true");
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setShowGreeting(false);
    }
  }, [isHomePage, isOpen]);

  // Load chat history on open
  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      // Reset quick actions when chat closes
      setShowQuickActions(true);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const result = await chatbotAPI.getChatHistory();
      if (result.ok && result.data?.data?.history) {
        const history = result.data.data.history;
        const formattedMessages = history.map((msg, index) => ({
          id: `msg-${Date.now()}-${index}`,
          text: msg.parts?.[0]?.text || "",
          role: msg.role === "model" ? "assistant" : "user",
          timestamp: new Date(),
        }));
        setMessages(formattedMessages);
        // If there's history, hide quick actions
        if (formattedMessages.length > 0) {
          setShowQuickActions(false);
        }
      } else {
        // No history, show quick actions if not already in chat
        setShowQuickActions(true);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      // On error, show quick actions
      setShowQuickActions(true);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Format order status for display
  const formatOrderStatus = (orders) => {
    if (!orders || orders.length === 0) {
      return "You don't have any orders yet.";
    }

    let statusText = `Here are your recent orders:\n\n`;
    orders.slice(0, 5).forEach((order, index) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      const status = order.shopOrders?.[0]?.status || "Pending";
      statusText += `${index + 1}. Order #${order._id.slice(-6)}\n`;
      statusText += `   Status: ${status}\n`;
      statusText += `   Amount: ₹${order.totalAmount}\n`;
      statusText += `   Date: ${orderDate}\n\n`;
    });

    if (orders.length > 5) {
      statusText += `You have ${orders.length - 5} more orders. Visit "My Orders" to see all.`;
    }

    return statusText;
  };

  const handleQuickAction = async (action) => {
    if (action === "track") {
      setShowQuickActions(false);
      
      // Show order status in chat
      const userMessage = {
        id: `user-${Date.now()}`,
        text: "Where is my order?",
        role: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      setIsLoading(true);
      
      // Simulate loading
      setTimeout(() => {
        const orderStatus = formatOrderStatus(myOrders);
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          text: orderStatus,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
        scrollToBottom();
      }, 1000);

    } else if (action === "cancel") {
      setShowQuickActions(false);
      
      // Show cancel order message
      const userMessage = {
        id: `user-${Date.now()}`,
        text: "I want to cancel my order",
        role: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      setIsLoading(true);
      
      // Simulate connecting to team
      setTimeout(() => {
        const cancelMessage = `Please wait, we are connecting you to one of our team members who will guide you on whether the order can be cancelled or not.\n\nIn the meantime, you can also visit "My Orders" to see your orders and their cancellation eligibility.`;
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          text: cancelMessage,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
        scrollToBottom();
      }, 1500);

    } else if (action === "something-else") {
      setShowQuickActions(false);
      // Start AI chat - user can now type and AI will respond
      inputRef.current?.focus();
    }
  };

  const handleGreetingClick = () => {
    setShowGreeting(false);
    setIsOpen(true);
  };

  // Check if message is about order tracking
  const isOrderTrackingQuery = (message) => {
    const lowerMessage = message.toLowerCase();
    const trackingKeywords = [
      "where is my order",
      "order status",
      "track my order",
      "order location",
      "my order",
      "order update",
      "order delivery",
      "when will my order",
      "order progress"
    ];
    return trackingKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  // Check if message is about order cancellation
  const isOrderCancelQuery = (message) => {
    const lowerMessage = message.toLowerCase();
    const cancelKeywords = [
      "cancel order",
      "cancel my order",
      "want to cancel",
      "need to cancel",
      "order cancellation",
      "refund order"
    ];
    return cancelKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || isLoading) return;

    // Hide quick actions once user starts chatting
    if (showQuickActions) {
      setShowQuickActions(false);
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      text: trimmedMessage,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Check if it's an order tracking query
    if (isOrderTrackingQuery(trimmedMessage)) {
      setTimeout(() => {
        const orderStatus = formatOrderStatus(myOrders);
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          text: orderStatus,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
        scrollToBottom();
      }, 1000);
      return;
    }

    // Check if it's an order cancellation query
    if (isOrderCancelQuery(trimmedMessage)) {
      setTimeout(() => {
        const cancelMessage = `Please wait, we are connecting you to one of our team members who will guide you on whether the order can be cancelled or not.\n\nIn the meantime, you can also visit "My Orders" to see your orders and their cancellation eligibility.`;
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          text: cancelMessage,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
        scrollToBottom();
      }, 1500);
      return;
    }

    // For other queries, use AI bot
    try {
      const result = await chatbotAPI.sendMessage(trimmedMessage);
      if (result.ok && result.data?.data?.reply) {
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          text: result.data.data.reply,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        dispatch(
          openSnackbar(
            result.data?.message || "Failed to send message",
            "error"
          )
        );
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      dispatch(openSnackbar("Failed to send message. Please try again.", "error"));
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear chat history?")) return;

    try {
      const result = await chatbotAPI.clearChatHistory();
      if (result.ok) {
        setMessages([]);
        dispatch(openSnackbar("Chat history cleared", "success"));
      } else {
        dispatch(openSnackbar("Failed to clear history", "error"));
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      dispatch(openSnackbar("Failed to clear history", "error"));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  // Animation variants
  const chatButtonVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    hover: { 
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const chatWindowVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.8,
      y: 20,
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const messageVariants = {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  const loadingDotsVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const dotVariants = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <>
      {/* Greeting Bubble - Only on home page, after 5 seconds, once */}
      <AnimatePresence>
        {showGreeting && isHomePage && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-xs cursor-pointer"
              onClick={handleGreetingClick}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ff4d2d] to-[#ff3d1d] rounded-full flex items-center justify-center">
                  <Bot size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-gray-800 font-medium text-sm">Hi 👋 Need help?</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGreeting(false);
                  }}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
            {/* Arrow pointing to chat button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-[-8px] right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            variants={chatButtonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#ff4d2d] to-[#ff3d1d] text-white rounded-full shadow-2xl flex items-center justify-center z-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:ring-offset-2"
            aria-label="Open chatbot"
          >
            <MessageCircle size={24} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={chatWindowVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed bottom-6 right-6 w-[90vw] max-w-md h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#ff4d2d] to-[#ff3d1d]"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                  <Bot size={20} className="text-white" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Chat Support</h3>
                  <p className="text-white/80 text-xs">Ask me anything!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClearHistory}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Clear chat history"
                  title="Clear history"
                >
                  <Trash2 size={18} strokeWidth={2} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close chatbot"
                >
                  <X size={20} strokeWidth={2.5} />
                </motion.button>
              </div>
            </motion.div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
              {isLoadingHistory ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-full"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 size={32} className="text-[#ff4d2d]" strokeWidth={2.5} />
                  </motion.div>
                </motion.div>
              ) : showQuickActions && messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center justify-center h-full text-center px-4 space-y-6"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Bot size={48} className="text-[#ff4d2d] mb-4" strokeWidth={1.5} />
                  </motion.div>
                  <div className="w-full space-y-3">
                    <p className="text-gray-700 font-medium text-base mb-4">
                      How can I help you today?
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickAction("track")}
                      className="w-full flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#ff4d2d] hover:bg-[#ff4d2d]/5 transition-all text-left"
                    >
                      <div className="w-10 h-10 bg-[#ff4d2d]/10 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-[#ff4d2d]" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Track my order</p>
                        <p className="text-xs text-gray-500">Check order status</p>
                      </div>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickAction("cancel")}
                      className="w-full flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#ff4d2d] hover:bg-[#ff4d2d]/5 transition-all text-left"
                    >
                      <div className="w-10 h-10 bg-[#ff4d2d]/10 rounded-lg flex items-center justify-center">
                        <XCircle size={20} className="text-[#ff4d2d]" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Cancel order</p>
                        <p className="text-xs text-gray-500">Cancel an existing order</p>
                      </div>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickAction("something-else")}
                      className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-[#ff4d2d] to-[#ff3d1d] text-white rounded-xl hover:shadow-lg transition-all text-left"
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <MessageCircle size={20} className="text-white" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-semibold">Something else</p>
                        <p className="text-xs text-white/80">Chat with AI assistant</p>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              ) : messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center justify-center h-full text-center px-4"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <MessageCircle size={48} className="text-gray-300 mb-4" strokeWidth={1.5} />
                  </motion.div>
                  <p className="text-gray-500 text-sm">
                    Start a conversation! Ask me about your orders, delivery status, or anything else.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-[#ff4d2d] to-[#ff3d1d] text-white rounded-br-sm shadow-lg"
                            : "bg-white text-gray-800 rounded-bl-sm shadow-md border border-gray-100"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.text}
                        </p>
                        <span
                          className={`text-xs mt-1 block ${
                            message.role === "user"
                              ? "text-white/70"
                              : "text-gray-400"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-md border border-gray-100">
                    <motion.div
                      variants={loadingDotsVariants}
                      initial="initial"
                      animate="animate"
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        variants={dotVariants}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        variants={dotVariants}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        variants={dotVariants}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 bg-white"
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 resize-none px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent text-sm overflow-y-auto transition-all"
                  style={{ maxHeight: "120px", minHeight: "44px" }}
                  disabled={isLoading}
                />
                <motion.button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-gradient-to-br from-[#ff4d2d] to-[#ff3d1d] text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:ring-offset-2 transition-all"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 size={20} strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <Send size={20} strokeWidth={2.5} />
                  )}
                </motion.button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
