# El Instrumento

### Teammate: Leon Dail && Smiti Shakya

## Links

- Link to live app: [Live Version](https://newest-spaced-rep-client.now.sh/) 
- Link to client repo: [Client Repo](https://github.com/thinkful-ei-gecko/Smiti-Leon-new-spaced-repetition-client)
- Link to API repo: [Server Repo](https://github.com/thinkful-ei-gecko/Smiti-Leon-Spaced-Repetion-Server)


## Getting Started

- Clone the repository and run npm i
- Create local Postgresql databases: spaced-repetition and spaced-repetition-test
- Run `npm run migrate` and `npm run migrate:test` to update each database
- To seed, use terminal to enter root of application and run: `psql -d spaced-repettion -f ./seeds/seed.tables.sql`
- Run `npm run dev` to start the server locally


## Endpoints
* ```POST /api/auth/token ``` - lets the user log in
* ```POST /api/user/ ```  - registers a user
* ```PUT /api/auth/token ``` - retrieves a new JWT key
* ```GET /api/language/ ```  - retrieves a list of words for a user
* ```POST /api/language/guess ``` - post a guess word for a user

## Summary

El Instrumento is an application that helps a user learn a language using the [Spaced Repetition](https://en.wikipedia.org/wiki/Spaced_repetition) algorithm which is proven to increase the rate of learning dramatically. This version contains beginnings to learning the Spanish language, starting with the English/Spanish translations of common musical instruments.


## Tech
  - Node 
  - Express, 
  - PostgreSQL
  - Heroku

