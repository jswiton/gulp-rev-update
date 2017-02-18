const OFF = 0, WARN = 1, ERROR = 2;

module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "mocha": true
  },
  "extends": "airbnb-base",
  "installedESLint": true,
  "parserOptions": {
    "ecmaVersion": 8,
    "sourceType": "module"
  },
 "rules": {
    "func-names": OFF,
    "no-console": WARN,
    "no-plusplus": OFF,
    "max-len": [WARN, 120, { "ignoreStrings": true }],
    "consistent-return": OFF,
    "no-restricted-globals": [2, "event"]
  }
};
