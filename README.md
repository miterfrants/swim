# Initial Swim Project
1. `npm install https://github.com/miterfrants/swim.git`
2. `node node_modules/swim/auto-script/generate-project-structure.js`

# Update Swim Core Libs
1. `npm install https://github.com/miterfrants/swim.git`
2. `node node_modules/swim/auto-script/update-core.js`

# Launch Dev Server
1. `node server.js`

# NPM Scripts
1. add scripts in package.json
```
"update-swim-core": "npm install https://github.com/miterfrants/swim.git && node node_modules/swim/auto-script/update-core.js",
"initial-swim-project": "node node_modules/swim/auto-script/generate-project-structure.js"
```
