export class CurrencyData {
  constructor(
    public id: string,
    public date: Date,
    public rates: { key: string; value: number }[]
  ) {}
}
