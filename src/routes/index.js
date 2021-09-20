// routes/index.js
import express from 'express';
import authController from '../app/controllers/AuthController'
const AuthController = new authController();
let router = express.Router();

import isAuthenticated from '../app/middleware/isAuthenticated';
import Authentication from '../app/middleware/authentication';

import response from '../app/helper/response';
import passport from 'passport';

import validate from '../app/middleware/validate';
import validateAuth from '../app/validations/auth';

/* GET to check api status. */

 /**
   * @api {get} status status 
   * @apiName Status
   * @apiGroup General
   * 
   * @apiSuccessExample {json} Success-Response:
   *  
   *     HTTP/1.1 200 OK    
   *      {
   *          "success": true
   *      }
   *     
   *     
   * @apiErrorExample {json} Error-Response 0:
   *     HTTP/1.1 500 Server Internal Error
   */

router.get('/status', function (req, res, next) {
  response.returnSuccess(res);
});

router.post('/auth/register', validate(validateAuth.register), AuthController.register);

router.post('/auth/login', validate(validateAuth.login), AuthController.login);

  /**
   * @api {get} auth/check check
   * @apiName Check-Authentcation
   * @apiGroup Auth
   * @apiHeader {string} Authorization back to server in http header for all requests
   * 
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *     {
   *          "success": true,
   *          "data": {
   *              "id": "5ddbdf5b1a46f213e1fbe813",
   *              "name": "admin",
   *              "email": "admin@gmail.com"
   *          }
   *     }
   * @apiErrorExample {json} Error-Response :
   *     HTTP/1.1 401 Unauthorized
   *        Unauthorized
   */
router.get('/auth/check', isAuthenticated, (req, res) => {
  response.returnData(res, req.user);
});

router.get('/auth/logout', isAuthenticated, AuthController.logout);


export default router;