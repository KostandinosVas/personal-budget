const express = require('express');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());



// Global variables for envelopes
let envelopes = [];
let nextId = 1;    // This will be used to generate unique IDs




//Default route
app.get('/', (req, res) => {
    res.send('Hello World!');
});


// POST ENDPOINT TO CREATE A NEW ENVELOPE
app.post('/envelopes', (req, res) => {
    const { title, budget } = req.body;

    // Validate input
    if(!title || typeof budget !== 'number' || budget <= 0) {
        return res.status(400).send('Invalid request. Please provide a title and a positive budget.');
    }

    // crete a new envelope object
    const newEnvelope = {
        id: nextId++,
        title,
        budget
    };

    // Add the new envelope to the envelopes array
    envelopes.push(newEnvelope);

    // Send a success response
    res.status(200).json(newEnvelope);
});






// GET endpoint to retrieve all envelopes
app.get('/envelopes', (req, res) => {
    res.status(200).json(envelopes);
})



// GET endpoint to retrieve a specific envelope by ID
app.get('/envelopes/:id', (req, res) => {
    const { id } = req.params;

    // convert the id to a number
    const envelopedId = parseInt(id);

    // Find the envelope with the matching ID
    const envelope = envelopes.find(e => e.id === envelopedId);

    // If the envelope is not found, send a 404 error
    if(!envelope) {
        return res.status(400).send('Envelope not found');
    }

    // Send a success response
    res.status(200).json(envelope);
});





// PUT endpoint to update a specific envelope
app.put('/envelopes/:id', (req, res) => {
    const { id } = req.params;
    const { title, budget, subtract } = req.body;

    // Convert the ID to a number
    const envelopeId = parseInt(id);

    // Find the envelope with the corresponding ID
    const envelope = envelopes.find(e => e.id === envelopeId);

    // If the envelope does not exist, return a 404 error
    if (!envelope) {
        return res.status(404).send('Envelope not found');
    }

    // Validate and update the title
    if (title) {
        if (typeof title !== 'string' || title.trim() === '') {
            return res.status(400).send('Invalid title');
        }
        envelope.title = title.trim();
    }

    // Validate and update the budget
    if (budget !== undefined) {
        if (typeof budget !== 'number' || budget <= 0) {
            return res.status(400).send('Invalid budget. It must be a positive number.');
        }
        envelope.budget = budget;
    }

    // Validate and subtract from the budget
    if (subtract !== undefined) {
        if (typeof subtract !== 'number' || subtract <= 0) {
            return res.status(400).send('Invalid subtract value. It must be a positive number.');
        }
        if (envelope.budget < subtract) {
            return res.status(400).send('Insufficient budget to subtract the requested amount.');
        }
        envelope.budget -= subtract;
    }

    // Send a success response
    res.status(200).json(envelope);
});


// DELETE endpoint to delete a specific envelope by ID
app.delete('/envelopes/:id', (req, res) => {
    const { id } = req.params;

    // Convert the ID to a number
    const envelopeId = parseInt(id);

    // Find the envelope with the corresponding ID
    const envelope = envelopes.find(e => e.id === envelopeId);

    // If the envelope does not exist, return a 404 error
    if(!envelope) {
        return res.status(400).send('Envelope not found');
    }

    // Use filter to remove the envelope with the matching ID
    envelopes = envelopes.filter(e => e.id !== envelopeId);

    // Send a success response
    res.status(200).send('Envelope deleted successfully');
})



// POST endpoint to transfer money from one envelope to another
app.post('/envelopes/transfer/:from/:to', (req, res) => {
    const { from, to } = req.params;
    const { amount } = req.body;

    // Convert the envelope IDs to numbers
    const fromId = parseInt(from);
    const toId = parseInt(to);

    // Find the source (from) and destination (to) envelopes
    const fromEnvelope = envelopes.find(e => e.id === fromId);
    const toEnvelope = envelopes.find(e => e.id === toId);

    // If either envelope does not exist, return a 404 error
    if (!fromEnvelope) {
        return res.status(404).send(`Envelope with ID ${fromId} not found`);
    }
    if (!toEnvelope) {
        return res.status(404).send(`Envelope with ID ${toId} not found`);
    }

    // Validate the amount (should be a positive number and less than or equal to the balance of the "from" envelope)
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).send('Invalid amount. It must be a positive number.');
    }
    if (fromEnvelope.budget < amount) {
        return res.status(400).send('Insufficient funds in the source envelope.');
    }

    // Perform the transfer (subtract from the "from" envelope and add to the "to" envelope)
    fromEnvelope.budget -= amount;
    toEnvelope.budget += amount;

    // Send a success response
    res.status(200).json({
        message: `Successfully transferred ${amount} from envelope ID ${fromId} to envelope ID ${toId}`,
        fromEnvelope,
        toEnvelope
    });
});















// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});