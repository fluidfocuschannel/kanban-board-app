import type { Task } from '../types';

type TaskEventHandlers = {
  onTaskCreate?: (task: Task) => void;
  onTaskUpdate?: (task: Task, laneId?: string, position?: number) => void;
  onTaskDelete?: (task: Task) => void;
};

export class SSEService {
  private eventSource: EventSource | null = null;
  private handlers: TaskEventHandlers = {};

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }

  connect(handlers: TaskEventHandlers) {
    this.handlers = handlers;
    this.eventSource = new EventSource('http://localhost:5000/api/updates');

    this.eventSource.addEventListener('taskCreate', (event) => {
      if (this.handlers.onTaskCreate) {
        const { task } = JSON.parse(event.data);
        this.handlers.onTaskCreate(task);
      }
    });

    this.eventSource.addEventListener('taskUpdate', (event) => {
      if (this.handlers.onTaskUpdate) {
        const { task, laneId, position } = JSON.parse(event.data);
        this.handlers.onTaskUpdate(task, laneId, position);
      }
    });

    this.eventSource.addEventListener('taskDelete', (event) => {
      if (this.handlers.onTaskDelete) {
        const { task } = JSON.parse(event.data);
        this.handlers.onTaskDelete(task);
      }
    });

    this.eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      this.disconnect();
      // Attempt to reconnect after 5 seconds
      setTimeout(this.connect.bind(this, handlers), 5000);
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

export const sseService = new SSEService();
