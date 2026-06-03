const fs = require('fs');
const initSqlJs = require('sql.js');
(async ()=>{
  const SQL = await initSqlJs();
  const buf = fs.readFileSync('./data/caphe.db');
  const db = new SQL.Database(buf);
  const rows = db.exec('SELECT id,name,image FROM cafes ORDER BY id');
  console.log(JSON.stringify(rows, null, 2));
})();