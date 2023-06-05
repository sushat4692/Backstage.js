module.exports = {
    env: {
        browser: true,
        node: true,
        es6: false,
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        sourceType: "module",
    },
    extends: ["eslint:recommended", "prettier"],
    plugins: ["@typescript-eslint", "prettier"],
    globals: {
        window: true,
        document: true,
    },
    rules: {
        "no-unused-variable": 0,
        "no-unused-vars": 0,
        "no-prototype-builtins": 0,
        "require-atomic-updates": 0,
        "@typescript-eslint/no-unused-vars": [
            2,
            { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "prettier/prettier": [
            "error",
            {
                singleQuote: true,
                semi: false,
                printWidth: 80,
                tabWidth: 4,
            },
        ],
    },
};
