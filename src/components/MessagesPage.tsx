'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { MessagesPageProps, Conversation, ConversationBase, Message } from '@/types';

/**
 * MessagesPage component that displays user conversations and messages
 * This component shows a list of conversations on the left and the selected
 * conversation messages on the right, with the ability to send new messages.
 */
export function MessagesPage({}: MessagesPageProps): JSX.Element {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Effect hook to load conversations data
   * In a real app, this would fetch from an API
   */
  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      // Mock conversations data
      const mockConversations: ConversationBase[] = [
        {
          id: 1,
          user: { 
            id: 101,
            name: 'Jane Smith', 
            handle: 'janesmith', 
            avatar: '' 
          },
          lastMessage: {
            text: 'Hey, how are you doing?',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
            isFromUser: false
          },
          unread: 2
        },
        {
          id: 2,
          user: { 
            id: 102,
            name: 'John Doe', 
            handle: 'johndoe', 
            avatar: '' 
          },
          lastMessage: {
            text: 'Thanks for the information!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            isFromUser: true
          },
          unread: 0
        },
        {
          id: 3,
          user: { 
            id: 103,
            name: 'Alex Johnson', 
            handle: 'alexj', 
            avatar: '' 
          },
          lastMessage: {
            text: 'Are you coming to the meetup tomorrow?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            isFromUser: false
          },
          unread: 1
        },
        {
          id: 4,
          user: { 
            id: 104,
            name: 'Sarah Williams', 
            handle: 'sarahw', 
            avatar: '' 
          },
          lastMessage: {
            text: 'I just shared the project files with you.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
            isFromUser: false
          },
          unread: 0
        },
        {
          id: 5,
          user: { 
            id: 105,
            name: 'Michael Brown', 
            handle: 'mikebrown', 
            avatar: '' 
          },
          lastMessage: {
            text: 'Let me know when you\'re free to discuss.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
            isFromUser: true
          },
          unread: 0
        }
      ];

      // Add messages to each conversation
      const conversationsWithMessages = mockConversations.map(convo => ({
        ...convo,
        messages: generateMockMessages(convo.id, convo.user.id)
      }));

      setConversations(conversationsWithMessages);
      setActiveConversation(conversationsWithMessages[0]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Generate mock messages for a conversation
   */
  const generateMockMessages = (conversationId: number, userId: number): Message[] => {
    const currentUser = { id: 999, name: 'Your Name', handle: 'yourhandle' };
    
    // Different message patterns based on conversation ID
    switch(conversationId) {
      case 1:
        return [
          {
            id: 101,
            text: 'Hey there!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            sender: userId,
            receiver: currentUser.id
          },
          {
            id: 102,
            text: 'Hi! How are you?',
            timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
            sender: currentUser.id,
            receiver: userId
          },
          {
            id: 103,
            text: 'I\'m doing well, thanks for asking!',
            timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
            sender: userId,
            receiver: currentUser.id
          },
          {
            id: 104,
            text: 'Just wanted to check in about the project.',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            sender: userId,
            receiver: currentUser.id
          },
          {
            id: 105,
            text: 'Oh, right! I\'ve been working on it.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            sender: currentUser.id,
            receiver: userId
          },
          {
            id: 106,
            text: 'Hey, how are you doing?',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            sender: userId,
            receiver: currentUser.id
          }
        ];
      case 2:
        return [
          {
            id: 201,
            text: 'Did you see the latest documentation?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            sender: userId,
            receiver: currentUser.id
          },
          {
            id: 202,
            text: 'Yes, I reviewed it yesterday.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
            sender: currentUser.id,
            receiver: userId
          },
          {
            id: 203,
            text: 'What did you think about the new features?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.4).toISOString(),
            sender: userId,
            receiver: currentUser.id
          },
          {
            id: 204,
            text: 'I think they\'re going to be really helpful for our users.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.3).toISOString(),
            sender: currentUser.id,
            receiver: userId
          },
          {
            id: 205,
            text: 'Thanks for the information!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            sender: currentUser.id,
            receiver: userId
          }
        ];
      default:
        return [
          {
            id: 301,
            text: 'Hello there!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            sender: userId,
            receiver: currentUser.id
          },
          {
            id: 302,
            text: 'Hi! How can I help you?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.9).toISOString(),
            sender: currentUser.id,
            receiver: userId
          },
          {
            id: 303,
            text: 'Just checking in to see how things are going.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.8).toISOString(),
            sender: userId,
            receiver: currentUser.id
          }
        ];
    }
  };

  /**
   * Format the timestamp to a human-readable format
   */
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  /**
   * Handle sending a new message
   */
  const handleSendMessage = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (!message.trim() || !activeConversation) return;

    const currentUser = { id: 999, name: 'Your Name', handle: 'yourhandle' };
    const newMessage = {
      id: Date.now(),
      text: message,
      timestamp: new Date().toISOString(),
      sender: currentUser.id,
      receiver: activeConversation.user.id
    };

    // Update conversations with new message
    const updatedConversations = conversations.map(convo => {
      if (convo.id === activeConversation.id) {
        return {
          ...convo,
          messages: [...convo.messages, newMessage],
          lastMessage: {
            text: message,
            timestamp: new Date().toISOString(),
            isFromUser: true
          }
        };
      }
      return convo;
    });

    setConversations(updatedConversations);
    setActiveConversation({
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage],
      lastMessage: {
        text: message,
        timestamp: new Date().toISOString(),
        isFromUser: true
      }
    });
    setMessage('');
  };

  /**
   * Select a conversation to view
   */
  const selectConversation = (conversation: Conversation): void => {
    // Mark conversation as read when selected
    const updatedConversations = conversations.map(convo => {
      if (convo.id === conversation.id) {
        return { ...convo, unread: 0 };
      }
      return convo;
    });
    
    setConversations(updatedConversations);
    setActiveConversation({ ...conversation, unread: 0 });
  };

  return (
    <div className="bg-white border-x border-gray-200 min-h-screen flex w-full">
      {/* Conversations list */}
      <div className="w-1/3 border-r border-gray-200">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="px-6 py-3">
            <h1 className="text-xl font-bold heading-1">Messages</h1>
          </div>
        </div>

        {/* Conversations */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div role="status" className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : conversations.length > 0 ? (
            conversations.map(conversation => (
              <div 
                key={conversation.id} 
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  activeConversation?.id === conversation.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      {conversation.user.name.charAt(0)}
                    </div>
                    {conversation.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {conversation.user.name}
                      </p>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(conversation.lastMessage.timestamp)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conversation.unread > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                      {conversation.lastMessage.isFromUser ? 'You: ' : ''}{conversation.lastMessage.text}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
              <p className="text-gray-500">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className="w-2/3 flex flex-col">
        {activeConversation ? (
          <>
            {/* Conversation header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
              <div className="px-6 py-3 flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3">
                  {activeConversation.user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold">{activeConversation.user.name}</h2>
                  <p className="text-sm text-gray-500">@{activeConversation.user.handle}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversation.messages.map(msg => {
                const isFromCurrentUser = msg.sender === 999;
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isFromCurrentUser 
                          ? 'bg-blue-500 text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${isFromCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
