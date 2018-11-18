const express = require('express');
const router = express.Router();
const middlewareContainer = require('../middlewares/middle.container');
const pageController = require('../controllers/controller.page');

// save page details
router.post('/savepagedetails', middlewareContainer.jwtTokenByPasser, pageController.savePageDetails);

// createPageWithPageName
router.post('/createpagewithpagename', middlewareContainer.jwtTokenByPasser, pageController.createPageWithPageName);

// getCreatedPages
router.get('/getcreatedpages', middlewareContainer.jwtTokenByPasser, pageController.getCreatedPages);

// getPageInfoFromId
router.get('/getpageinfo/:pageid', middlewareContainer.jwtTokenByPasser, pageController.getPageInfoFromId);

// getPageInfoFromId
router.get('/getpageinfousername/:username', middlewareContainer.jwtTokenByPasser, pageController.getPageInfoFromUsername);

// updateBasicPageDetails
router.post('/updateBasicPageDetails', middlewareContainer.jwtTokenByPasser, pageController.updateBasicPageDetails);

//updateDetailedPageDetails
router.post('/updatedetailedpagedetails', middlewareContainer.jwtTokenByPasser, pageController.updateDetailedPageDetails);

//updategroupforpage
router.post('/updategroupforpage', middlewareContainer.jwtTokenByPasser, pageController.updateGroupForPage);

// updatepublishrequest
router.post('/updatepublishrequest', middlewareContainer.jwtTokenByPasser, pageController.updatePublishRequest);



module.exports = router;