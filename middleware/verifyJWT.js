const JWT = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config();

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization //get authorization header
    if(!authHeader || !authHeader.startsWith("Bearer ")) { //check if the token starts with the string "Bearer" and if the authorization header has a value
        return(
            res.status(403).json({
                message: 'invalid token'
            })
        )
    }
    const token = authHeader.split(" ")[1] //convert the authorzation header to an array using the split() method and access the 2nd item (the token)
    if(!token) { //check if the token exist
        return(
            res.status(404).json({
                message: 'ERROR! Token not found'
            })
        )
    }
    JWT.verify(token, process.env.SECRET_KEY, (error, decoded) => { //verify the validity of the token and extract the payload(user info)
        if(error) {
            return(
                res.status(401).json({
                    message: 'Unauthorized access'
                })
            )
        }
        req.user = decoded; //populate the request object with the payload
        console.log('DECODED TOKEN:', decoded);
        next()
    })
}

module.exports = verifyJWT