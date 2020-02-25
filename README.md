# Features
- no need to wait bundle & build in dev mode
- base on es module & es6
- bundle and build by webpack4 for production

# Initial Swim Project
1. `npm init -y` init node project
2. `npm install https://github.com/miterfrants/swim.git` install swim from github
3. `node node_modules/swim/auto/initialize-project-structure.js` initialize swim structure of project

# Update Swim Core Libs
`npm run swim-update`

# Launch Dev Server
1. open terminal and point to your project folder
2. `cd ./src` point to src folder
3. `node server.js` run dev server with nodejs
4. open `https://localhost/todos/` with browser

# Launch Build Server
1. open terminal with your project
2. `cd ./dist` point to distribution folder
3. `npm run swim-build` build and bundle js, css, html
4. `node server.js` run bundle code with nodejs
5. open `https://localhost/todos/` with browser
