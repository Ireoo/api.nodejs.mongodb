const basic = require('../lib/basic');
const colors = require("colors");
const mongojs = require('mongojs');

/**
 * 获取mongodb数据库参数
 */
const connect = process.env.MONGODB_CONNECTION || '127.0.0.1:27017/api';

/**
 * 设置mongodb数据库连接
 * @type {mongojs}
 */
let mongodb = mongojs(connect);

/**
 * 初始化颜色主题
 */
colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'blue',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

/**
 * 当用户访问首页时
 * @param req
 * @param res
 * @param next
 */
exports.index = (req, res, next) => {
    res.send("Welcome to api.");
};

/**
 * 用户已数据流形式访问页面/:key/:mode并提交参数
 * @param req
 * @param res
 * @param next
 */
exports.mongoDB = (req, res, next) => {

    req.params.key = req.params[0];
    req.params.mode = req.params[1];

    if (req.params.key && req.params.key !== '' && req.params.key !== 'undefined') {

        /**
         * 切换到 {req.params.key} 数据表
         */
        let db = eval("mongodb." + req.params.key);

        /**
         * 格式化数据流数据为JSON格式
         * @type {{}}
         */
        let input = req.input;

        /**
         * 调试输出获取的数据流信息
         */
        console.log("[input]  --> ".info + JSON.stringify(input).input);

        /**
         * 格式化数据流里各项参数where, data, other为JSON格式
         * @type {{}}
         */
        let where = JSON.stringify(input.where) === '[]' || !input.where ? {} : input.where;
        let data = JSON.stringify(input.data) === '[]' || !input.data ? {} : input.data;
        let other = JSON.stringify(input.other) === '[]' || !input.other ? {} : input.other;

        if (where.hasOwnProperty('_id') && where._id !== '') {
            where._id = mongojs.ObjectId(where._id);
        }
        	
        	// 定义变量
        	let sort, show, skip, limit, sql, dis;

        /**
         * 主体程序入口处
         */
        switch (req.params.mode) {
            /**
             * 执行插入命令
             */
            case 'insert':
                db.insert(data, (err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result);
                });
                break;

                /**
                 * 执行查找命令
                 */
            case 'find':
                sort = JSON.stringify(other.sort) === '[]' || !other.sort ? {} : other.sort;
                show = JSON.stringify(other.show) === '[]' || !other.show ? {} : other.show;
                skip = other.skip || 0;
                limit = other.limit || 0;

                if (limit == 0) {
                    sql = db.find(where, show);
                } else {
                    sql = db.find(where, show).skip(skip).limit(limit);
                }
                sql.sort(sort, (err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result);
                });
                break;

                /**
                 * 执行查找一条数据命令
                 */
            case 'findone':
                show = JSON.stringify(other.show) === '[]' || !other.show ? {} : other.show;
                db.findOne(where, show, (err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result);
                });
                break;

                /**
                 * 执行聚合查询命令
                 */
            case 'distinct':
                dis = JSON.stringify(other.distinct) === '[]' || !other.distinct ? '' : other.distinct;
                db.distinct(dis, where, (err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result);
                });
                break;

                /**
                 * 执行修改数据命令
                 */
            case 'update':
                db.update(where, data, other, (err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result);
                });
                break;

                /**
                 * 执行删除命令
                 */
            case 'remove':
                db.remove(where, (err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result);
                });
                break;

                /**
                 * 删除该数据库
                 */
            case 'drop':
                db.drop((err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result);
                });
                break;

                /**
                 * 获取该表状态信息
                 */
            case 'stats':
                db.stats((err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result);
                });
                break;

                /**
                 * 获取指定条件下数据量
                 */
            case 'count':
                db.count(where, (err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result.toString());
                });
                break;

                /**
                 * 创建索引
                 */
            case 'createIndex':
                db.ensureIndex(where, other, (err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result);
                });
                break;

                /**
                 * 重建索引
                 */
            case 'reIndex':
                db.reIndex((err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result);
                });
                break;

                /**
                 * 删除指定索引
                 */
            case 'dropIndex':
                db.dropIndex(where.index, (err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result);
                });
                break;

                /**
                 * 删除全部索引
                 */
            case 'dropIndexes':
                db.dropIndexes((err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result);
                });
                break;

                /**
                 * 获取索引信息
                 */
            case 'getIndexes':
                db.getIndexes((err, result) => {
                    console.log("[output] --> ".info + (err ? JSON.stringify(err).error : JSON.stringify(result).data));
                    res.send(err ? err : result);
                });
                break;

                /**
                 * 当不存在该指令时返回404
                 */
            default:
                console.log("[output] --> ".info + ("MODE[" + req.params.mode + "] no find!").error);
                res.status(404).send("404 NOT FOUND!");
                break;
        }

    } else {
        res.status(404).send("404 NOT FOUND!");
    }
};



