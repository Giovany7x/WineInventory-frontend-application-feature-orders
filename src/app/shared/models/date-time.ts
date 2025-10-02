export class DateTime {
  readonly _date: Date;

  constructor(value?: Date | string) {
    const now = new Date();
    if (!value) {
      this._date = now;
    } else {
      const parsedDate = new Date(value);
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date: ${value}`);
      }
      this._date = parsedDate;
    }
    if (this._date > now) {
      throw new Error(`Date cannot be in the future: ${this._date}`);
    }
  }

  public get value(): Date { return this._date; }

  public format(locale: string = " en-US"): string {
    return this._date.toLocaleString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }

  public toString(): string {
    return this._date.toISOString();
  }
}
