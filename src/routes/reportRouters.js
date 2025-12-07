const express = require('express');
const router = express.Router();

const {
    generateReport,
    exportReport,
    getReportList,
    getReportDetail,
    createReport,
    updateReport,
    deleteReport,
    publishReport,
    archiveReport
} = require('../controllers/reportRoutes');

// 生成统计报告
router.get('/generate', generateReport);

// 导出报告数据
router.get('/export', exportReport);

// 报告管理 CRUD
router.get('/list', getReportList);
router.get('/:id', getReportDetail);
router.post('/', createReport);
router.put('/:id', updateReport);
router.delete('/:id', deleteReport);
router.put('/:id/publish', publishReport);
router.put('/:id/archive', archiveReport);

module.exports = router;
