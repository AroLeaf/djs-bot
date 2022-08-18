export declare const config: {
    fancy: boolean;
    level: number;
};
export declare type LogOptions = Partial<typeof config>;
export declare enum LogType {
    INFO = 0,
    WARN = 1,
    ERROR = 2
}
export declare function info(subject: any, options?: Partial<typeof config>): void;
export declare function warn(subject: any, options?: Partial<typeof config>): void;
export declare function error(subject: any, options?: Partial<typeof config>): void;
