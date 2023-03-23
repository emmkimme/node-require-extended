// https://github.com/webpack/webpack/issues/4175#issuecomment-342931035
export function isWebpackContext(): boolean {
    /// @ts-ignore __webpack_require__ not defined by default
    return (typeof __webpack_require__ === 'function');
}

export function nativeRequire(id: string): any {
    /// @ts-ignore __webpack_require__ not defined by default
    const requireFunc = isWebpackContext() ? __non_webpack_require__ : require;
    return requireFunc(id);
}
