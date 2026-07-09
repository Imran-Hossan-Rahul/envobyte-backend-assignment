# Envobyte Backend Intern Assignment - Monica CRM (Node.js)

Hello! Welcome to my submission for the Envobyte Backend Intern Assignment. My task was to set up Monica locally and extend the existing Contact module with a Favorite and Notes feature.

Based on the email update from the HR team on July 6, we were allowed to use a different backend technology if we are not familiar with PHP/Laravel. So, I decided to build this using Node.js, Express, and Knex.js.


## Setup Instructions
If you want to run this project on your computer, please follow these steps sequentially:
### 1. Clone this project
```bash
git clone https://github.com/Imran-Hossan-Rahul/envobyte-backend-assignment
```
> **Note:** As per the assignment requirements, this repository defaults to the `envobyte-intern-assignment` branch.

```bash
cd envobyte-backend-assignment
```
### 2. Install Packages
```bash
npm install
```
### 3. Setup Original Monica Database
This Node.js API requires the original Monica CRM database to be running and seeded. 
*(If you don't have the original Monica project downloaded yet, clone it first:)*
```bash
git clone https://github.com/monicahq/monica.git
cd monica
```
If you already have it downloaded, simply open a new terminal and go into your **`monica`** folder. Then follow these Docker (Laravel Sail) instructions to set up the database:
- Make sure you have created a `.env` file in the Monica folder (by copying from `.env.example`).
- **Important `.env` Settings:** Open your Monica `.env` file and ensure you have these exact values set (to connect properly inside Docker and avoid port conflicts on your PC):
  - `DB_CONNECTION=mysql`
  - `DB_HOST=mariadb` *(Crucial: must be mariadb, not 127.0.0.1)*
  - `DB_PORT=3306`
  - `DB_DATABASE=monica`
  - `DB_USERNAME=monica`
  - `DB_PASSWORD=secret`
  - `FORWARD_DB_PORT=3308`
  - `FORWARD_REDIS_PORT=6380` *(If 3308 or 6380 are blocked on your PC, change them to free ports like 3309 or 6381).*
- Start the necessary containers (I recommend running only these two to save RAM):
```bash
docker compose up -d mariadb laravel.test
```
- **If this is a fresh clone**, install the required packages and prepare the database first:
```bash
docker compose exec laravel.test composer install
docker compose exec laravel.test php artisan key:generate
docker compose exec laravel.test php artisan migrate
```
- **If you already have a running project (or after doing the above)**, just seed the dummy data into the database:
```bash
docker compose exec laravel.test php artisan monica:dummy --force -vvv
```

### 4. Database Settings (Node.js App)
Since this is a fresh clone, you need to set up your environment file. 
Simply copy (or rename) the `.env.example` file to `.env`. 
> [!IMPORTANT]
> Open the `.env` file and ensure **all** database credentials exactly match what you configured in Step 3. If you changed the Port (`FORWARD_DB_PORT`), Username, Password, or Database Name in Monica's `.env`, you **must** update them here to match!
```env
# Express Server Configuration
PORT=5000
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3308 # (Change this if you used a different FORWARD_DB_PORT, or 3306 for XAMPP)
DB_USER=monica
DB_PASSWORD=secret
DB_NAME=monica

```

> [!TIP]
> **Troubleshooting Note:** If your Windows machine, Docker, or Hyper-V blocks port 5000 and you get an `EACCES` or `Connection Refused` error, simply change the `PORT` variable in your `.env` file to any other available/free port (e.g., 8000 or 4000) and restart the server.

### 5. Database Migration
Make sure your terminal is inside the **`envobyte-backend-assignment`** folder (Node.js project), then run this command to add the `is_favorite` and `personal_note` columns to the Monica contacts table:
```bash
npx knex migrate:latest
```

### 6. Start the Server
```bash
npm start
```

### 7. Run Tests
```bash
npm test
```

## Implementation Approach
### 1. Project Setup & Problem Solving (My Journey)
I completed this assignment using Node.js, but I strictly followed all the guidelines and requirements. 
First, I set up Monica locally using Docker by following the official [Monica Documentation](https://docs.monicahq.com/developers/docker). I tried running the project using `yarn docker:run`. But I realized that this command builds the production image and uses an SQLite database by default, which stays as an isolated file inside Docker. Since I was building a separate Node.js server, trying to connect to that SQLite file inside Docker would not be practical. So, I decided to use MySQL. I copied Monica's `.env.example` to `.env` and set `DB_CONNECTION=mysql`. 
Then, to run the project, I decided to use Laravel Sail so I could forward the database to a port on my local PC. But while running docker-compose, I faced several port conflicts on my Windows machine (ports 80, 5173, and 11211 were already blocked). 
Since I am only building a Node.js backend API, I realized I don't even need Monica's frontend, cron, queue, or meilisearch containers! So, to save my PC's RAM from running unnecessary containers and to avoid the port conflicts, I changed the database port in the `.env` file to `FORWARD_DB_PORT=3308`. After that, I ran a specific command in the terminal: `docker compose up -d mariadb laravel.test`. This ran only the database and the main app containers. This was a great optimization for my project setup.
After setting up the project according to the assignment rules, I ran the `php artisan db:seed` command to add default test data. But later, when I completed Part 3 and started testing my API endpoints, the data was not showing up. I realized the response was empty because there was actually no data in the database. 
Because of this, I carefully checked the official Monica documentation again and found that the actual command to add dummy data is `php artisan monica:dummy --force -vvv`. The assignment mentioned `db:seed`, but after reading the docs, I saw the real command was `monica:dummy`, so I used that instead.
### 2. Code Implementation
After setting up the project locally, I carefully reviewed the assignment requirements and mapped them to my Node.js architecture. My primary focus was to strictly follow Monica's existing API conventions while ensuring high performance. Here is a detailed breakdown of my approach:
- **Part 2 (Database Changes):** I created a proper Knex.js migration using the `alterTable` schema builder to safely add the `is_favorite` (boolean, defaulting to false) and `personal_note` (nullable text) columns to the `contacts` table without disrupting existing data.
  
- **Part 3 (API Endpoints):** I built modular controllers (`ContactController`, `ContactFavoriteController`, and `ContactNoteController`) to cleanly separate the logic. I handled the `GET /api/contacts/{id}` endpoint inside the `ContactController`, while the POST/PATCH/DELETE/PUT operations for favorites and notes were handled in their respective controllers. The responses strictly follow Monica's existing API conventions by wrapping the payload in a consistent JSON `data` object. *(Note: During early development, I created a temporary `/api/all-contacts` endpoint just to quickly fetch and verify the database seed data. Once everything was working perfectly, I removed it to keep the final codebase clean and strictly aligned with the requirements).*
- **Part 4 (Contact Search & Filtering):** Since Part 3 didn't require building the base `GET /api/contacts` listing endpoint, I built it from scratch specifically for this section. To ensure I perfectly matched Monica's existing pagination and sorting features, I deeply studied the original Laravel codebase (specifically at `monica\app\Domains\Contact\ManageContact\Web\Controllers\ContactController.php`). I replicated that base logic in my Node.js `ContactController.js` and then extended it using Knex's query builder. I implemented dynamic conditional filtering to support `?favorite=1`, `?search=keyword` (searching across multiple name fields), or both combined. To fulfill the strict *"do not duplicate query logic"* requirement, I used `query.clone()` to efficiently fetch the total count for the `meta` pagination object.
- **Part 5 (Statistics API):** To fulfill the strict requirements of returning a consistent JSON response and avoiding loading all contacts into memory, I did not fetch data into JavaScript arrays. Instead, I filtered the data for the authenticated user and wrote a highly optimized, single raw SQL query in Knex using `SUM(CASE WHEN ...)` conditional aggregation. This calculates the `total_contacts`, `favorite_contacts`, and `contacts_with_notes` entirely on the database side in one go (O(1) memory complexity).
- **Part 6 (Tests):** I wrote a comprehensive Jest and Supertest suite (`contacts.test.js`). I covered the three required feature tests (marking a contact as favorite, updating a personal note, and filtering contacts using `favorite=1`), and also added extra tests to verify the search functionality and the statistics endpoint fields.

## Assumptions Made
- **Authentication & Multi-tenancy:** I built this Node.js app from scratch, so I did not build a full JWT login system. To fulfill the "authenticated user" requirement in Part 5, I assumed the existence of an Auth Middleware. I created `authMiddleware.js` which manually sets `req.user.account_id = 1` to demonstrate how I would handle multi-tenant user data in a real project.
- **Pagination Defaults:** For the listing endpoint, I assumed a default pagination limit of 15 items per page and a default sorting column of `first_name` if no query parameters are provided.
---

## Limitations & Trade-offs

- **Fake Authentication:** The authentication is mocked. In a real project, we would use proper JWT or Session validation.
- **Testing Database:** My Jest tests use the main development database. Normally, we should use a separate test database so we don't mutate real data, but for this assignment, I used the main one to keep it simple.


## Estimated Time Spent

Total Time: About 16 Hours
- **1 Hour**: Reading the assignment PDF and understanding the requirements.
- **3 Hours**: Looking at the Monica CRM repository, forking/cloning, understanding the code, and researching how to implement it using Node.js.
- **1 Hour**: Setting up the Node.js project and configuring the database using Docker.
- **5 Hours**: Implementing the features part-by-part (took about 1 hour for each part).
- **1 Hour**: Figuring out and fixing the "Only include contacts belonging to the authenticated user/account" requirement for the stats API.
- **5 Hours**: Reviewing the code, testing, fixing bugs, and writing this README file.