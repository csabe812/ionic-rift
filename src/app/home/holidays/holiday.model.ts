import { Member } from './member.model';

export class Holiday {
  constructor(
    public id: string,
    public country: string,
    public city: string,
    public start: Date,
    public member: Member[],
    public userId: string
  ) {}
}
