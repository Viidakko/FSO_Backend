const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

let newName = process.argv[3]
let newNumber = process.argv[4]

const url = `mongodb+srv://jhietikko02:${password}@cluster0.iy2ez.mongodb.net/test?appName=Cluster0`

// Debug: Show connection string (without password)
console.log(`Connecting to: mongodb+srv://jhietikko02:***@cluster0.iy2ez.mongodb.net/test?appName=Cluster0`)

mongoose.set('strictQuery', false)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

mongoose.connect(url).then(() => {
  const person = new Person({
    name: newName,
    number: newNumber,
  })

  if (process.argv[3] != null && process.argv[4] != null) {
    person.save().then(result => {
      console.log(`Added ${newName} number ${newNumber} to phonebook`)
      mongoose.connection.close()
    })
    
  } else {
    Person.find({}).then(result => {
      console.log("Phonebook:")
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })
  }
}).catch(error => {
  console.error('MongoDB connection failed:', error.message)
  process.exit(1)
})
