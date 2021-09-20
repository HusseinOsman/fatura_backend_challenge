import Env from '../config/env';
import bcrypt from 'bcryptjs';

const passport = require('passport');
const BCRYPT_SALT_ROUNDS = 12;
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(
    'register',
    new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true,
            session: true,
        },
        async (req, email, password, done) => {
            try {
                const User = global.Models.users;
                const user = await User.findOne({
                    where: {
                        email
                    },
                }).select(["id"]);

                if (user != null) {
                    return done(null, false, {
                        message: 'username or email already taken',
                    });
                }
                bcrypt.hash(password, BCRYPT_SALT_ROUNDS).then(async hashedPassword => {
                    const user = await User.create({
                        password: hashedPassword,
                        email: req.body.email,
                    }).fetch();

                    return done(null, user);
                });

            } catch (err) {
                return done(err);
            }
        },
    ),
);

passport.use(
    'login',
    new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            session: false,
            passReqToCallback: true,
        },
        async (req, email, password, done) => {
            try {
                
                const User = req.app.models.users;

                const user = await User.findOne({
                    where: {
                        email,
                    },
                })

                if (!user)
                    return setTimeout(() => {
                        done(null, false, {
                            message: 'bad email'
                        })
                    }, 2000);

                bcrypt.compare(password, user.password).then(response => {
                    if (response !== true)
                        return setTimeout(() => {
                            done(null, false, {
                                message: 'passwords do not match'
                            });
                        }, 2000)

                    //user found & authenticated
                    return done(null, user);
                });
            } catch (err) {
                done(err);
            }
        },
    ),
);

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, cb) {
    cb(null, user);
});

const opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: Env.jwtSecret,
    passReqToCallback: true
};

passport.use(
    'jwt',
    new JWTstrategy(opts, async (req, payload, done) => {

        try {
            const User = global.Models.users;
            const user = await User.findOne({
                where: {
                    id: payload.id,
                },
            });

            if (user) {
                const token = opts.jwtFromRequest(req);
                const vaildToken = user.sessions.find((item) => item.token === token);
                (vaildToken) ? done(null, user): done(null, false);

            } else {
                done(null, false);
            }

        } catch (err) {
            done(err);
        }
    }),
);