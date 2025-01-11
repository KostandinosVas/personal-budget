const express = require('express');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

//Default route
app.get('/', (req, res) => {
    res.send('HEllo World!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});