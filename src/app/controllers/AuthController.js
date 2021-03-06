import Controller from '../../core/controller';
import UserService from '../services/userService'
import JWT from '../helper/jwt';
import response from '../helper/response';
import request from '../helper/request';
import standards from '../helper/standards'
import passport from 'passport';


const userService = new UserService();

class AuthController extends Controller {
  constructor() {
    super();
  }

  /**
   * @api {post} auth/register register 
   * @apiName Register
   * @apiGroup Auth
   * @apiParam {string}  email user email.
   * @apiParam {string}  [name]  user name.
   * @apiParam {string}  password user password.
   * 
   * @apiBody {string}  email="user@gmail.com"  user email.
   * @apiBody {string}  name="user"  user name.
   * @apiBody {string}  password="12345678" user password.
   * @apiParamExample {json} Request-Example:
   *     {
   *       "email": "user@gmail.com",
   *       "name" : "user"
   *       "password": "12345678"
   *     }
   * @apiSuccessExample {json} Success-Response:
   *  
   *     HTTP/1.1 200 OK
   *      //happy case 
   *      //token in http header 
   *      {
   *          "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkZGJkZjViMWE0NmYyMTNlMWZiZTgxMyIsInVzZXIiOiJodXNzZWluIiwiaWF0IjoxNTc0Njk5NDM0LCJleHAiOjE1NzQ3ODU4MzQsImlzcyI6ImFyYWJpY2FqcyJ9.wvkEn8mPbi0S-AKLHSHi2A6xVDu26IQ5hcAOsY_pm4w"
   *      }
   *      //you must save it in local storage
   *  
   *      {
   *          "success": true,
   *          "data": {
   *              "user": {
   *                  "id": "5ddbdf5b1a46f213e1fbe813",
   *                  "name": "user",
   *                  "email": "user@gmail.com"
   *              },
   *              "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkZGJkZjViMWE0NmYyMTNlMWZiZTgxMyIsInVzZXIiOiJodXNzZWluIiwiaWF0IjoxNTc0Njk5NDM0LCJleHAiOjE1NzQ3ODU4MzQsImlzcyI6ImFyYWJpY2FqcyJ9.wvkEn8mPbi0S-AKLHSHi2A6xVDu26IQ5hcAOsY_pm4w",
   *              "expires_in": "1d"
   *          }
   *      }
   *     
   *     
   * @apiErrorExample {json} Error-Response 0:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "success": false,
   *       "code": 0,
   *       "errors": [
   *          {
   *             "path": "email",
   *             "message": "\"email\" is required"
   *          },
   *          {
   *             "path": "password",
   *             "message": "\"password\" is required"
   *          }
   *        ]
   *    }
   * @apiErrorExample {json} Error-Response 1:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "success": false,
   *       "code": 1,
   *       "errors": [
   *          {
   *              "path": "email",
   *              "message": "email already taken"
   *          }
   *        ]
   *    }
   */

  register(req, res, next) {
    const {
      name,
      email,
      password
    } = req.body;

    passport.authenticate('register', (err, user, info) => {
      if (err) return response.returnError(res, err);

      if (info != undefined)
        return response.returnError(res, info.message, 1);
      else {
        req.logIn(user, (err) => {
          if (err) return response.returnError(res, err);

          const token = JWT.sign(user);
          const options = JWT.options();

          let session = [request.getSession(req)];
          session[0].token = token;

          const data = {
            ...user,
            "sessions": session,
            "name": name
          };

          userService.update(req, data, (err, updated) => {
            res.set('Authorization', `Bearer ${token}`);
            return response.returnData(res, {
              "user": standards.getReturnUser(updated),
              "token": `Bearer ${token}`,
              "expires_in": options.expiresIn
            });
          });
        });
      }
    })(req, res, next);
  }


  /**
   * @api {post} auth/login login
   * @apiName Login
   * @apiGroup Auth
   * @apiParam {string}  email user email.
   * @apiParam {string}  password user password.
   * 
   * @apiBody {string}  email="admin@gmail.com"  admin email.
   * @apiBody {string}  password="12345678" user password.
   * @apiParamExample {json} Request-Example:
   *     {
   *       "email": "admin@gmail.com",
   *       "password": "12345678"
   *     }
   * @apiSuccessExample {json} Success-Response:
   *  
   *     HTTP/1.1 200 OK
   *      //happy case 
   *      //token in http header 
   *      {
   *          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkZGJkZjViMWE0NmYyMTNlMWZiZTgxMyIsInVzZXIiOiJodXNzZWluIiwiaWF0IjoxNTc0Njk5NDM0LCJleHAiOjE1NzQ3ODU4MzQsImlzcyI6ImFyYWJpY2FqcyJ9.wvkEn8mPbi0S-AKLHSHi2A6xVDu26IQ5hcAOsY_pm4w"
   *      }
   *      //you must save it in local storage
   *  
   *      {
   *          "success": true,
   *          "data": {
   *              "user": {
   *                  "id": "5ddbdf5b1a46f213e1fbe813",
   *                  "name": "admin",
   *                  "email": "admin@gmail.com"
   *              },
   *              "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkZGJkZjViMWE0NmYyMTNlMWZiZTgxMyIsInVzZXIiOiJodXNzZWluIiwiaWF0IjoxNTc0Njk5NDM0LCJleHAiOjE1NzQ3ODU4MzQsImlzcyI6ImFyYWJpY2FqcyJ9.wvkEn8mPbi0S-AKLHSHi2A6xVDu26IQ5hcAOsY_pm4w",
   *              "expires_in": "1d"
   *          }
   *      }
   *     
   *     
   * @apiErrorExample {json} Error-Response 0:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "success": false,
   *       "code": 0,
   *       "errors": [
   *          {
   *             "path": "email",
   *             "message": "\"email\" is required"
   *          },
   *          {
   *             "path": "password",
   *             "message": "\"password\" is required"
   *          }
   *        ]
   *    }
   * @apiErrorExample {json} Error-Response 1:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "success": false,
   *       "code": 1,
   *       "errors": [
   *          {
   *              "path": "email",
   *              "message": "bad email"
   *          }
   *        ]
   *    }
   * @apiErrorExample {json} Error-Response 2:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "success": false,
   *       "code": 2,
   *       "errors": [
   *          {
   *              "path": "passwords",
   *              "message": "passwords do not match"
   *          }
   *        ]
   *    }
   * 
   */

  login(req, res, next) {
    passport.authenticate('login', {
      session: false
    }, (err, user, info) => {
      if (err) return response.returnError(res, err);

      if (info !== undefined) {
        console.error(info.message);
        if (info.message === 'bad username') {
          res.status(401).send(info.message);
        } else {
          res.status(403).send(info.message);
        }
      } else {
        req.logIn(user, (err) => {
          if (err) return response.returnError(res, err);

          const token = JWT.sign(user);
          const options = JWT.options();

          let session = request.getSession(req);
          session.token = token;

          userService.updateSessions(req, user, session, (err, updated) => {
            res.set('Authorization', `Bearer ${token}`);
            return response.returnData(res, {
              "user": standards.getReturnUser(user),
              "token": `Bearer ${token}`,
              "expires_in": options.expiresIn
            });
          });
        });
      }
    })(req, res, next);
  }

  /**
   * @api {get} auth/logout logout
   * @apiName Logout
   * @apiGroup Auth
   * @apiHeader {string} Authorization back to server in http header for all requests
   * 
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *     {
   *          "success": true
   *     }
   */

  logout(req, res) {
    const ID = req.user.id;
    const token = req.headers.authorization.split(' ')[1];
    let sessions = [];

    req.user.sessions.map((item, i) => {
      if (item.token !== token)
        sessions.push(item);
    });

    userService.update(req, {
      id: ID,
      sessions
    }, () => {
      return response.returnSuccess(res);
    });
  }

}
export default AuthController;