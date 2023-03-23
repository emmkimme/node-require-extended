import * as path from 'path';

const parentModule = require('parent-module');

import { nativeRequire } from "./webpack-helpers";

export function nonWebpackRequire(id: string, dirname?: string): any {
    if (path.isAbsolute(id) === false) {
        if (dirname == null) {
            const caller_filename = parentModule();
            id = path.resolve(path.dirname(caller_filename), id);
        }
        else {
            id = path.resolve(dirname, id);
        }
    }
    return nativeRequire(id);
}

export function nonWebpackImport(id: string, dirname?: string): Promise<any> {
    if (path.isAbsolute(id) === false) {
        if (dirname == null) {
            const caller_filename = parentModule();
            id = path.resolve(path.dirname(caller_filename), id);
        }
        else {
            id = path.resolve(dirname, id);
        }
    }
    return Promise.resolve().then(() => nativeRequire(id));
}