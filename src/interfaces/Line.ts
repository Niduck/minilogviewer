import {Levels} from "./Levels";

export interface Line{
    level: keyof Levels,
    raw: string,
    date?: string,
    message?: string
}
