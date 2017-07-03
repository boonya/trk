/**
 * Mocking data generator.
 *
 * Iterate list with delay and run callback with current item of list
 * each iteration.
 *
 * @TODO: Remove this stuff!
 */
export class Generator {
  running = false;
  pingPong = true;
  direction: number;
  delay: number;
  callback: any;
  index = 0;
  list = [];
  steps = 1;

  /**
   * @param list {object}
   * @param callback {function}
   * @param delay {int}
   * @param pingPong {boolean}
   * @param ahead {boolean}
   * @param steps {int}
   */
  constructor(list: any[], callback: any, delay: number, pingPong = true, ahead = true, steps = 1) {
    this.pingPong = (pingPong !== false);
    ahead = (ahead !== false);
    steps = steps || 1;

    if (!Array.isArray(list)) {
      throw new Error('List must be an array object.');
    }

    if (list.length <= steps) {
      throw new Error('Steps must be less than list length.');
    } else if (1 > steps) {
      throw new Error('Steps must be more than 0');
    }

    this.direction = ahead
      ? 1
      : -1;

    this.index = ahead
      ? 0
      : list.length - 1;

    this.list = list;
    this.steps = steps;
    this.delay = delay;
    this.callback = callback;
  }

  _changeDirection() {
    this.steps = this.steps * -1;
    this.index = this.index + 2 * (this.steps * this.direction);
  }

  start() {
    if (this.running) {
      throw new Error('Generator has already been started.');
    }

    const context = this;
    this.running = true;

    (function iterator() {
      if (context.running === false) {
        return;
      }
      context.callback(context.list[context.index]);

      context.index = context.index + context.steps * context.direction;

      if (!context.list[context.index]) {
        if (!context.pingPong) {
          return;
        }
        context._changeDirection();
      }

      setTimeout(iterator, context.delay);
    })();
  }

  stop() {
    this.running = false;
  }

  setDelay(value: number) {
    this.delay = value;
  }
}
