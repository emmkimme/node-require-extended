import * as path from 'path';

const parentModule = require('parent-module');

import type { RequireContext } from './require-context';
import { RequireContextNode } from './require-context-node';

export function InjectRequireContext(requireInstance: NodeRequire): NodeRequire {
    { /* webpack_ignore_start */
    if (typeof requireInstance.context === 'undefined') {
        requireInstance.context = (directory: string, deep?: boolean, regExp?: RegExp, mode?: 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once'): RequireContext => {
            // Assume absolute path by default
            if (path.isAbsolute(directory) === false) {
                const caller_filename = parentModule();
                directory = path.resolve(path.dirname(caller_filename), directory);
            }
            const requireContextNode = new RequireContextNode(directory, deep, regExp, mode);
            return requireContextNode.context();
        };
    }
    if (typeof requireInstance.resolveWeak === 'undefined') {
        requireInstance.resolveWeak = requireInstance.resolve;
    }
    if (typeof requireInstance.include === 'undefined') {
        requireInstance.include = () => {};
    }
    /* webpack_ignore_end */ }
    return requireInstance;
}
