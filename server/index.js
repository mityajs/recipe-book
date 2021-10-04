const express = require('express')
const app = express()
const cors = require('cors')
const port = 5000
const pool = require('./db')

app.use(cors())
app.use(express.json())

//testpost
app.post('/test', async (req, res) => {
  try {
    const { value } = req.body
    const postData = await pool.query(
      'INSERT INTO test (test_value) VALUES($1) RETURNING *',
      [value]
    )
    res.json(postData.rows[0])
  } catch (err) {
    console.error(err)
  }
})

//testgetall
app.get('/test', async (req, res) => {
  try {
    const getData = await pool.query('SELECT * FROM test')
    res.json(getData.rows)
  } catch (err) {
    console.error(err)
  }
})

//testgetbyid
app.get('/test/:id', async (req, res) => {
  try {
    const { id } = req.params
    const getData = await pool.query('SELECT * FROM test WHERE test_id = $1', [
      id,
    ])
    res.json(getData.rows[0])
  } catch (err) {
    console.error(err)
  }
})

//testput
app.put('/test/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { value } = req.body
    const updateData = await pool.query(
      'UPDATE test SET test_value = $1 WHERE test_id = $2',
      [value, id]
    )
    res.json(`item with id=${id} was updated`)
  } catch (err) {
    console.error(err)
  }
})

//testdelete
app.delete('/test/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleteData = await pool.query('DELETE FROM test WHERE test_id = $1', [
      id,
    ])
    res.json(`item with id=${id} was deleted`)
  } catch (err) {
    console.error(err)
  }
})

// create recipe

//get recipe by id

//get all recipes

//update recipe

//delete recipe

app.listen(port, () => {
  console.log(`server has started on port ${port}`)
})
