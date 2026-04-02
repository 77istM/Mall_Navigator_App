### Status report (Always write before sign off)
     1.Private event mode added *needs refractoring.
     2. Sensor - GPS, Compass, Camera, accelerometer, step counter*needs testing added. 
     Future work on- refractoring big files into smaller chunks.
---
-Always use branch for development, never push code that is not working. Don't use github copilot (github will keep track of it).

-When code is in working condition then push to master branch.

-Avoid modifying api.js (unless integrating new api), app.json, index.js, package-lock.json, package.json that will crash the app.

-Here's what I do:
1. Create a new brach from master.
2. Write, update, modify code using VS Code.
3. If the app is running then 'commit & push' to current branch. If it's not working then fix the errors.
4. When app is working & I want to move to build new feature then 'pull request' > 'merge & sqash'.
5. Start again from 1.

---
