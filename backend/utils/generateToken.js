import  jwt  from "jsonwebtoken";

const generateToken = (res, userId) => {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: '24h' //this token expires in 24 hours
        });

        // Set JWT as HTTP-Only cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 86400000  // 24 hours in milliseconds
        })
}

export default generateToken;