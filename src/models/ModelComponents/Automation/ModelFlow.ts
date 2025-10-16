import { IUser } from '@/models/ModelUser';

export enum StatusNode {
  Clicked = 'clicked',
  Hover = 'hover',
  Normal = 'normal',
}

export type ColumnItem = {
  key: string;
  label: React.ReactNode;
  render?: (data: any) => React.ReactNode;
  span: number;
  style?: React.CSSProperties;
};

export type IBasicAutomation = {
  isActive: boolean;
  key: string;
  label: string;
};

export type ISiderItem = {
  key: string;
  label: string;
};

export type NodeData = {
  [key: string]: any;
  addNode?: (type: string, from?: 'contextMenu') => void;
  currentTab: number;
  handleId?: string;
  isContextMenu?: boolean;
  onCopy: (key: string) => void;
  onDelete: (key: string) => void;
  onSetFirstBlock: (key: string) => void;
  statusNode?: StatusNode;
};

export type NodeMemberData = {
  onAddNode: (key: string) => void;
  onDelete: (key: string) => void;
  user?: Partial<IUser>;
};
