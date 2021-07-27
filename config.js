module.exports= {
    server: {
        port: 3005,
        host: '0.0.0.0',
        fileRoot: 'public'
    },
    jwt: {
        secret:'3c255ba79194a85af4556360e664c6e0'
    },
    dblite: {
        name: 'users.db3',
        location: '../data',
        usrinsert: `INSERT INTO users (user_status, user_role, user_login, user_pwd, user_time, user_created)
                    VALUES (0,?,?,?,?,?);`,
        userlogin: `select * from users where user_status = 0 and user_login = ? and user_pwd = ?`,
        userByToken: `select * from users where user_status = 0 and user_token = ?`
   }
   
}