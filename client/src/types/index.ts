export interface Board {
  _id: string;
  name: string;
  description: string;
  lanes: Lane[];
}

export interface Lane {
  _id: string;
  name: string;
  position: number;
  color: string;
  wipLimit: number;
  tasks: Task[];
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  assignee: string;
  storyPoints: number;
  labels: string[];
  lane: string;
  position: number;
}
