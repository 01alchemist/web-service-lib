# env
[![CircleCI](https://circleci.com/gh/01alchemist/env.svg?style=svg)](https://circleci.com/gh/01alchemist/env) [![Maintainability](https://api.codeclimate.com/v1/badges/bde8b67054974cae1f0a/maintainability)](https://codeclimate.com/github/01alchemist/env/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/bde8b67054974cae1f0a/test_coverage)](https://codeclimate.com/github/01alchemist/env/test_coverage)

Nodejs env utils

### env
```ts
const nodeEnv:string = env("NODE_ENV", "development")
// process.env.NODE_ENV or "development"
```
### envInt
```ts
const timeout:number = envInt("TIMEOUT", 5000)
// process.env.TIMEOUT as int or 5000
```
### envFloat
```ts
const scaleFactor:number = envFloat("SCALE_FACTOR", 2.56)
// process.env.SCALE_FACTOR as float or 2.56
```
### envBoolean
```ts
const isEnabled:boolean = envBoolean("IS_ENABLED", false)
// process.env.IS_ENABLED as boolean or false
```
