import React, { useState, useRef, useEffect } from 'react';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBot = () => {
    const { preferences } = usePreferences();
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatRef = useRef(null);

    const sendMessage = async (message) => {
        if (!message.trim()) return;

        // Add user message
        const newMessage = {
            id: Date.now(),
            text: message,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    context: {
                        previousMessages: messages.slice(-5),
                        userPreferences: preferences,
                        currentPage: window.location.pathname
                    }
                })
            });

            const data = await response.json();

            // Add AI response
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: data.response,
                sender: 'ai',
                timestamp: new Date(),
                suggestions: data.suggestions || []
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            // Add error message
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: t('chat.errorMessage'),
                sender: 'system',
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <>
            {/* Chat Toggle Button */}
            <motion.button
                className="fixed bottom-6 right-6 bg-primary-500 text-white p-4 rounded-full shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-primary-500 text-white p-4">
                            <h3 className="text-lg font-semibold">{t('chat.title')}</h3>
                        </div>

                        {/* Messages */}
                        <div 
                            ref={chatRef}
                            className="h-96 overflow-y-auto p-4 space-y-4"
                        >
                            {messages.map(message => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-lg ${
                                            message.sender === 'user'
                                                ? 'bg-primary-500 text-white'
                                                : message.sender === 'system'
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        <p>{message.text}</p>
                                        {message.suggestions && (
                                            <div className="mt-2 space-y-2">
                                                {message.suggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => sendMessage(suggestion)}
                                                        className="block w-full text-left text-sm text-primary-600 hover:text-primary-700"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                transition: { repeat: Infinity }
                                            }}
                                        >
                                            {t('chat.typing')}
                                        </motion.div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="border-t p-4">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendMessage(inputValue);
                                }}
                                className="flex space-x-2"
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={t('chat.inputPlaceholder')}
                                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <button
                                    type="submit"
                                    className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBot;
