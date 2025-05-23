'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinking?: ThinkingStep[];
}

interface ThinkingStep {
  id: string;
  type: 'thinking' | 'action' | 'result';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call backend API
      const response = await fetch('http://localhost:3001/api/agents/research/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Mock thinking steps for demonstration
      const thinkingSteps: ThinkingStep[] = [
        {
          id: `${Date.now()}-1`,
          type: 'thinking',
          content: 'Analyzing the user request...',
          timestamp: new Date(),
        },
        {
          id: `${Date.now()}-2`,
          type: 'action',
          content: 'Searching for relevant information',
          timestamp: new Date(),
        },
        {
          id: `${Date.now()}-3`,
          type: 'result',
          content: 'Found information and generating response',
          timestamp: new Date(),
        }
      ];

      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: data.result?.text || 'I processed your request.',
        timestamp: new Date(),
        thinking: thinkingSteps,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Agentic Workflow</h1>
        <p className="text-sm opacity-80">Your AI assistant that can perform tasks autonomously</p>
      </header>

      {/* Chat container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h2 className="text-xl font-semibold mb-2">Welcome to Agentic Workflow</h2>
              <p>Start a conversation by typing a message below.</p>
              <p className="mt-4 text-sm">Try asking me to:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Research a topic</li>
                <li>• Generate code</li>
                <li>• Create a plan</li>
                <li>• Analyze data</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-100 ml-auto'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="font-medium mb-1">
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </div>
              <div className="text-gray-800 whitespace-pre-wrap">
                {message.content}
              </div>

              {/* Thinking steps */}
              {message.thinking && message.thinking.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-500 mb-2">
                    Thinking Process:
                  </div>
                  <div className="space-y-2">
                    {message.thinking.map((step) => (
                      <div key={step.id} className="text-sm">
                        <span className={`inline-block w-16 font-medium ${
                          step.type === 'thinking' ? 'text-purple-600' :
                          step.type === 'action' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {step.type === 'thinking' ? '🤔 Think:' :
                           step.type === 'action' ? '🔍 Action:' : '✅ Result:'}
                        </span>
                        <span className="text-gray-700">{step.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-center space-x-2 p-3 bg-gray-200 rounded-lg max-w-[80%]">
            <div className="animate-pulse flex space-x-1">
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
            </div>
            <span className="text-gray-700">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-300">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
