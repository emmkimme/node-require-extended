import * as path from 'path';

const findParentDir = require('find-parent-dir');

import { isWebpackContext } from './webpack-helpers';
import { addModuleAliases, FallbackBasePath, setupModuleAliases } from './require-resolve-alias';

const cachedModules = new Set<string>();

export function InjectRequireAlias(dirname: string, aliases: any): void {
    { /* webpack_ignore_start */
    if (isWebpackContext() === false) {
        const package_json_dir = findParentDir.sync(dirname, 'package.json');
        if (package_json_dir) {
            const normalize_package_json_dir = package_json_dir.replace(/[\\/]$/, '');
            if (cachedModules.has(normalize_package_json_dir) === false) {
                cachedModules.add(normalize_package_json_dir);
                try {
                    setupModuleAliases(normalize_package_json_dir);
                }
                catch (_) {
                    // no aliases declared
                }
            }
        }
        if (aliases) {
            // add default value
            Object.keys(aliases).forEach(alias => { aliases[alias] = path.join(dirname, aliases[alias]); });
            addModuleAliases(FallbackBasePath, aliases);
        }
    }
    /* webpack_ignore_end */ }
}
