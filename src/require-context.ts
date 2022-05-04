// See npm @types\webpack-env
export interface RequireContext {
    keys(): string[];
    (id: string): any;
    <T>(id: string): T;
    resolve(id: string): string;
    id: string;
}

// Enhance NodeJS require function
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#global-augmentation
declare global {
    export interface NodeRequire {
        // https://webpack.js.org/api/module-methods/#requirecontext
        context(path: string, deep?: boolean, filter?: RegExp, mode?: 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once'): RequireContext;
        // https://webpack.js.org/api/module-methods/#requireresolveweak
        resolveWeak(path: string): number | string;
        //  https://webpack.js.org/api/module-methods/#requireinclude
        include(path: string): void;
    }
}
