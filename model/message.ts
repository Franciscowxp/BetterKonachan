export enum EStateType {
  Fail = 1,
  Success = 0,
}

export interface IMsg {
  state: EStateType;
  msg: string;
}