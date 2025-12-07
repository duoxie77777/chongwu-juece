const errorHandler = (err, req, res, next) => {
    // 记录错误
    console.error('Error:', err);

    // 获取错误堆栈
    const errorStack = err.stack || '';

    // 处理特定的 Multer 错误
    if (err.code === 'LIMIT_PART_COUNT') {
        return res.status(400).json({
            code: 400,
            message: '表单字段过多'
        });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            code: 400,
            message: '文件大小超过限制（最大 5MB）'
        });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            code: 400,
            message: '上传文件数超过限制'
        });
    }

    if (err.code === 'LIMIT_FIELD_KEY') {
        return res.status(400).json({
            code: 400,
            message: '字段名过长'
        });
    }

    if (err.code === 'LIMIT_FIELD_VALUE') {
        return res.status(400).json({
            code: 400,
            message: '字段值过长'
        });
    }

    // 处理 Busboy 流错误
    if (err.message && (err.message.includes('Unexpected end of form') || err.message.includes('Connection prematurely closed'))) {
        return res.status(400).json({
            code: 400,
            message: '请求格式不正确或连接中断，请确保使用正确的 multipart/form-data 格式'
        });
    }

    // 处理数据库错误
    if (err.code && typeof err.code === 'string' && err.code.startsWith('ER_')) {
        // MySQL 错误代码，返回 400 或 500
        const isClientError = err.code.includes('BAD_FIELD') || 
                             err.code.includes('PARSE_ERROR') ||
                             err.code.includes('BAD_TABLE');
        return res.status(isClientError ? 400 : 500).json({
            code: isClientError ? 400 : 500,
            message: err.message || '数据库操作失败',
            stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        });
    }

    // 确定状态码 - 只使用有效的 HTTP 状态码（100-599 之间的整数）
    let statusCode = 500;
    if (err.status && Number.isInteger(err.status) && err.status >= 100 && err.status < 600) {
        statusCode = err.status;
    } else if (err.statusCode && Number.isInteger(err.statusCode) && err.statusCode >= 100 && err.statusCode < 600) {
        statusCode = err.statusCode;
    } else if (err.code && Number.isInteger(err.code) && err.code >= 100 && err.code < 600) {
        statusCode = err.code;
    }

    // 构建错误响应
    const errorResponse = {
        message: err.message || 'Internal Server Error',
    }

    // 发送错误响应
    res.status(statusCode).json({
        code: statusCode,
        message: errorResponse.message,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
    })
}

module.exports = errorHandler;