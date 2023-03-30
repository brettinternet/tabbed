export enum TimerState {
  READY,
  RUNNING,
  PAUSED,
  COMPLETED,
}

class Timer<C extends (...args: any[]) => void> {
  private timerId: number | undefined
  private startDate: number | undefined
  private callback: () => void
  timeLeft: number
  state: TimerState = TimerState.READY

  constructor(callback: C, timeout: number, ...args: Parameters<C>) {
    this.timeLeft = timeout
    this.start()
    this.callback = () => {
      callback(...args)
    }
  }

  start = (): void => {
    this.clear()
    if (this.timeLeft > 0) {
      this.startDate = Date.now()
      this.timerId = window.setTimeout(() => {
        this.callback()
        this.timeLeft = 0
        this.state = TimerState.COMPLETED
      }, this.timeLeft)
      this.state = TimerState.RUNNING
    }
  }

  pause = (): void => {
    if (this.startDate) {
      this.clear()
      this.state = TimerState.PAUSED
      this.timeLeft -= Date.now() - this.startDate
    }
  }

  updateTimeout = (newTimeout: number): void => {
    this.clear()
    this.timeLeft = newTimeout
    this.start()
  }

  clear = (): void => {
    if (this.timerId) {
      window.clearTimeout(this.timerId)
    }
  }
}

export const createTimer = <C extends (...args: any[]) => void>(
  c: C,
  t: number,
  ...a: Parameters<C>
) => new Timer<C>(c, t, ...a)
