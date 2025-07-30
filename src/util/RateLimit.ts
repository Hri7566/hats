export class RateLimit {
    public points: number;
    protected last = Date.now();

    constructor(public totalPoints: number, public cooldown: number) {
        this.points = totalPoints;
    }

    public spend(points = 1) {
        let happened = false;

        if (Date.now() > this.last + this.cooldown) this.points = this.totalPoints;

        this.points -= points;
        if (this.points >= 0) happened = true;

        this.last = Date.now();
        return happened;
    }
}
