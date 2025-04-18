# APPDEV2 - MIDTERM PROJECT

Submitted by: Princess Olingay

BSIS - 3 

### **Project Summary:**

This project is a basic RESTful API built with Node.js that allows users to manage a list of **"todos"** *(simple tasks)*. Instead of using a centralized database, the todos objects are stored and retrieved from a local JSON file **(todos.json)**. This Project supports the fundamental **CRUD (Create, Read, Update, Delete)** operations for managing these tasks. Additionally, the server logs each incoming request to a text file **(logs.txt)** for basic tracking.

### **Installation and Running Instructions:**

• Ensure that you have Node.js installed on your system.

• Clone your repository in Github.

• Create **server.js** file.

• Create **todos.json** file, you can pre-populate it with some sample todos in JSON, an empty one will also work initially. 

### **Running the Project:** 

• Start the Server in your installed IDE and with the following command: **node server.js**.

• You should see a message in your terminal indicating that the server is running, if everything is set up correctly. 

• You can interact with the API using tools like **Thunder Client (VS Code Extension)**

### Try these requests: 

→ **Get all todos:** [ GET http://localhost:3000/todos ]

→ **Get a specific todo (e.g., with ID 1):** [ GET http://localhost:3000/todos/1 ]

→ **Create a new todo:** [ POST http://localhost:3000/todos with a JSON body like {"title": "Build an API"} and the Content-Type: application/json header. ] 

→ **Update a todo (e.g., with ID 1):** [ PUT http://localhost:3000/todos/1 with a JSON body like {"completed": true} and the Content-Type: application/json header. ]

→ **Delete a todo (e.g., with ID 1):** [ DELETE http://localhost:3000/todos/1 ] 

• To **stop** the server, go back to your terminal where the server is running and press Ctrl + C or Cmd + . on macOS

**Project Video Demo Link**

For a more detailed walkthrough, visit this link:

https://tinyurl.com/26vcr69e





