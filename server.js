const http = require('http');
const fs = require('fs');
const url = require('url');
const EventEmitter = require('events');

const port = 3000;
const todos_file = './todos.json'; //path file to store
const logs_file = './logs.txt';

// ===============LOGGING FUNCTION===============

const logRequest = new EventEmitter(); // create an instance of EventEmitter for logging

logRequest.on('log', (message) => {
    const timestamp = new Date().toISOString(); // get the current timestamp in ISO format
    // append the timestamp and log message to the logs.txt file
    fs.appendFile(logs_file, `${timestamp} - ${message}\n`, (error) => {
        if (error) {
            console.error('Failed to write log:', error);
        }
    });
});

// ===============READ TODOS FROM FILE===============

const readTodos = () => {
    return new Promise((resolve, reject) => {
        // read the content of the todos.json file
        fs.readFile(todos_file, 'utf8', (error, data) => {
            if (error) {
                reject(error);
                return;
            }
            try {
                const todos = JSON.parse(data); // try to parse the JSON data
                resolve(todos);
            } catch (parseErr) {
                reject(parseErr);
            }
        });
    });
};

// ===============WRITE TODOS TO FILE===============

const writeTodos = (todos) => {
    return new Promise((resolve, reject) => {
        // write the JSON string of todos to the todos.json file
        fs.writeFile(todos_file, JSON.stringify(todos, null, 2), (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
};

// function to get the JSON request body from the incoming request
const getRequestBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = ''; // initialize an empty string para istore ang request body
        // listen for 'data' events, which provide chunks of the request body
        req.on('data', (chunk) => {
            body += chunk.toString(); // append the chunk to the body string
        });

        // listen for the 'end' event, signifies the end of the request body
        req.on('end', () => {
            try {
                const data = JSON.parse(body); // try to parse the accumulated body as JSON
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', (error) => {
            reject(error);
        });
    });
};

// ===============CREATE HTTP SERVER===============

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true); // parse the request URL with query parameters
    const path = parsedUrl.pathname; // extract the path from the parsed URL
    const method = req.method; // get the HTTP method of the request /get/post etc

    logRequest.emit('log', `${method} ${path}`); // emit a 'log' event with the request method and path

// ===============HANDLE REQUESTS START WITH /TODOS===============

    if (path.startsWith('/todos')) {
        const parts = path.split('/').filter(Boolean); // split the path by '/', remove empty strings
        // extract the ID if it exists (the second part after /todos/) and parse it as an integer
        const id = parts[1] ? parseInt(parts[1]) : null;

        try {
            let todos = await readTodos();

// ===============HANDLE GET REQUESTS TO /TODOS===============

            // fetch all todos or filter by completed status
            if (method === 'GET' && parts.length === 1) {
                let result = todos; // initialize the result with all todos

                // check if the 'completed' query parameter exists
                if (parsedUrl.query.completed) {
                    // filter todos based on the 'completed' query parameter
                    const completedFilter = parsedUrl.query.completed === 'true';
                    result = todos.filter(t => t.completed === completedFilter);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' }); // set response headers to 200 OK and JSON content type //header sa thunder client
                res.end(JSON.stringify(result)); // send the JSON string of the result as the response
                return; //end na to 
            }

// ===============HANDLE GET REQUESTS TO /TODOS/:ID===============

            // fetch a specific todo by ID
            if (method === 'GET' && parts.length === 2) {
                const todo = todos.find(t => t.id === id); // find the todo with the matching ID
                if (!todo) {
                    res.writeHead(404); // set response status to 404 Not Found
                    res.end('Todo not found');
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' }); // set response headers to 200 OK and JSON content type
                res.end(JSON.stringify(todo)); // send the JSON string of the found todo as the response
                return;
            }

// ===============HANDLE POST REQUESTS TO /TODOS===============

            // create a new todo
            if (method === 'POST' && parts.length === 1) {
                const data = await getRequestBody(req); // get the JSON request body
                if (!data.title) {
                    res.writeHead(400); // set response status to 400 Bad Request
                    res.end('Missing title');
                    return;
                }
                const newTodo = {
                    // assign a new ID (simple incrementing logic)
                    id: todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1,
                    title: data.title,
                    // set 'completed' to false if not provided in the request body
                    completed: data.completed ?? false,
                };
                todos.push(newTodo); // add the new todo to the array
                await writeTodos(todos); // write the updated todos array
                res.writeHead(200, { 'Content-Type': 'application/json' }); // set response headers to 200 OK and JSON content type
                res.end(JSON.stringify(newTodo)); // send the JSON string of the new todo as the response
                return;
            }

// ===============HANDLE PUT REQUESTS TO /TODOS/:id===============

            // update a todo by ID
            if (method === 'PUT' && parts.length === 2) {
                const data = await getRequestBody(req); // get the JSON request body
                const index = todos.findIndex(t => t.id === id); // find the index of the todo with the matching ID
                if (index === -1) {
                    res.writeHead(404); // set response status to 404 Not Found
                    res.end('Todo not found'); // send a 'Todo not found' message
                    return;
                }
                // update the todo at the found index with the data from the request body, ensuring the ID is preserved
                todos[index] = {
                    ...todos[index],
                    ...data,
                    id: id,
                };
                await writeTodos(todos); //  write the updated todos array
                res.writeHead(200, { 'Content-Type': 'application/json' }); // set response headers to 200 OK and JSON content type
                res.end(JSON.stringify(todos[index])); // send the JSON string of the updated todo as the response
                return;
            }

// ===============HANDLE DELETE REQUESTS TO /TODOS/:id===============

            // delete a todo by ID
            if (method === 'DELETE' && parts.length === 2) {
                const index = todos.findIndex(t => t.id === id); // find the index of the todo with the matching ID
                if (index === -1) {
                    res.writeHead(404); // set response status to 404 Not Found
                    res.end('Todo not found');
                    return; 
                }
                todos.splice(index, 1); // remove the todo at the found index
                await writeTodos(todos); // write the updated todos array
                res.writeHead(200); // set response status to 200 OK
                res.end('Todo Deleted'); 
                return; 
            }

            // if the route for /todos was not matched by any of the above conditions
            res.writeHead(404); // set response status to 404 Not Found
            res.end('Not Found');
        } catch (error) {
            console.error('Error:', error); // log any errors
            res.writeHead(500); // set response status to 500 Internal Server Error
            res.end('Internal Server Error'); // send an 'Internal Server Error' message
        }
    } else {
        // if the request path does not start with /todos
        res.writeHead(404); // set response status to 404 Not Found
        res.end('Not Found'); // send a 'Not Found' message
    }
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// ok na to