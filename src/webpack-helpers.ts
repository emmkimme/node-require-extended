import * as path from 'path';

const parentModule = require('parent-module');

// https://github.com/webpack/webpack/issues/4175#issuecomment-342931035
export function isWebpackContext(): boolean {
    /// @ts-ignore __webpack_require__ not defined by default
    return (typeof __webpack_require__ === 'function');
}

function _nonWebpackRequire(id: string): any {
    /// @ts-ignore __webpack_require__ not defined by default
    const requireFunc = isWebpackContext() ? __non_webpack_require__ : require;
    return requireFunc(id);
}

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
    return _nonWebpackRequire(id);
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
    return Promise.resolve().then(() => _nonWebpackRequire(id));
}