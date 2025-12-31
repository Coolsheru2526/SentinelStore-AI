// frontend/src/components/Chat/ChatProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  content: string;
  type: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface Room {
  room_id: string;
  name: string;
  is_direct: boolean;
  unread_count: number;
  last_message?: Message;
  members?: Array<{
    user_id: string;
    username: string;
    online?: boolean;
  }>;
}

interface User {
  user_id: string;
  username: string;
  online: boolean;
  last_seen?: string;
}

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  rooms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  users: User[];
  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  sendMessage: (content: string, roomId?: string) => Promise<void>;
  startDirectMessage: (targetUserId: string) => Promise<void>;
  typing: (roomId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
      return () => {
        disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const connect = () => {
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:8000/ws', {
      auth: {
        token: localStorage.getItem('token'),
      },
      query: {
        userId: user.id,
        username: user.username,
        storeId: user.store_id,
      },
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      
      // Authenticate with the server
      newSocket.emit('authenticate', {
        user_id: user.id,
        username: user.username,
        store_id: user.store_id,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    newSocket.on('authenticated', (data) => {
      console.log('Authenticated with chat server', data);
      setRooms(data.rooms || []);
    });

    newSocket.on('room_joined', (data) => {
      console.log('Joined room', data);
      setCurrentRoom(data.room);
      setMessages(data.room.messages || []);
    });

    newSocket.on('new_message', (message: Message) => {
      console.log('New message', message);
      setMessages(prev => [...prev, message]);
      
      // Update last message in rooms list
      setRooms(prev => 
        prev.map(room => 
          room.room_id === message.room_id
            ? { ...room, last_message: message }
            : room
        )
      );
    });

    newSocket.on('user_joined', (data) => {
      console.log('User joined', data);
      // Update user status in current room
      if (currentRoom && data.room_id === currentRoom.room_id) {
        setUsers(prev => 
          prev.some(u => u.user_id === data.user_id)
            ? prev.map(u => 
                u.user_id === data.user_id ? { ...u, online: true } : u
              )
            : [...prev, { ...data, online: true }]
        );
      }
    });

    newSocket.on('user_left', (data) => {
      console.log('User left', data);
      // Update user status in current room
      if (currentRoom && data.room_id === currentRoom.room_id) {
        setUsers(prev => 
          prev.map(u => 
            u.user_id === data.user_id ? { ...u, online: false } : u
          )
        );
      }
    });

    newSocket.on('user_typing', (data) => {
      console.log('User typing', data);
      // Show typing indicator in UI
      // You can implement this based on your UI requirements
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const joinRoom = async (roomId: string): Promise<void> => {
    if (!socket || !isConnected) return;

    return new Promise((resolve, reject) => {
      socket.emit('join_room', { room_id: roomId }, (response: any) => {
        if (response.error) {
          console.error('Failed to join room:', response.error);
          reject(response.error);
        } else {
          setCurrentRoom(response.room);
          setMessages(response.room.messages || []);
          setUsers(response.room.members || []);
          resolve();
        }
      });
    });
  };

  const leaveRoom = async (roomId: string): Promise<void> => {
    if (!socket || !isConnected) return;

    return new Promise((resolve, reject) => {
      socket.emit('leave_room', { room_id: roomId }, (response: any) => {
        if (response.error) {
          console.error('Failed to leave room:', response.error);
          reject(response.error);
        } else {
          setRooms(prev => prev.filter(room => room.room_id !== roomId));
          if (currentRoom?.room_id === roomId) {
            setCurrentRoom(null);
            setMessages([]);
          }
          resolve();
        }
      });
    });
  };

  const sendMessage = async (content: string, roomId?: string): Promise<void> => {
    if (!socket || !isConnected || !content.trim()) return;

    const targetRoomId = roomId || currentRoom?.room_id;
    if (!targetRoomId) return;

    return new Promise((resolve, reject) => {
      socket.emit('send_message', {
        room_id: targetRoomId,
        content: content.trim(),
        type: 'text'
      }, (response: any) => {
        if (response.error) {
          console.error('Failed to send message:', response.error);
          reject(response.error);
        } else {
          resolve();
        }
      });
    });
  };

  const startDirectMessage = async (targetUserId: string): Promise<void> => {
    if (!socket || !isConnected || !user) return;

    return new Promise((resolve, reject) => {
      socket.emit('start_direct_message', {
        target_user_id: targetUserId
      }, (response: any) => {
        if (response.error) {
          console.error('Failed to start DM:', response.error);
          reject(response.error);
        } else {
          // Add room to rooms list if not already there
          setRooms(prev => {
            const exists = prev.some(r => r.room_id === response.room.room_id);
            return exists ? prev : [...prev, response.room];
          });
          // Join the room
          joinRoom(response.room.room_id).then(resolve).catch(reject);
        }
      });
    });
  };

  const typing = (roomId: string) => {
    if (!socket || !isConnected) return;
    socket.emit('typing', { room_id: roomId });
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        isConnected,
        rooms,
        currentRoom,
        messages,
        users,
        connect,
        disconnect,
        joinRoom,
        leaveRoom,
        sendMessage,
        startDirectMessage,
        typing,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};