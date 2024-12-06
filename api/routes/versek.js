const express = require('express');

const router = express.Router();

const pool = require('./sqlconnect')

let serverData = "Loading";

const update = async () => {
  try {
    serverData = await fetchData();
  } catch (err) {
    console.error('Error in update function:', err);
  }
};

router.get('/data', async (req, res) => {
  try {
    await update();
    res.json(serverData);
  } catch (err) {
    console.error('Error fetching data:', err);
    
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function fetchData() {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM versek", (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

module.exports = router