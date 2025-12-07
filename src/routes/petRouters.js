const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const {
    getAllPets,
    getPetDetails,
    createPet,
    updatePet,
    deletePet,
    batchDeletePets
} = require('../controllers/petRoutes');

// 公开路由
router.get('/list', getAllPets);
// 宠物详情使用可选认证，以便记录登录用户的浏览行为
router.get('/:id', optionalAuth, getPetDetails);

// 需要认证的路由
// router.use(auth);

// 宠物管理接口
router.post('/', createPet);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);
router.post('/batch-delete', batchDeletePets);

module.exports = router;