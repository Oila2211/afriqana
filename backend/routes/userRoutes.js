import  express  from "express";
const router = express.Router();
import { 
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    redeemQanaPoints,
    getUsers,
    deleteUser,
    getUserByID,
    updateUser
} from "../controllers/userController.js";
import { admin, protect } from "../middleware/authMiddleware.js";


// remember all these re connected to '/api/users/'
router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/logout', logoutUser);
router.post('/login', authUser);
router.post('/redeem', protect, redeemQanaPoints)
router.route('/profile').get( protect, getUserProfile).put(protect, updateUserProfile);
router.route('/:id').delete(protect, admin, deleteUser).get(protect, 
admin, getUserByID).put(protect, admin, updateUser);



export default router;