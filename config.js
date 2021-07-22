module.exports= {
    server: {
        port: 3005,
        host: '0.0.0.0',
        fileRoot: 'public'
    },
    dblite: {
        name: 'users.db3',
        location: '../data',
        usrinsert: `INSERT INTO users (user_status, user_login, user_pwd, user_time, user_created)
                    VALUES (0,?,?,?,?);`,
        // profileinsert: `INSERT INTO profiles (user_id, profile_status, userFirst, userLast, userSuffix, company, position, companyWeb, contactPhone, country, city, state, mailingAddr) VALUES (?,0,?,?,?,?,?,?,?,?,?,?,?);`  
        // profileinsert: `INSERT INTO profiles (user_id, userFirst, userLast, userSuffix, company, position, companyWeb, contactPhone, country, city, state)
        // VALUES (:user_id, :userFirst, :userLast, :userSuffix, :company, :position, :companyWeb, :contactPhone, :country, :city, :state);` 
        // profileinsert: `INSERT INTO profiles (user_id, profile_status, userFirst, userLast, userSuffix, company, position, companyWeb, contactPhone, country, city, state, mailingAddr)
        // VALUES (:user_id, :profile_status, :userFirst, :userLast, :userSuffix, :company, :position, :companyWeb, :contactPhone, :country, :city, :state, :mailingAddr);`            
   }
}