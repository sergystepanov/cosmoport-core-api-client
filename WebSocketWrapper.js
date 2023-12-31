export default class WebSocketWrapper {
  createMethod(method, options, stateCallback) {
    const that = this;

    this[method] = function () {
      if (stateCallback && stateCallback.apply) {
        stateCallback(method);
      }
      if (options[method] && options[method].apply) {
        options[method].apply(that, arguments);
      }
    };
  }

  constructor(options) {
    let ws,
      events = ['onopen', 'onmessage', 'onclose', 'onerror'],
      i,
      len,
      prop = { opened: false, closed: false, error: false },
      method;

    if (typeof options === 'undefined' || !options) {
      throw 'ArgumentException: please add default constructor options';
    }

    this.queue = [];

    this.onEventTrigger = function (eventName) {
      let i;
      let len;

      if (eventName === 'onopen') {
        prop.opened = true;
        prop.closed = false;
        // opened send queue
        if (this.queue.length > 0) {
          for (i = this.queue.length; --i >= 0;) {
            this.send.apply(this, this.queue[0]);
            this.queue.splice(0, 1);
          }
        }
      }

      if (eventName === 'onerror') {
        prop.error = true;
      }

      if (eventName === 'onclosed') {
        prop.opened = false;
        prop.closed = true;
      }
    };

    this.init = function () {
      const cb = this.onEventTrigger.bind(this);
      ws = new WebSocket(options.url);

      for (i = 0; i < events.length; i++) {
        method = events[i];
        this.createMethod.apply(ws, [method, options, cb]);
      }
    };

    this.send = function () {
      if (prop.closed) {
        throw 'InvalidOperation: Cannot send messages to a closed Websocket!';
      }

      if (!prop.opened) {
        this.queue.push(arguments);
      } else {
        ws.send(...arguments);
      }
    };

    this.close = function () {
      ws.close();
    }

    this.init();

    return this;
  }
}
