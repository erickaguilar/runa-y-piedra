import Peer, { DataConnection } from 'peerjs';

export interface NetworkEvents {
  onConnected: (peerId: string) => void;
  onDisconnected: () => void;
  onData: (buffer: ArrayBuffer) => void;
  onError: (error: Error) => void;
}

export class NetworkManager {
  public peer: Peer | null = null;
  public connection: DataConnection | null = null;
  public isHost = false;
  public roomPin = '';

  private events: NetworkEvents;

  constructor(events: NetworkEvents) {
    this.events = events;
  }

  public static generatePin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // 1. Iniciar como Host autoritativo
  public createHost(pin?: string): Promise<string> {
    this.isHost = true;
    this.roomPin = pin || NetworkManager.generatePin();
    const peerId = `SALA-${this.roomPin}`;

    return new Promise((resolve, reject) => {
      this.peer = new Peer(peerId, { debug: 1 });

      this.peer.on('open', () => {
        resolve(this.roomPin);
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        this.events.onError(err);
        reject(err);
      });
    });
  }

  // 2. Conectar como Cliente
  public join(pin: string): Promise<void> {
    this.isHost = false;
    this.roomPin = pin;
    const targetId = `SALA-${pin}`;

    return new Promise((resolve, reject) => {
      this.peer = new Peer({ debug: 1 });

      this.peer.on('open', () => {
        if (!this.peer) return;

        // Canal WebRTC optimizado: UDP-like, sin retransmisión y binario en crudo
        const conn = this.peer.connect(targetId, {
          reliable: false,
          serialization: 'none'
        });

        this.setupConnection(conn);

        conn.on('open', () => {
          resolve();
        });
      });

      this.peer.on('error', (err) => {
        this.events.onError(err);
        reject(err);
      });
    });
  }

  private setupConnection(conn: DataConnection): void {
    this.connection = conn;

    conn.on('open', () => {
      this.events.onConnected(conn.peer);
    });

    conn.on('data', (data) => {
      if (data instanceof ArrayBuffer) {
        this.events.onData(data);
      } else if (ArrayBuffer.isView(data)) {
        this.events.onData((data as Uint8Array).buffer as ArrayBuffer);
      }
    });

    conn.on('close', () => {
      this.events.onDisconnected();
    });

    conn.on('error', (err) => {
      this.events.onError(err);
    });
  }

  public send(buffer: ArrayBuffer): void {
    if (this.connection && this.connection.open) {
      this.connection.send(buffer);
    }
  }

  public disconnect(): void {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}
