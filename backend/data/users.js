import bcrypt from 'bcryptjs';

const users = [
    {
        name: 'Admin User',
        email: 'admin@email.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: true
    },
    {
        name: 'Yvone Nena',
        email: 'yvonne@email.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: false,
    },
    {
        name: 'Nkechi Tata',
        email: 'nkechi@email.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: true
    },
    {
        name: 'Baby User',
        email: 'baby@email.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: false
    }
]

export default users;