## initial set up
1. Download Node: https://nodejs.org/en/download/
2. Download local version wherever you want to place it: `git clone https://github.com/kung8/purple-axomo.git`
3. Get inside the project root: `cd purple-axomo`
4. Create a file called .env for storing your login credentials: `touch .env`
5. Open and update .env file: `nano .env`
6. Add email to .env file: `EMAIL=` and add your email you use to sign in with axomo
7. Add password to .env file: `PASSWORD=` and add your password (this is case sensitive)
8. Close file: ctrl + x
9. Save file: y
10. Install all of the dependencies you need for the webscraping to work: `npm install`

By this point you should have everything set up.

## update your axomo-store-inventory.xlsx file
1. At the project root: `npm run scraper-start`
