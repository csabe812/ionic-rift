export class Item {
  constructor(
    public id: string,
    public title: string,
    public price: number,
    public paid: string,
    public separatable: boolean,
    public holidayId: string,
    public currency: string
  ) {}
}
