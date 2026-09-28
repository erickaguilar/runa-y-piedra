import Peer, { DataConnection } from 'peerjs';

export interface NetworkCallbacks {
  onConnected: (peerId: string) => void;
  onDisconnected: () => void;
  onData: (buffer: ArrayBuffer) => void;
  onError: (err: Error) => void;
}

export class PeerNetwork {
  public peer: Peer | null = null;
  public connection: DataConnection | null = null;
  public isHost = false;
  public roomId = '';

  private callbacks: NetworkCallbacks;

  constructor(callbacks: NetworkCallbacks) {
    this.callbacks = callbacks;
  }

  // Genera un código PIN de 4 dígitos para fácil tipeo en celular
  public static generateRoomPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // 1. Iniciar como Host
  public startHost(pin?: string): Promise<string> {
    this.isHost = true;
    const roomCode = pin || PeerNetwork.generateRoomPin();
    const peerId = `vox-${roomCode}`;
    this.roomId = roomCode;

    return new Promise((resolve, reject) => {
      this.peer = new Peer(peerId, {
        debug: 1
      });

      this.peer.on('open', () => {
        resolve(roomCode);
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        this.callbacks.onError(err);
        reject(err);
      });
    });
  }

  // 2. Unirse como Cliente
  public joinRoom(roomCode: string): Promise<void> {
    this.isHost = false;
    this.roomId = roomCode;
    const hostPeerId = `vox-${roomCode}`;

    return new Promise((resolve, reject) => {
      this.peer = new Peer({
        debug: 1
      });

      this.peer.on('open', () => {
        if (!this.peer) return;
        // Configurar conexión WebRTC de alto rendimiento (UDP-like, binario en crudo)
        const conn = this.peer.connect(hostPeerId, {
          reliable: false, // Modo UDP no confiable/rápido
          serialization: 'none' // Permite transferir ArrayBuffer directamente sin JSON
        });

        this.setupConnection(conn);
        conn.on('open', () => {
          resolve();
        });
      });

      this.peer.on('error', (err) => {
        this.callbacks.onError(err);
        reject(err);
      });
    });
  }

  private setupConnection(conn: DataConnection): void {
    this.connection = conn;

    conn.on('open', () => {
      this.callbacks.onConnected(conn.peer);
    });

    conn.on('data', (data) => {
      if (data instanceof ArrayBuffer) {
        this.callbacks.onData(data);
      } else if (ArrayBuffer.isView(data)) {
        this.callbacks.onData((data as Uint8Array).buffer as ArrayBuffer);
      }
    });

    conn.on('close', () => {
      this.callbacks.onDisconnected();
    });

    conn.on('error', (err) => {
      this.callbacks.onError(err);
    });
  }

  public send(buffer: ArrayBuffer): void {
    if (this.connection && this.connection.open) {
      this.connection.send(buffer);
    }
  }

  public close(): void {
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
