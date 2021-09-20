const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const app = require('../src/app.js');
// const app = require('../src/bin/www');
const should = chai.should();
const expect = chai.expect;

const faker = require('faker');


describe('GET /status', () => {
    it('should return status success', done => {
        chai
            .request(app)
            .get('/status')
            .end((err, res) => {
                res.should.have.status(200);
                expect(res.body).to.deep.equal({
                    "success": true
                });
                done();
            });
    });
});

describe('POST /auth/login', () => {
    it('should return loggedin user info with token', done => {
        chai
            .request(app)
            .post('/auth/login')
            .set('content-type', 'application/json')
            .send({
                email: 'admin@gmail.com',
                password: '12345678'
            })
            .end((err, res) => {
                res.should.have.status(200);

                expect(res.body).to.deep.include({
                    "success": true
                });
                expect(res.body).to.have.nested.property('data.expires_in');
                expect(res.body).to.have.nested.property('data.user');
                expect(res.body).to.have.nested.property('data.token');

                done();
            });
    });
});

describe('POST /auth/register', () => {
    it('should return register user info with token', done => {
        chai
            .request(app)
            .post('/auth/register')
            .set('content-type', 'application/json')
            .send({
                name: faker.name.firstName(),
                email: faker.internet.email(),
                password: "12345678"
            })
            .end((err, res) => {
                res.should.have.status(200);

                expect(res.body).to.deep.include({
                    "success": true
                });
                expect(res.body).to.have.nested.property('data.expires_in');
                expect(res.body).to.have.nested.property('data.user');
                expect(res.body).to.have.nested.property('data.token');

                done();
            });
    });
});