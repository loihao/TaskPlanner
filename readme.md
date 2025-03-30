In order for the app to work, please create a database call budgetplanner, and create the table below. Please also adjust the server.js with the appropriate host, user, and password. The app should work correctly using android studio.

CREATE TABLE budget (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense DECIMAL(15, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    createdDateTime DATETIME(0)  
);
