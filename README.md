# MyWallet API
Handling personal finance management in applications requires a robust and reliable infrastructure. MyWallet, a RESTful API, provides a comprehensive solution to this challenge, enabling developers to easily incorporate expense and revenue control features into their applications.
<p align='center'>Checkout the frontend repository: https://github.com/VinicciusWirz/MyWallet</p>
<p align='center'>Try out the frontend deploy: https://my-wallet-front-end-sigma.vercel.app/</p>

## About
MyWallet API is a robust backend solution designed to empower developers in creating efficient financial management applications. The API offers a comprehensive set of features.

## Endpoints

- User registration (Singup)
<details>
  <summary>
  (POST "/sign-up")
  </summary>
  <ul>
    <li>
      Creates user account
    </li>
  </ul>
    
  ```javascript
  // body
  {
    name: "John Doe",
    email: "email@email.com", //unique email
    password: "1mApAsSwoRd!", //minimum of 3 characters
  }
  ```
</details>
<br/>

- User authentication (Signin)
<details>
  <summary>
  (POST "/sign-in")
  </summary>
  <ul>
    <li>
      Login into user's account
    </li>
    <li>
      Generates user's token
    </li>
  </ul>
    
  ```javascript
  // body
  {
    email: "email@email.com", //registered email
    password: "1mApAsSwoRd!",
  }
  ```
  ```javascript
  // response
  {
    name: "John Doe",
    token: "1234-5678-91011", //session token
  }
  ```
</details>
<br/>

- Retrieving all financial transactions for a user
<details>
  <summary>
  (GET "/transactions") 🔒
  </summary>
  <ul>
    <li>
      Authorization protected route
    </li>
    <li>
      Gets all transactions
    </li>
  </ul>
    
  ```javascript
  // response
  { transactions:
    [
      {
        id: ObjectId,
        description: "Salary",
        value: "500000", // value in cents
        type: "deposit", // "withdraw" || "deposit"
        date: "20/10/2020" // (DD/MM/YYYY)
      }, ...
    ]
  }
  ```
  
</details>
<br/>

- Retrieving one financial transaction for a user
<details>
  <summary>
  (GET "/transactions/:id") 🔒
  </summary>
  <ul>
    <li>
      Authorization protected route
    </li>
    <li>
      Gets transaction information
    </li>
  </ul>

  ```javascript
  // response
    {
      id: ObjectId,
      description: "Salary",
      value: "500000", // value in cents
      type: "deposit", // "withdraw" || "deposit"
      date: "20/10/2020" // (DD/MM/YYYY) optional
    }
  ```
</details>
<br/>

- Adding new entries
<details>
  <summary>
  (POST "/transactions") 🔒
  </summary>
  <ul>
    <li>
      Authorization protected route
    </li>
    <li>
      Creates transaction
    </li>
  </ul>

  ```javascript
  // body
    {
      description: "Salary",
      value: "500000", // value in cents
      type: "deposit", // "withdraw" || "deposit"
      date: "20/10/2020" // (DD/MM/YYYY) optional
    }
  ```
</details>
<br/>

- Editing existing entries
<details>
  <summary>
  (PUT "/transactions/:id") 🔒
  </summary>
  <ul>
    <li>
      Authorization protected route
    </li>
    <li>
      Updates transaction
    </li>
  </ul>
  
  ```javascript
  // body
    {
      description: "Salary",
      value: "500000", // value in cents
      type: "deposit", // "withdraw" || "deposit"
      date: "20/10/2020" // (DD/MM/YYYY) optional
    }
  ```
</details>
<br/>

- Removing entries
<details>
  <summary>(DELETE "/transactions/:id") 🔒</summary>
  <ul>
    <li>
      Authorization protected route
    </li>
    <li>
      Deletes transaction
    </li>
  </ul>
</details>
<br/>

With MyWallet API, developers can seamlessly integrate these functionalities into their applications, providing users with a powerful tool for managing their finances effectively.

All sensitive data is encrypted.

## Technologies
The following tools and frameworks were used in the construction of the project:

<p>
  <img style='margin: 5px;' src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E"/>
  <img style='margin: 5px;' src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img style='margin: 5px;' src="https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img style='margin: 5px;' src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white"/>
  <img style='margin: 5px;' src='https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E'/>
  <img style='margin: 5px;' src='https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white'/>
</p>

## How to use
1. Clone this repository
2. Install dependencies
```bash
$ npm i
```

3. Setup your environment variables (.env)

4. Run the app
```bash
# development
$ npm start

# watch mode
$ npm run dev
```
