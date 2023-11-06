export default class WebSocketWrapper {
    constructor(options: any);
    createMethod(method: any, options: any, stateCallback: any): void;
    queue: any[];
    onEventTrigger: (eventName: any) => void;
    init: () => void;
    send: (...args: any[]) => void;
    close: () => void;
}
