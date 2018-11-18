const activityController = require('../controllers/controller.useractivitylog');
module.exports =  function (req, res, next) {
        // middleware
        const createDataToSaveInDb = {
            baseUrl: req.baseUrl,
            body: req.body,
            decoded: req.decoded,
            originalUrl: req.originalUrl,
            headers: req.headers,
            route: req.route,
            query: req.query
        };
        
        activityController.logUserActivity(createDataToSaveInDb, res);    
}