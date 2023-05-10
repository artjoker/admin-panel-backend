# Admin panel backend
 _This is a backend application for an admin panel built using Node.js and TypeScript. It includes features such as authentication and authorization, file uploading, and validation._


## Requirements

- Node.js v14.x or higher
- PostgreSQL v13.x or higher


## Tech

The following open-source projects were used to develop artjoker-admin-panel:

- [Express] - fast node.js network app framework
- [TypeORM] - an ORM (Object-Relational Mapping) for TypeScript and JavaScript
- [JWT (JSON Web Token)] - authentication and authorization technology.
- [bcryptjs ] - a library for hashing passwords
- [Swagger UI Express] - a tool for creating interactive API documentation
- [Multer] - middleware for handling multipart/form-data files
- [Cors] - middleware for managing access to resources from different sources
- [Class Transformer) - a library for transforming classes
- [Class Validator] - a library for data validation


## Setup:
- You can  Clone this repository. 
``` bash
git clone https://github.com/artjoker/admin-panel-backend.git
```
- Install and run PostgreSQL on your system or provide a remote connection string.
- Install dependencies
 ```bash
yarn install

npm install
 ```
### Environment
This package can be configured by environment variables out-of-box (.env):
``` bash
PORT= The port that the server will run on.
DB_HOST= The hostname of the database server.
DB_PORT= The port of the database server (default: 3000).
DB_USERNAME= The username used to connect to the database.
DB_PASSWORD= The password used to connect to the database.
DB_DATABASE= The name of the database to connect to.
SECRET_KEY= The secret key used to sign JWT tokens (default: 'secret').
ADMIN_EMAIL= The email address of the default admin user (default:'admin@admin.com').
ADMIN_PASSWORD= The password of the default admin user (default: 'Qwerty12345').
```
## Testing:

Will run all of the unit and behaviour tests and generate a coverage file.  
Current project test-coverage is **100%** to provide examples on all possible test cases.  
```bash
yarn test

npm test
```

## Code Style:
 
If you want to enforce a specific code style, you can run [ESLint](https://eslint.org/docs/latest/rules/) with your desired configuration. This project follows a standard JavaScript code style.
```bash
yarn run lint

npm run lint
```

## License

license. Please see the [license file](license.md) for more information.
