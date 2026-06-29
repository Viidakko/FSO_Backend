const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

if (!url) {
    console.error('MONGODB_URI environment variable is not set!')
    process.exit(1)
}

console.log('Connecting to MongoDB...')
console.log('URI:', url.replace(/mongodb\+srv:\/\/.*:.*@/, 'mongodb+srv://***:***@'))

mongoose.connect(url, {family: 4})
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.error('error connecting to MongoDB:', error.message)
        process.exit(1)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true
    },
    number: {
        type: String,
        minlength: 8,
        validate: {
            validator: function(v) {
                if (!v) return false
                const hyphenFormat = /^\d{2,3}-\d+$/
                const digitsOnly = v.replace(/\D/g, '')
                return hyphenFormat.test(v) && digitsOnly.length >= 8
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)