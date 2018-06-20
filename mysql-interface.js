const mysql = require('mysql');

module.exports.intToBytes = {
    tinyint: 1,
    smallint: 2,
    mediumint: 3,
    int: 4,
    bigint: 5
};

module.exports.hasUnsigned = true;

module.exports.createConnection = (info) => {

    return mysql.createConnection(info)
}

module.exports.fetchInformation = (conn, schema, tableName, cb) => {

    const query = 'select * from information_schema.columns where table_schema = ?';

    if(tableName) {
        query += ' AND table_name = ?';
        conn.query(query, [schema, tableName], cb);
    }
    else {
        conn.query(query, schema, cb);
    }
}

module.exports.close = (conn) => {

    conn.end();
}

