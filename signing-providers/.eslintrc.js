module.exports = {
    parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
    },
    extends: ["eslint:recommended", "plugin:prettier/recommended"],
    plugins: ["prettier"],
    root: true,
    env: {
        node: true,
        browser: true,
    },
    ignorePatterns: [
        ".eslintrc.js",
        "node_modules",
        "out",
        "out-tests",
        "out-browser",
        "out-browser-tests",
        "cookbook",
    ],
    rules: {
        "no-empty-function": "off",
        "no-use-before-define": "off",
        quotes: "off",
        "no-empty-pattern": "off",
        "no-var": "warn",
        "no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            },
        ],
        "prefer-const": "off",
        "prettier/prettier": "error",
    },
};
