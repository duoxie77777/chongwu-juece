const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAllUsers, getUserDetail, createUser, updateUser, deleteUser, register, login, updateProfile, changePassword, createAdoptionApplication, getUserAdoptions, getUserVolunteerInfo, applyVolunteer, getUserOrders, getVolunteerApplications, getVolunteerApplicationStats, getVolunteerApplicationDetail, updateVolunteerApplicationStatus, adminResetPassword } = require('../controllers/userRoutes');

// 公开路由
router.get('/users', getAllUsers);
router.post('/register', register);
router.post('/login', login);

// 需要认证的路由
router.use(auth);

// 当前用户个人资料
router.get('/profile', getUserDetail); // 获取当前用户信息
router.put('/profile', updateProfile); // 更新个人资料
router.post('/change-password', changePassword); // 修改密码

// 领养相关
router.post('/adoptions', createAdoptionApplication); // 创建领养申请
router.get('/adoptions', getUserAdoptions); // 获取用户领养记录

// 志愿者相关
router.get('/volunteer', getUserVolunteerInfo); // 获取用户志愿者信息
router.post('/volunteer', applyVolunteer); // 申请成为志愿者

// 志愿者申请管理（管理员）
router.get('/volunteer-applications/stats', getVolunteerApplicationStats); // 获取志愿者申请统计（必须在:id之前）
router.get('/volunteer-applications', getVolunteerApplications); // 获取志愿者申请列表
router.get('/volunteer-applications/:id', getVolunteerApplicationDetail); // 获取志愿者申请详情
router.put('/volunteer-applications/:id', updateVolunteerApplicationStatus); // 审批志愿者申请

// 订单相关
router.get('/orders', getUserOrders); // 获取用户订单记录

// 用户管理路由
router.post('/users', createUser);
router.get('/users/:id', getUserDetail);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/reset-password', adminResetPassword); // 管理员重置用户密码

module.exports = router;