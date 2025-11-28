const errorHandler = (err, req, res, next) => {
    // 记录错误
    console.error('Error:', err);

    // 获取错误堆栈
    const errorStack = err.stack || '';

    // 确定状态码 - 默认 500
    const statusCode = err.code || err.status || err.statusCode || 500;

    // 构建错误响应
    const errorResponse = {
        message: err.message || 'Internal Server Error',
    }

    // 发送错误响应
    res.send({
        code: statusCode,
        message: errorResponse.message,
        stack: errorStack,
    })
}

module.exports = errorHandler;