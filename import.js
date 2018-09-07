const fs = require("fs");

const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "json_import"
});

connection.connect();
let TABLE_NAME = "table1";
let FILENAME = "file1.json";

process.argv.forEach(element => {
  let line = element.split("=");
  if (line[0] && line[0].trim() == "--table") {
    TABLE_NAME = line[1] ? line[1].trim() : "invalid";
  }
  if (line[0] && line[0].trim() == "--filename") {
    FILENAME = line[1] ? line[1].trim() : "invalid";
  }
});

connection.query(
  `SELECT count(*) as cnt FROM information_schema.TABLES WHERE TABLE_NAME = '${TABLE_NAME}' AND TABLE_SCHEMA in (SELECT DATABASE());`,
  (err, data) => {
    if (data && data[0].cnt == 1) {
      connection.query(`DELETE FROM ${TABLE_NAME}`);
    }
  }
);
fs.readFile(`./source/${FILENAME}`, "utf8", function(err, data) {
  if (err) throw err;

  const records = JSON.parse(data);
  const columns = Object.keys(records[0]);
  const schema = columns.join("` TEXT, `");

  connection.query(
    "CREATE TABLE IF NOT EXISTS " + TABLE_NAME + "(`" + schema + "` TEXT);"
  );

  const col_insert = "`" + columns.join("`, `") + "`";
  let data_length = records.length;
  records.forEach(record => {
    const values = Object.values(record);
    let val_insert = '`' + values.join('`, `') + '`';

    val_insert = val_insert.replace(/"/g, "'")
    val_insert = val_insert.replace(/`/g, '"')

    const query = `INSERT INTO ${TABLE_NAME} (${col_insert}) VALUES (${val_insert})`;
    connection.query(query, (err, data) => {
      if(err) {
        console.log(query, record)
        process.exit();
      }

      data_length = data_length - 1;
      console.log(`Importing... (${data_length}) Record(s)`);
      console.clear();
      if (!data_length) {
        console.log(`Done importing (${records.length}) Records`);
        process.exit();
      }
    });
  });
});
