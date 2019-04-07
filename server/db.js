const mysql = require("mysql2/promise")
const config = require('./config.json')
const db = mysql.createPool({
  host : config.db.host,
  port : config.db.port,
  user : config.db.user,
  password : config.db.pw,
  database : config.db.name,
  charset : config.db.charset
})

exports.check_user = async (user) => {
  try {
    const connection = await db.getConnection(async conn => conn);
    try {
      query = `SELECT * FROM chat_user WHERE k_id=?`
      const [rows] = await connection.query(query,[user.k_id])

      let user_db = rows[0]

      if (user.k_nick != user_db.k_nick || user.k_img != user_db.k_img){
        query = `update chat_user k_nick=?,k_img=? WHERE k_id=?`
        await connection.query(query,[user.k_id])
        user_db.k_nick = user.k_nick
        user_db.k_img = user.k_img
      }

      return user_db
    } catch(err) {
      console.log('Query Error : check_user');
      connection.release();
      return false
    }
  } catch(err) {
    console.log('DB Error');
    return false
  }
};

exports.change_stat = async (id, stat) => {
  try {
    const connection = await db.getConnection(async conn => conn);
    try {
      query = `update chat_user status=? WHERE k_id=?`
      await connection.query(query,[stat, id])

    } catch(err) {
      console.log('Query Error : check_user');
      connection.release();
      return false
    }
  } catch(err) {
    console.log('DB Error');
    return false
  }
};

exports.set_user = async (id, nick, img, perm) => {
  try {
    const connection = await db.getConnection(async conn => conn);
    try {
      query = `INSERT INTO chat_user
      (k_id, k_nick,k_img, perm)
      values (?, ?, ?, ?)`
      const result = await connection.query(query, [id, nick, img, perm]);
    } catch(err) {
      console.log('Query Error : set_user');
      connection.release();
      return false
    }
  } catch(err) {
    console.log('DB Error');
    return false
  }
}

exports.get_user_list = async () => {
  try {
    const connection = await db.getConnection(async conn => conn);
    try {
      query = `SELECT k_id,k_nick,k_img FROM chat_user WHERE status=?`
      const rows = await connection.query(query, ["on"]);
      return rows[0]
    } catch(err) {
      console.log('Query Error : get_user_list');
      connection.release();
      return false
    }
  } catch(err) {
    console.log('DB Error');
    return false
  }
}

exports.set_log = function(ip, k_id, type,reson){
  if (reson){
    query = `INSERT INTO chat_log (ip, k_id, type, reson)
             values (?, ?, ?, ?)`

    console.log(query)
    db.query(query,[ip, k_id, type, reson], function(err, result) {
      if (!err)
      console.log('The solution is: ', result);
      else
      console.log('Error while performing Query.', err);
    });
  }else{
    query = `INSERT INTO chat_log (ip, k_id, type)
             values (?, ?, ?)`

    db.query(query,[ip, k_id, type], function(err, result) {
      if (!err)
      console.log('The solution is: ', result);
      else
      console.log('Error while performing Query.', err);
    });
  }
}
