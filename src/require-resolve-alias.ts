// $ prefix is not supported in package.json as attempt to be resolved on Mac/Linux as a var env !
// ~ prefix is already an alias for Max/Linux to Home directory
// @ prefix may conflict with NPM private package prefixed with a @
// ! prefix does work with webpack as used for loader syntax

import * as path from 'path';

// This package takes inspiration from module-alias
// https://github.com/Sawtaytoes/better-module-alias

const globalModuleAlternative = require('module');

// Guard against poorly mocked module constructors
const Module = module.constructor.length > 1
        ? module.constructor
        : globalModuleAlternative;

const moduleAliases: any = {};

let moduleAliasCommon: string;
const moduleAliasNames: string[] = [];

export const FallbackBasePath = '';

function reverseString(str: string): string {
    return str.split('').reverse().join('');
}

function findLongestCommonPrefix(aliases: string[]): string {
    const size = aliases.length;
    /* if size is 0, return empty string */
    if (size === 0) {
        return '';
    }

    // Get first array element
    const arrFirstElem = aliases[0];
    if (size === 1) {
        return arrFirstElem;
    }

    // sort() method arranges array elements alphabetically
    const sortArr = aliases.sort();

    // Get the last array element length minus one
    const arrLastElem = sortArr[sortArr.length - 1];

    /* find the minimum length from first and last string */
    const end = Math.min(arrFirstElem.length, arrLastElem.length);

    // while "i" is less than the length of the first array element AND
    // the first array element character position matches the last array character position
    // increment "i" by one
    let i = 0;
    while (i < end && arrFirstElem[i] === arrLastElem[i]) {
        ++i;
    }

    // Console log the substring of the first element of the array starting with
    // index zero and going all the way to just below index "i"
    return arrFirstElem.substring(0, i);
}

function findLongestCommonSuffix(aliases: string[]): string {
    const reverseAliases = aliases.map(str => reverseString(str));
    const reverseSuffix = findLongestCommonPrefix(reverseAliases);
    return reverseString(reverseSuffix);
}

function getBasePathFromFilePath(filepath: string) {
    return filepath
        .replace(
            /^(.+)[\\/]node_modules$/,
            '$1'
        );
}

function getModifiedRequest(alias: string, requestedFilePath: string, parentModule: NodeModule) {
    const parentFilePath = parentModule.paths
        .find(filePath => moduleAliases[getBasePathFromFilePath(filePath)]);

    let aliasTarget: string;
    if (parentFilePath) {
        const basePath = getBasePathFromFilePath(parentFilePath);
        aliasTarget = moduleAliases[basePath][alias];
    }
    if ((aliasTarget == null) && moduleAliases[FallbackBasePath]) {
        aliasTarget = moduleAliases[FallbackBasePath][alias];
    }

    if (aliasTarget == null) {
        throw new Error(
            `The file at '${requestedFilePath}' does not exist.`
                .concat('\n\n')
                .concat('Verify these paths:')
                .concat('\n')
                .concat(JSON.stringify(moduleAliases, null, 2)
                )
        );
    }

    return requestedFilePath
        .replace(
            alias,
            aliasTarget
        );
}

const OriginalResolveFilename = Module._resolveFilename;
const TrampolineResolveFilename = (requestedFilePath: string, parentModule: NodeModule, isMain: boolean) => {
    if ((moduleAliasCommon == null) || requestedFilePath.includes(moduleAliasCommon)) {
        const alias = moduleAliasNames.find(alias => requestedFilePath.includes(alias));
        if (alias) {
            requestedFilePath = getModifiedRequest(
                alias,
                requestedFilePath,
                parentModule
            );
         }
    }
    return OriginalResolveFilename.call(
        Module,
        requestedFilePath,
        parentModule,
        isMain
    );
};

export function addModuleAliases(basePath: string, aliases: any) {
    aliases && Object.keys(aliases)
        .map(alias => ({
            alias,
            filePath: path.join(basePath, aliases[alias])
        }))
        .forEach(({ alias, filePath }) => {
            moduleAliases[basePath] = moduleAliases[basePath] || {};
            moduleAliases[basePath][alias] = filePath;
            if (!moduleAliasNames.includes(alias)) {
                if (moduleAliasNames.length === 0) {
                    Module._resolveFilename = TrampolineResolveFilename;
                }
                moduleAliasNames.push(alias);
            }
        });
        const prefix = findLongestCommonPrefix(moduleAliasNames);
        const suffix = findLongestCommonSuffix(moduleAliasNames);
        moduleAliasCommon = (prefix.length > suffix.length) ? prefix : suffix;
    }

function getAliasList(basePath: string) {
    return require(path.join(basePath, 'package.json'))._moduleAliases;
}

export function setupModuleAliases(basePath: string) {
    return addModuleAliases(
        basePath,
        getAliasList(basePath)
    );
}
