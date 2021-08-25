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
                    VALUES (1,?,?,?,?,?);`,
        userRoles: `select role_id ID, role_name Role from roles where role_isAdmin = 0`,
        userSelect: `select u.user_id Id, r.role_name Role,u.user_login Login,u.user_status Status,u.user_time,u.user_created,
        p.profile_status, p.userSuffix||' '||p.userFirst||' '||p.userLast as User, p.position Position, p.company Company, p.country Country, p.contactPhone Phone
        from users u join profiles p on p.user_id = u.user_id join roles r on r.role_id = u.user_role where u.user_status = ? and p.profile_status = 0`,
        userlogin: `select  u.user_id,u.user_login,u.user_role,u.user_init, p.userFirst,p.userLast,p.userSuffix,p.position from users u join profiles p on p.user_id = u.user_id where u.user_status = 0 and p.profile_status = 0 and user_login = ? and user_pwd = ?`,
        userByToken: `select * from users where user_status = 0 and user_token = ?`,
        userFlipStatus: `update users set user_status = not user_status where user_id = ?`
   }
   
}