const express = require('express');
const router = express.Router();

const userRoutes = require('../routes/userRouters');
const petRoutes = require('../routes/petRouters');
const uploadRoutes = require('../routes/uploadRouters');
const categoryRoutes = require('../routes/categoryRouters');
const productRoutes = require('../routes/productRouters');
const orderRoutes = require('../routes/orderRouters');
const storyRoutes = require('../routes/storyRouters');
const faqRoutes = require('../routes/faqRouters');
const storyCommentRoutes = require('../routes/storyCommentRouters');
const statisticsRoutes = require('../routes/statisticsRouters');
const reportRoutes = require('./reportRouters');
const cartRoutes = require('../routes/cartRouters');
const donationRoutes = require('../routes/donationRouters');
const adoptionRoutes = require('../routes/adoptionRouters');
const recommendRoutes = require('../routes/recommendRouters');

// user routes
router.use('/user', userRoutes);
// pet routes
router.use('/pet', petRoutes);
// category routes
router.use('/category', categoryRoutes);
// upload routes
router.use('/upload', uploadRoutes);
// product routes
router.use('/product', productRoutes);
// cart routes
router.use('/cart', cartRoutes);
// order routes
router.use('/order', orderRoutes);
// story routes
router.use('/story', storyRoutes);
// faq routes
router.use('/faq', faqRoutes);
// story comment routes
router.use('/story-comment', storyCommentRoutes);
// statistics routes
router.use('/statistics', statisticsRoutes);
// report routes
router.use('/report', reportRoutes);
// donation routes
router.use('/donation', donationRoutes);
// adoption application routes (admin)
router.use('/adoption-application', adoptionRoutes);
// recommend routes
router.use('/recommend', recommendRoutes);

module.exports = router