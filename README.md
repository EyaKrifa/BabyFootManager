# BabyFootManager
BabyFoot Manager is a real-time collaborative web application designed for managing and tracking foosball games.

## Modules

The application is structured around several key modules:

- **Game Management** : Allows users to create, delete, and mark games as completed.
- **Real-time Updates** : All changes to games (creation, deletion, completion) are instantly propagated to all connected clients.
- **User Interface** : Includes features to differentiate between completed and ongoing games, and display a real-time counter of ongoing games.
- **Integrated Chat** : Provides a real-time chat feature for users to communicate while using the application.

## Architecture
- **Backend (Node.js)** : The Node.js server handles game management and real-time communication via WebSockets. It connects to a PostgreSQL database to store game information.
- **Database (PostgreSQL)** : stores game-related data, including game status (completed or ongoing).
- **Frontend (JavaScript)** : The frontend is built with JavaScript.
  
## Database Configuration
### Creating the Database and Table

1. **Creating the Database**:
   - Ensure PostgreSQL is installed and running on your machine.
   - Use pgAdmin or a command-line interface to create a new database named `babyfoot`.

2. **Creating the `parties` Table**:
   - Use SQL to create the `parties` table in your `babyfoot` database. Here's the SQL command:
     ```sql
     CREATE TABLE parties (
         id SERIAL PRIMARY KEY,
         name VARCHAR(255) NOT NULL,
         status VARCHAR(50) NOT NULL DEFAULT 'active',
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```
   - This table includes fields `id` (primary key), `name` (party name), `status` (party status), and `created_at` (timestamp of party creation).
