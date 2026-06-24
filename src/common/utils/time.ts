type TimeUnit = 'd' | 'h' | 'm' | 's';

const multiPliers :Record<TimeUnit,number> ={
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
}

export function toMS(value:number , unit: TimeUnit){
    return value * multiPliers[unit];
}