## Vim-Strudel REPL


### 1. Installation & Setup

 ##### Step 1: Clone the Repository

    git clone https://github.com/mrinmoyf2/Vim-Strudel.git
    cd Vim-Strudel

 ##### Step 2: Install Dependencies
    npm install

 ##### Step 3: Download Browsers for Playwright
    npx playwright install

 ##### Step 4: Update Your Vim Configuration:
1. In  ~/.vimrc
    
  ```  
  autocmd BufWritePost main.js silent! !curl -X POST --header "Content-Type: text/plain" --data "%" http://localhost:3000/update
  ```
2. Add the following line to the end of the file. This creates an "autocommand" that triggers only when you save a file named main.js inside your project.

```
autocmd BufWritePost main.js silent! !curl -X POST --header "Content-Type: text/plain" --data "%" http://localhost:3000/update
```


### 2. Start the Server:
    node server.js

---

### 3. Organize Your Project Files
Now, structure your project with a main file and component files. Your server directory (vim-strudel-live) should look like this:
```
vim-strudel-live/
├── node_modules/
├── components/
│   ├── drums.js
├── main.js
├── package.json
└── server.js
```

### Example File Content:

components/drums.js

```
// This file only contains the drum pattern
sound("bd hh*2 sd [hh bd] bd - [hh sd] cp")
```

main.js

```
// @import "./components/drums.js"
```

### Workflow

1. Run `node server.js`.
2. Open `main.js` and your component files (e.g., `drums.js`) in Vim.
3. Make changes to `drums.js` and save it. Nothing will happen.
5. Now, simply open `main.js` and save it (`:w`), even without making any changes.
6. The server will now re-read `main.js`, pull in the latest versions of `drums.js`, and update Strudel with the complete result.