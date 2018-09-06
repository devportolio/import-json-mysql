# Import json file through command line

Steps:
1. Install node on the environment
2. clone this repository https://github.com/devportolio/import-json-mysql.git
3. Open the file import.js and edit this section based on your mysql credentials

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "json_import"
});

4. Save the json file that you want to import inside the folder _source_
5. Run this command to import the file
### node import --table=mytablename --filename=file1.json
