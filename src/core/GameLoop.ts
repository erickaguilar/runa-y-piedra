export class GameLoop {
  private isRunning = false;
  private lastTime = performance.now();
  private onUpdateCallbacks: Array<(deltaTime: number) => void> = [];

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.frame = this.frame.bind(this);
    requestAnimationFrame(this.frame);
  }

  public stop(): void {
    this.isRunning = false;
  }

  public onUpdate(cb: (deltaTime: number) => void): void {
    this.onUpdateCallbacks.push(cb);
  }

  private frame(currentTime: number): void {
    if (!this.isRunning) return;
    requestAnimationFrame(this.frame);

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    for (let i = 0; i < this.onUpdateCallbacks.length; i++) {
      this.onUpdateCallbacks[i](deltaTime);
    }
  }
}
