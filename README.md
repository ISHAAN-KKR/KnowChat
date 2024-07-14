# KnowChat - Realtime Chat App

**KnowChat** is a simple realtime chat application, part of the larger project **KnowIdea**. Built using HTML, CSS, JavaScript, and Tailwind CSS, it provides a seamless and responsive chat experience.

## Features

- **Realtime Communication**: Chat with other users in realtime.
- **Responsive Design**: Optimized for both desktop and mobile devices using Tailwind CSS.
- **User-friendly Interface**: Simple and intuitive UI.

## Technologies Used

- **HTML**: Structure of the web application.
- **CSS**: Basic styling.
- **JavaScript**: Adding interactivity.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Socket.IO**: Real-time bidirectional event-based communication.

## Setup Instructions

### Prerequisites

Ensure you have the following installed:

- **Node.js** (for running the backend server)
- **NPM** (Node Package Manager)

### Installation

1. **Clone the repository**:
   ```sh
   git clone https://github.com/yourusername/knowchat.git
   cd knowchat
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Run the server**:
   ```sh
   node server.js
   ```

### Project Structure

```plaintext
knowchat/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── script.js
│   └── index.html
├── server.js
├── package.json
└── README.md
```

### File Descriptions

- **public/index.html**: Main HTML file for the chat interface.
- **public/css/styles.css**: Custom styles and Tailwind CSS configuration.
- **public/js/script.js**: Client-side JavaScript for handling chat functionality.
- **server.js**: Node.js server script using Socket.IO for real-time communication.
- **package.json**: Lists project dependencies and scripts.

### Running the Application

1. **Start the server**:
   ```sh
   node server.js
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

### Usage

- Open multiple browser windows or tabs.
- Enter your username.
- Start chatting in realtime with other users.

## Customization

- **Tailwind CSS**: Customize the design by modifying the `tailwind.config.js` file or adding classes directly in your HTML.
- **JavaScript**: Modify the `public/js/script.js` file to add more features or change the existing functionality.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your improvements.

## License

This project is licensed under the MIT License.

## Acknowledgements

- **Socket.IO**: For enabling realtime communication.
- **Tailwind CSS**: For providing a great utility-first CSS framework.

---

Enjoy chatting with your friends in realtime! If you have any questions or feedback, feel free to reach out.

---

### Example Code Snippets

#### HTML (`public/index.html`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="css/styles.css" rel="stylesheet">
    <title>KnowChat - Realtime Chat App</title>
</head>
<body class="bg-gray-100">
    <div id="chat-container" class="container mx-auto p-4">
        <div class="bg-white p-4 rounded shadow-md">
            <h1 class="text-2xl font-bold mb-4">KnowChat</h1>
            <div id="messages" class="mb-4"></div>
            <input id="message-input" type="text" class="w-full p-2 border rounded" placeholder="Type a message...">
        </div>
    </div>
    <script src="/socket.io/socket.io.js"></script>
    <script src="js/script.js"></script>
</body>
</html>
```

#### CSS (`public/css/styles.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles can be added here */
```

#### JavaScript (`public/js/script.js`)
```javascript
const socket = io();

document.getElementById('message-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const message = event.target.value;
        socket.emit('chat message', message);
        event.target.value = '';
    }
});

socket.on('chat message', function(msg) {
    const item = document.createElement('div');
    item.textContent = msg;
    document.getElementById('messages').appendChild(item);
});
```

#### Server (`server.js`)
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
```

This README provides a comprehensive guide for setting up and running the KnowChat application, including example code snippets for each part of the application.
