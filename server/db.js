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

const test = async () => {
  try {
    const connection = await db.getConnection(async conn => conn);
    console.log('connected!')
    connection.release();
  } catch(err) {
    console.log('DB Error');
    return false
  }
}
exports.change_user_data = async (user) => {
  try {
    const connection = await db.getConnection(async conn => conn);
    try {
        query = `UPDATE chat_user SET k_nick=?,k_img=? WHERE k_id=?`
        if(!user.k_img){ //기본이미지
          user.k_img = "http://k.kakaocdn.net/dn/rJu1X/btqtS6FAMyF/zSCs8XLXN7RTKjO4FKftYK/profile_110x110c.jpg"
        }
        await connection.query(query,[user.k_nick,user.k_img,user.k_id])
        connection.release();
    } catch(err) {
      console.log('Query Error : change_user_data');
      console.log('Error : ' + err);
      connection.release();
      return false
    }
  } catch(err) {
    console.log('DB Error');
    return false
  }

}
exports.check_user = async (id) => {
  try {
    const connection = await db.getConnection(async conn => conn);
    try {
      query = `SELECT * FROM chat_user WHERE k_id=?`
      const [rows] = await connection.query(query,[id])
      let user_db = rows[0]
      connection.release();
      return user_db
    } catch(err) {
      console.log('Query Error : check_user');
      console.log('Error : ' + err);
      connection.release();
      return false
    }
  } catch(err) {
    console.log('DB Error');
    return false
  }
};

exports.set_stat = async (id, stat) => {
  try {
    const connection = await db.getConnection(async conn => conn);
    try {
      query = `UPDATE chat_user SET status=? WHERE k_id=?`
      await connection.query(query,[stat, id])
      connection.release();
    } catch(err) {
      console.log('Query Error : set_stat');
      console.log('Error : ' + err);
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
      (k_id, k_nick,k_img,status, perm)
      values (?, ?, ?, 'on', ?)`
      const result = await connection.query(query, [id, nick, img, perm]);
      connection.release();
    } catch(err) {
      console.log('Query Error : set_user');
      console.log('Error : ' + err);
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
      query = `SELECT k_id,k_nick,k_img,perm FROM chat_user WHERE status=?`
      const rows = await connection.query(query, ["on"]);
      connection.release();
      return rows[0]
    } catch(err) {
      console.log('Query Error : get_user_list');
      console.log('Error : ' + err);
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
      connection.release();
      return rows[0]
    } catch(err) {
      console.log('Query Error : get_user_list');
      connection.release();
      return false
    }
  } catch(err) {
    console.log('DB Error');
    console.log('Error : ' + err);
    return false
  }
}
exports.set_log = async (ip, k_id, type,reson) => {
  try {
    const connection = await db.getConnection(async conn => conn);
    try {
      if (reson){
        query = `INSERT INTO chat_log (ip, k_id, type, reson)
        values (?, ?, ?, ?)`
        connection.query(query,[ip, k_id, type, reson])
      }else{
        query = `INSERT INTO chat_log (ip, k_id, type)
        values (?, ?, ?)`
        connection.query(query,[ip, k_id, type])
      }
      connection.release();
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

test()
