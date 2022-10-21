const express = require('express')
const { load } = require('csv-load-sync');
const redis = require("redis");

const app = express()
const port = 3000

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

app.get('/get_salary_by_role', (req, res) => {
  console.time()
  const job_title = "Android Developer"

  // Load the Data from Disc
  const csv = load('./data/Software_Professional_Salaries.csv');

  // Filter only the required Job title
  let filtered_csv = csv.filter(item => item['Job Title'] == job_title)

  // Calculate the Overall Salary and Find the Average
  let overall_sum = filtered_csv.reduce((previousValue, currentItem) => Number(previousValue) + Number(currentItem['Salary']), 0)
  res.send({ job_title: overall_sum / filtered_csv.length })

  console.timeEnd()
}
)


app.get('/get_salary_by_role_with_redis', async (req, res) => {
  console.time()
  const job_title = "Android Developer"
  // check if given job title is stored in redis
  let average_salary = await redisClient.get(job_title)

  //  Calculate the value if it's a catch miss
  if (!average_salary) {
    const csv = load('./data/Software_Professional_Salaries.csv');
    let filtered_csv = csv.filter(item => item['Job Title'] == job_title)
    let overall_sum = filtered_csv.reduce((previousValue, currentItem) => Number(previousValue) + Number(currentItem['Salary']), 0)
    average_salary = overall_sum / filtered_csv.length

    // Store the calculated value into Redis
    redisClient.set(job_title, average_salary)
  }
  res.send({ job_title: average_salary })
  console.timeEnd()
}
)


app.listen(port, () => console.log(`Example app listening on port ${port}!`))