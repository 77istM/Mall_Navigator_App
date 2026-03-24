### Status report (Always write before sign off)
1. App condition: Running
2. Date: 24 MAR
3. Work has been done:
     1. api working, location-target shows on map
     2. data is consistent
     3. Basic UI.
     4. Private event mode added *needs refractoring.
     6. 2nd Sensor functionality  (need to work on).
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
## 🗺️ Workflow


### Phase 1: 🏗️ Planning & Repository Setup *(Agile Foundation)*

- [ ] Set up the private GitHub repository and share it with the module team before writing any code.
- [ ] Create a **task backlog** to plan work — demonstrating evidence of task planning, iterative development, and collaboration is a mandatory *Agile Working Requirement*.

---

### Phase 2: 🔌 Data Persistence & API Connection *(The Core)*

- [ ] Begin with **data integration** using the university-provided GeoQuest REST API, pre-populated with dummy data for key entities: `Users`, `Events`, `Caches`, and `Finds`.
- [ ] Make initial `GET` requests to endpoints (e.g., `/api/caches`) using the public test key `16gv8f`.
- [ ] Establish a **persistence strategy** — connect to the API first, or set up a local/cloud database (e.g., Firebase or Realm), so that actual cache coordinates and descriptions are available when building the UI and map.

---

### Phase 3: 🖥️ Basic UI Skeleton & Map Integration *(Visualizing the Data)*

- [ ] Build the **fundamental UI** by creating multiple screens with clear navigation between them.
- [ ] Implement **Map Integration** to display the virtual caches retrieved from the API.

---

### Phase 4: 📡 Sensor Integration & Core Gameplay *(Making it Interactive)*

- [ ] Implement the **gameplay logic** for either *Global Mode* or *Private Event Mode*.
- [ ] Integrate **GPS / location services** *(mandatory sensor)* to:
  - Display the user's current location on the map.
  - Calculate proximity to nearby caches.
  - Unlock and log a cache when the player travels within a defined proximity.
- [ ] Integrate a **second mandatory sensor** (e.g., camera for photo evidence, or accelerometer/compass), ensuring its use is directly and meaningfully tied to app functionality.

---

### Phase 5: ✨ Iteration & Polish *(Refining the App)*

> As this is an agile project, continuously loop back through the phases above.

- [ ] Add **user feedback and status indicators** throughout the UI.
- [ ] Ensure the app conforms to **UX best practices** and the UI conventions of the chosen platform (iOS or Android).
- [ ] Maintain a clean **Git commit history** with meaningful, regular commits from both partners — this directly impacts the final grade.
