import * as fs from 'fs';
import * as path from 'path';

import type { RequireContext } from './require-context';
import { nativeRequire } from './webpack-helpers';

// interface RequireLoaderFunction {
//     (filename: string): any;
// }

// interface RequireLoader {
//     test: RegExp;
//     use: RequireLoaderFunction | RequireLoaderFunction[]
// }

interface CachedModule {
    id: string;
    loaded: boolean;
    exports?: any;
}

export class RequireContextNode {
    private _keys: string[];
    private _id: string;

    private _directory: string;
    private _recursive: boolean;
    private _regExp: RegExp;

    private _cachedModules: Map<string, CachedModule>;

    constructor(directory: string, recursive?: boolean, regExp?: RegExp, mode?: 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once') {
        this._keys = null;
        this._id = directory;
        this._directory = directory;

        this._cachedModules = new Map();

        // default values, see https://webpack.js.org/guides/dependency-management/#requirecontext
        this._recursive = (recursive == null) ? true : Boolean(recursive);
        this._regExp = (regExp == null) ? /^\.\/.*$/: regExp;
    }

    private _createOrReturnKeys() {
        if (this._keys == null) {
            this._keys = [];
            const readDirectory = (directory: string) => {
                fs.readdirSync(directory).forEach((file) => {
                    const fullPath = path.resolve(directory, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        if (this._recursive) {
                            readDirectory(fullPath);
                        }
                        return;
                    }
                    this._keys.push(fullPath);
                });
            };

            readDirectory(this._directory);
            this._keys = this._keys.filter((file) => {
                return this._regExp ? file.match(this._regExp) : true;
            })
            .map((file) => {
                return path.relative(this._directory, file);
            });
        }
        return this._keys;
    }

    context(): RequireContext {
        const requireContextProxy = (moduleId: string) => this.require(moduleId);
        Object.defineProperty(requireContextProxy, 'keys', {
            enumerable: true,
            configurable: true,
            value: () => {
                return this.keys();
            }
        });
        Object.defineProperty(requireContextProxy, 'resolve', {
            enumerable: true,
            configurable: true,
            value: (id: string) => {
                return this.resolve(id);
            }
        });
        Object.defineProperty(requireContextProxy, 'id', {
            enumerable: true,
            configurable: true,
            get: () => {
                return this.id;
            }
        });
        return requireContextProxy as RequireContext;
    }

    keys(): string[] {
        return this._createOrReturnKeys();
    }

    require(id: string): any {
        const cachedModule = this._cachedModules.get(id);
        if (cachedModule != null) {
            return cachedModule.exports;
        }
        const resolveID = this.resolve(id);
        // no ambiguity or fallback for webpack the resolveID must physically exist
        if (((this._keys && this._keys.includes(resolveID)) || fs.existsSync(resolveID)) === false) {
            const error = new Error(`Cannot find module '${resolveID}'`);
            (error as any).code = 'MODULE_NOT_FOUND';
            throw error;
        }
        if (path.extname(id) === '.xml') {
            const module: CachedModule = {
                id: id,
                loaded: false,
                exports: {}
            };
            try {
                module.exports.default = fs.readFileSync(resolveID, 'utf8');
                module.loaded = true;
            }
            catch (err: any) {}
            this._cachedModules.set(id, module);
            return module.exports;
        }
        return nativeRequire(resolveID);
    }

    resolve(id: string): string {
        return path.join(this._directory, id);
    }

    get id(): string {
        return this._id;
    }
}
