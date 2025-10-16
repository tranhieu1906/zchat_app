import { loadAuth } from '@/utils/auth';
import { io, Socket } from 'socket.io-client';

export enum ISocketEvent {
  comment = 'comment',
  conversation = 'conversation',
  message = 'message',
  page = 'page',
  pong = 'pong',
  scopedUser = 'scopedUser',
  unreadConversations = 'unreadConversations',
  updateConversation = 'updateConversation',
  userReadConversation = 'userReadConversation',
  userStatus = 'userStatus',
}

export enum ISocketRoom {
  all = 'all',
  page = 'page',
}

export type IUserStatus = {
  isOnline: boolean;
  userId: string;
};

export type RoomEntity = {
  entity: string;
  entityId: string;
};

class SocketManager {
  private _onUpdateSocket: any = {};
  private _pageId: string | string[] = '';
  private _socket?: Socket;
  private connected = false;
  private pingInterval: any;
  private pongTimeout: any;
  handleConnection = () => {
    if (this.connected) return;

    const url = process.env.EXPO_PUBLIC_SOCKET_URL;
    const { token } = loadAuth();
    const socket = io(url, {
      auth: {
        token,
      },
      path: process.env.EXPO_PUBLIC_SOCKET_PATH,
      reconnectionDelay: 3000,
      secure: true,
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      this.connected = true;
      this._socket = socket;
      if (this._pageId) {
        this.joinRoom(ISocketRoom.page, { pageId: this._pageId });
      }
      this.listenEvents();
      this.startPingPong();
      this.onConnectedCallback('connected');
    });

    socket.on('disconnect', () => {
      this.connected = false;
      this.stopPingPong();
      this.onConnectedCallback('disconnected');
    });
  };

  onHandleConnected = (
    callback: (type: 'connected' | 'disconnected') => void,
  ) => {
    this.onConnectedCallback = callback;
  };

  onUpdateSocket = (event: ISocketEvent, handleEvent: (data: any) => void) => {
    this._onUpdateSocket[event] = handleEvent;
  };

  startConnect = async (pageId: string | string[]) => {
    this._pageId = pageId;

    if (!this.connected) {
      this.handleConnection();
      return;
    }

    let attempts = 10;
    while (attempts) {
      if (this._socket) {
        return this._socket.emit('join', {
          pageId: this._pageId,
          room: 'page',
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts--;
    }
  };

  private handleEvent = (data: any, event: ISocketEvent) => {
    if (event === ISocketEvent.pong) {
      clearTimeout(this.pongTimeout);
      return;
    }
    const handleEvent = this._onUpdateSocket?.[event];
    if (typeof handleEvent === 'function') handleEvent(data);
  };

  private joinRoom = (room?: ISocketRoom, data?: any) => {
    if (!this._socket || !room) return;
    this._socket.emit('join', { room: room, ...data });
  };

  private listenEvents = () => {
    if (!this._socket) return;
    for (const event of Object.values(ISocketEvent)) {
      this._socket.off(event).on(event, (data: any) => {
        this.handleEvent(data, event);
      });
    }
  };

  private onConnectedCallback: (type: 'connected' | 'disconnected') => void =
    () => {};

  private startPingPong = () => {
    this.stopPingPong();

    this.pingInterval = setInterval(() => {
      if (!this._socket?.connected) return;

      this._socket.emit('ping', { time: Date.now() });

      this.pongTimeout = setTimeout(() => {
        this._socket?.disconnect();
      }, 60_000);
    }, 60_000);
  };

  private stopPingPong = () => {
    clearInterval(this.pingInterval);
    clearTimeout(this.pongTimeout);
  };
}

export default new SocketManager();
