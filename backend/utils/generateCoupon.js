import crypto from 'crypto';


const generateCoupon = (length = 10) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length).toUpperCase(); 
}

export default generateCoupon;