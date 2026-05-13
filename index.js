const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./modules/person')

morgan.token('content', function getContent (req) {
    return JSON.stringify({ name: req.body.name, number: req.body.number})
})

const app = express()

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
app.use(cors())
app.use(express.static('dist'))

const generateId = () => {
    const id = Math.floor(Math.random() * 1000000000)
    return String(id)
}

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    }).catch(error => {
        console.error('Error fetching persons:', error.message)
        response.status(500).json({ error: 'Failed to fetch persons' })
    })
})

app.get('/info', (request, response) => {
    Person.countDocuments({}).then(count => {
        response.send('<p>Phonebook has info for ' + count +' people</p>' + 
                      '<p>' + new Date() + '</p>'
        )
    }).catch(error => {
        console.error('Error counting documents:', error.message)
        response.status(500).json({ error: 'Failed to retrieve info' })
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findById(id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => {
        console.error('Error fetching person:', error.message)
        response.status(500).json({ error: 'Failed to fetch person' })
    })
})

app.post('/api/persons', async (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    } else if (await Person.findOne({ name: body.name })) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    }).catch(error => {
        console.error('Error saving person:', error.message)
        response.status(500).json({ error: 'Failed to save person' })
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findByIdAndDelete(id).then(() => {
        response.status(204).end()
    }).catch(error => {
        console.error('Error deleting person:', error.message)
        response.status(500).json({ error: 'Failed to delete person' })
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})