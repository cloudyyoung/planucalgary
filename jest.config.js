module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "@swc/jest",
    ],
  },
  testMatch: ["**/?(*.)+(spec|test).ts?(x)"],
  moduleNameMapper: {  },
}
