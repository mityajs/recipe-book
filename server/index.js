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

//authorisation
app.post('/auth', async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const postData = await pool.query(
      'SELECT * FROM users where email = $1 and password = $2',
      [email, password]
    )
    res.json(postData.rows)
  } catch (err) {
    console.error(err)
  }
})
//создать рец - добавить ингредиенты - связать с рецептом - добавить в фаворитс юзеру
//add timestamp for tables
//create recipe
app.post('/newrecipe', async (req, res) => {
  try {
    const title = req.body.title
    const steps = req.body.steps
    const description = req.body.description
    const postData = await pool.query(
      'insert into recipes(title, steps, description) values($1,$2,$3) returning *',
      [title, steps, description]
    )
    res.json(postData.rows[0])
  } catch (err) {
    console.log(err)
  }
})

//search recipe
app.post('/recipes-search', async (req, res) => {
  try {
    const search = '%' + req.body.search + '%'
    const userId = req.body.userId
    const postData = await pool.query(
      'SELECT recipes.*, fav.user_id as liked from recipes left join (select * from favourites where user_id = $1) as fav on recipes.recipe_id = fav.recipe_id where title ilike $2 or description ilike $2 or steps ilike $2',
      [userId, search]
    )
    res.json(postData.rows)
  } catch (err) {
    console.log(err)
  }
})

//search favourite recipes
app.post('/favourite-recipes-search', async (req, res) => {
  try {
    const search = '%' + req.body.search + '%'
    const userId = req.body.userId
    const postData = await pool.query(
      'SELECT * FROM recipes WHERE recipe_id IN (SELECT recipe_id FROM favourites WHERE user_id = $1) and (title ilike $1 or description ilike $1 or steps ilike $1)',
      [search, userId]
    )
    res.json(postData.rows)
  } catch (err) {
    console.log(err)
  }
})

//favourite recipes
app.post('/favourite-recipes', async (req, res) => {
  try {
    const userId = req.body.userId
    const postData = await pool.query(
      'SELECT * FROM recipes WHERE recipe_id IN (SELECT recipe_id FROM favourites WHERE user_id = $1)',
      [userId]
    )
    res.json(postData.rows)
  } catch (err) {
    console.log(err)
  }
})

//get recipe by id
app.get('/recipe/:id', async (req, res) => {
  try {
    const { id } = req.params
    const getData = await pool.query(
      'SELECT * FROM recipes where recipe_id = $1',
      [id]
    )
    res.json(getData.rows)
  } catch (err) {
    console.error(err)
  }
})

//-----------------------------------------
//get recipe by id with categories and ingredients
app.post('/get_recipe', async (req, res) => {
  try {
    const recipe_id = req.body.recipe_id
    const getData = await pool.query(
      'SELECT * FROM recipes where recipe_id=$1',
      [recipe_id]
    )

    res.json(getData.rows[0])
  } catch (err) {
    console.error(err)
  }
})
app.post('/get_recipe_categories', async (req, res) => {
  try {
    const recipe_id = req.body.recipe_id
    const getData = await pool.query(
      'select rcat.rec_cat_id,cat.* from categories as cat left join recipe_categories as rcat on cat.category_id = rcat.category_id where rcat.recipe_id = $1',
      [recipe_id]
    )

    res.json(getData.rows)
  } catch (err) {
    console.error(err)
  }
})
app.post('/get_recipe_ingredients', async (req, res) => {
  try {
    const recipe_id = req.body.recipe_id
    const getData = await pool.query(
      'select ringr.rec_ingr_id, ringr.amount,ingr.* from ingredients as ingr left join recipe_ingredients as ringr on ingr.ingredient_id = ringr.ingredient_id where ringr.recipe_id = $1',
      [recipe_id]
    )

    res.json(getData.rows)
  } catch (err) {
    console.error(err)
  }
})
//---------------------------------------

//get all recipes (with liked status)
app.post('/all-recipes', async (req, res) => {
  try {
    const userId = req.body.userId
    const postData = await pool.query(
      'SELECT recipes.*, fav.user_id as liked from recipes left join (select * from favourites where user_id = $1) as fav on recipes.recipe_id = fav.recipe_id',
      [userId]
    )
    res.json(postData.rows)
  } catch (err) {
    console.log(err)
  }
})

//get all recipes of some category
app.post('/all-recipes-of-category', async (req, res) => {
  try {
    const userId = req.body.userId
    const category = req.body.category
    const postData = await pool.query(
      'SELECT recipes.*, fav.user_id as liked from recipes left join (select * from favourites where user_id = $1) as fav on recipes.recipe_id = fav.recipe_id where recipes.recipe_id in (select recipe_id from recipe_categories as rcat inner join categories as cat on rcat.category_id=cat.category_id where cat.name=$2)',
      [userId, category]
    )
    res.json(postData.rows)
  } catch (err) {
    console.log(err)
  }
})
//get all recipes
app.get('/recipes', async (req, res) => {
  try {
    const getData = await pool.query('SELECT * FROM recipes')
    res.json(getData.rows)
  } catch (err) {
    console.error(err)
  }
})

//----------------------------------------------
//update recipe by id with categories and ingredients
app.put('/put_recipe', async (req, res) => {
  try {
    const recipe_id = req.body.recipe_id
    const title = req.body.title
    const steps = req.body.steps
    const description = req.body.description
    const postData = await pool.query(
      'update recipes set title = $1, steps = $2, description = $3 where recipe_id = $4',
      [title, steps, description, recipe_id]
    )
    res.json(postData.rows[0])
  } catch (err) {
    console.log(err)
  }
})
app.put('/put_recipe_ingredients', async (req, res) => {
  try {
    const recipe_id = req.body.recipe_id
    const title = req.body.title
    const steps = req.body.steps
    const postData = await pool.query(
      'update recipes set title = $1, steps = $2 where recipe_id = $3 returning *',
      [title, steps, id]
    )
    res.json(postData.rows[0])
  } catch (err) {
    console.log(err)
  }
})

//-------------------------------------------------

//delete recipe
app.delete('/recipe', async (req, res) => {
  try {
    const recipe_id = req.body.recipe_id
    const deleteFromRecCat = await pool.query(
      'delete from recipes_categories where recipe_id = $1',
      [recipe_id]
    )
    const deleteFromRecIngr = await pool.query(
      'delete from recipes_ingredients where recipe_id = $1',
      [recipe_id]
    )
    const deleteFromRecipes = await pool.query(
      'delete from recipes where recipe_id = $1',
      [recipe_id]
    )
    res.json(
      `recipe ${recipe_id} was deleted:${
        deleteFromRecCat && deleteFromRecIngr && deleteFromRecipes
      }`
    )
  } catch (err) {
    console.log(err)
  }
})

//get all users
app.get('/users', async (req, res) => {
  try {
    const getData = await pool.query('SELECT * FROM users')
    res.json(getData.rows)
  } catch (err) {
    console.error(err)
  }
})

//user by parameter
app.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params
    const getData = await pool.query('SELECT * FROM users where user_id = $1', [
      id,
    ])
    res.json(getData.rows)
  } catch (err) {
    console.error(err)
  }
})

//create user
app.post('/newuser', async (req, res) => {
  try {
    const name = req.body.name
    const email = req.body.name
    const password = req.body.name
    const role = req.body.role
    const postData = await pool.query(
      'insert into users(user_name, email, password, role_id) values($1,$2,$3,$4)',
      [name, email, password, role]
    )
    res.json(postData.rows[0])
  } catch (err) {
    console.log(err)
  }
})

//update user
app.put('/user/:id', async (req, res) => {
  try {
    const { id } = req.params
    const name = req.body.name
    const email = req.body.name
    const password = req.body.name
    const role = req.body.role
    const updateData = await pool.query(
      'update users set user_name = $1, email = $2, password = $3, role_id = $4 where user_id = $5',
      [name, email, password, role, id]
    )
    res.json(`user with id=${id} was updated`)
  } catch (err) {
    console.error(err)
  }
})

//delete user
app.delete('/user/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleteData = await pool.query(
      'delete from users where user_id = $1',
      [id]
    )
    res.json(`user with id=${id} was deleted`)
  } catch (err) {
    console.log(err)
  }
})

//get favourites
app.get('/favourites', async (req, res) => {
  try {
    const getData = await pool.query('SELECT * FROM favourites')
    res.json(getData.rows)
  } catch (err) {
    console.error(err)
  }
})

//get favourites by id
app.get('/favourites/:id', async (req, res) => {
  try {
    const { id } = req.params
    const getData = await pool.query(
      'SELECT * FROM favourites where fav_id = $1',
      [id]
    )
    res.json(getData.rows[0])
  } catch (err) {
    console.error(err)
  }
})

//create favourite
app.post('/favourites', async (req, res) => {
  try {
    const userId = req.body.userId
    const recipeId = req.body.recipeId
    const postData = await pool.query(
      'INSERT INTO favourites (user_id, recipe_id) VALUES($1,$2) RETURNING *',
      [userId, recipeId]
    )
    res.json(postData.rows[0])
  } catch (err) {
    console.error(err)
  }
})

//update favourites
app.put('/favourites/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.body.userId
    const recipeId = req.body.recipeId
    const updateData = await pool.query(
      'UPDATE favourites SET user_id = $1, recipe_id = $2 WHERE fav_id = $3',
      [userId, recipeId, id]
    )
    res.json(`fav with id=${id} was updated`)
  } catch (err) {
    console.error(err)
  }
})

//delete favourites
app.delete('/favourites', async (req, res) => {
  try {
    const userId = req.body.userId
    const recipeId = req.body.recipeId
    const deleteData = await pool.query(
      'DELETE FROM favourites WHERE user_id = $1 and recipe_id = $2',
      [userId, recipeId]
    )
    res.json(`fav with id=${id} was deleted`)
  } catch (err) {
    console.error(err)
  }
})

//delete favourites
app.delete('/favourites/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleteData = await pool.query(
      'DELETE FROM favourites WHERE fav_id = $1;',
      [id]
    )
    res.json(`fav with id=${id} was deleted`)
  } catch (err) {
    console.error(err)
  }
})

//get roles
app.get('/roles', async (req, res) => {
  try {
    const getData = await pool.query('SELECT * FROM roles')
    res.json(getData.rows)
  } catch (err) {
    console.error(err)
  }
})

//create role
app.post('/newrole', async (req, res) => {
  try {
    const { name } = req.body
    const postData = await pool.query(
      'INSERT INTO roles (role_name) VALUES($1) RETURNING *',
      [name]
    )
    res.json(postData.rows[0])
  } catch (err) {
    console.error(err)
  }
})

//update role
app.put('/role/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    const updateData = await pool.query(
      'UPDATE roles SET role_name = $1 WHERE role_id = $2',
      [name, id]
    )
    res.json(`role with id=${id} was updated`)
  } catch (err) {
    console.error(err)
  }
})

//delete role
app.delete('/role/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleteData = await pool.query(
      'DELETE FROM roles WHERE role_id = $1;',
      [id]
    )
    res.json(`role with id=${id} was deleted`)
  } catch (err) {
    console.error(err)
  }
})

//get all categories USED
app.get('/categories', async (req, res) => {
  try {
    const getData = await pool.query('SELECT * FROM categories')
    res.json(getData.rows)
  } catch (err) {
    console.error(err)
  }
})

//create category USED
app.post('/newcategory', async (req, res) => {
  try {
    const { name } = req.body
    const postData = await pool.query(
      'INSERT INTO categories (name) VALUES($1) RETURNING *',
      [name]
    )
    res.json(postData.rows[0])
  } catch (err) {
    console.error(err)
  }
})

//update category USED
app.put('/category', async (req, res) => {
  try {
    const category_id = req.body.category_id
    const name = req.body.name
    const updateData = await pool.query(
      'UPDATE categories SET name = $1 WHERE category_id = $2',
      [name, category_id]
    )
    res.json(`category with id=${category_id} was updated`)
  } catch (err) {
    console.error(err)
  }
})

//delete category USED
app.delete('/category', async (req, res) => {
  try {
    const category_id = req.body.category_id
    const deleteFromRecCat = await pool.query(
      'DELETE FROM recipe_categories WHERE category_id = $1;',
      [category_id]
    )
    const deleteFromCat = await pool.query(
      'DELETE FROM categories WHERE category_id = $1;',
      [category_id]
    )
    res.json(`category with id=${category_id} was deleted`)
  } catch (err) {
    console.error(err)
  }
})

//get recipe_categories
app.get('/recipe-categories', async (req, res) => {
  try {
    const getData = await pool.query('SELECT * FROM recipe_categories')
    res.json(getData.rows)
  } catch (err) {
    console.error(err)
  }
})

//get r_c by id
app.get('/recipe-categories/:id', async (req, res) => {
  try {
    const { id } = req.params
    const getData = await pool.query(
      'SELECT * FROM recipe_categories where rec_cat_id = $1',
      [id]
    )
    res.json(getData.rows[0])
  } catch (err) {
    console.error(err)
  }
})

//create r_c USED
app.post('/recipe-categories', async (req, res) => {
  try {
    const recipe_id = req.body.recipe_id
    const category_id = req.body.category_id
    const postData = await pool.query(
      'INSERT INTO recipe_categories (recipe_id, category_id) VALUES($1,$2) RETURNING *',
      [recipe_id, category_id]
    )
    res.json(postData.rows[0])
  } catch (err) {
    console.error(err)
  }
})

//update r_c
app.put('/recipe-categories/:id', async (req, res) => {
  try {
    const { id } = req.params
    const recipeId = req.body.recipeId
    const categoryId = req.body.categoryId
    const updateData = await pool.query(
      'UPDATE recipe_categories SET recipe_id = $1, category_id = $2 WHERE rec_cat_id = $3',
      [recipeId, categoryId, id]
    )
    res.json(`rec_cat with id=${id} was updated`)
  } catch (err) {
    console.error(err)
  }
})

//delete r_c USED
app.delete('/recipe-categories', async (req, res) => {
  try {
    const category_id = req.body.category_id
    const recipe_id = req.body.recipe_id
    const deleteData = await pool.query(
      'DELETE FROM recipe_categories WHERE category_id = $1 and recipe_id = $2',
      [category_id, recipe_id]
    )
    res.json(`rec_category with id=${id} was deleted`)
  } catch (err) {
    console.error(err)
  }
})

//get all ingredients USED
app.get('/ingredients', async (req, res) => {
  try {
    const getData = await pool.query('SELECT * FROM ingredients')
    res.json(getData.rows)
  } catch (err) {
    console.error(err)
  }
})

//create ingredient USED
app.post('/ingredient', async (req, res) => {
  try {
    const name = req.body.name
    const description = req.body.description
    const postData = await pool.query(
      'INSERT INTO ingredients (name, description) VALUES($1, $2) RETURNING *',
      [name, description]
    )
    res.json(postData.rows[0])
  } catch (err) {
    console.error(err)
  }
})

//update ingredient USED
app.put('/ingredient', async (req, res) => {
  try {
    const ingredient_id = req.body.ingredient_id
    const name = req.body.name
    const description = req.body.description
    const updateData = await pool.query(
      'UPDATE ingredients SET name = $1, description = $2 WHERE ingredient_id = $3',
      [name, description, ingredient_id]
    )
    res.json(`ingredient with id=${ingredient_id} was updated: ${updateData}`)
  } catch (err) {
    console.error(err)
  }
})

//delete ingredient USED
app.delete('/ingredient', async (req, res) => {
  try {
    const ingredient_id = req.body.ingredient_id
    const deleteFromRecIngr = await pool.query(
      'DELETE FROM recipe_ingredients WHERE ingredient_id = $1;',
      [ingredient_id]
    )
    const deleteFromIngr = await pool.query(
      'DELETE FROM ingredients WHERE ingredient_id = $1;',
      [ingredient_id]
    )
    res.json(`ingredient with id=${ingredient_id} was deleted`)
  } catch (err) {
    console.error(err)
  }
})

//get recipe_ingredients
app.get('/recipe-ingredients', async (req, res) => {
  try {
    const getData = await pool.query('SELECT * FROM recipe_ingredients')
    res.json(getData.rows)
  } catch (err) {
    console.error(err)
  }
})

//get r_i by id
app.get('/recipe-ingredients/:id', async (req, res) => {
  try {
    const { id } = req.params
    const getData = await pool.query(
      'SELECT * FROM recipe_ingredients where rec_ingr_id = $1',
      [id]
    )
    res.json(getData.rows[0])
  } catch (err) {
    console.error(err)
  }
})

//create r_i USED
app.post('/recipe-ingredients', async (req, res) => {
  try {
    const recipe_id = req.body.recipe_id
    const ingredient_id = req.body.ingredient_id
    const amount = req.body.amount
    const postData = await pool.query(
      'INSERT INTO recipe_ingredients (recipe_id, ingredient_id,amount) VALUES($1,$2,$3) RETURNING *',
      [recipe_id, ingredient_id, amount]
    )
    res.json(postData.rows[0])
  } catch (err) {
    console.error(err)
  }
})

//update r_i USED
app.put('/recipe-ingredients', async (req, res) => {
  try {
    const rec_ingr_id = req.body.rec_ingr_id
    const recipe_id = req.body.recipe_id
    const ingredient_id = req.body.ingredient_id
    const amount = req.body.amount
    const updateData = await pool.query(
      'UPDATE recipe_ingredients SET recipe_id = $1, ingredient_id = $2, amount = $3 WHERE rec_cat_id = $4',
      [recipe_id, ingredient_id, amount, rec_ingr_id]
    )
    res.json(`rec_cat with id=${id} was updated`)
  } catch (err) {
    console.error(err)
  }
})

//delete r_i USED
app.delete('/recipe-ingredients', async (req, res) => {
  try {
    const rec_ingr_id = req.body.rec_ingr_id
    const deleteData = await pool.query(
      'DELETE FROM recipe_categories WHERE rec_ingr_id = $1;',
      [rec_ingr_id]
    )
    res.json(`rec_ingredient with id=${id} was deleted`)
  } catch (err) {
    console.error(err)
  }
})

app.listen(port, () => {
  console.log(`server has started on port ${port}`)
})
