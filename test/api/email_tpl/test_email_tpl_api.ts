import { IModelRoute } from 'nodejs-utils';
import { strapFramework } from 'restify-utils';
import { Collection, Connection } from 'waterline';
import { Server } from 'restify';
import { all_models_and_routes, c, IObjectCtor, strapFrameworkKwargs } from '../../../main';
import { create_and_auth_users, tearDownConnections } from '../../shared_tests';
import { EmailTplTestSDK } from './email_tpl_test_sdk';
import { user_mocks } from '../user/user_mocks';
import { IAuthSdk } from '../auth/auth_test_sdk.d';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { IUserBase } from '../../../api/user/models.d';
import { email_tpl_mocks } from './email_tpl_mocks';
import { IEmailTpl } from '../../../api/email_tpl/models.d';

declare const Object: IObjectCtor;

const models_and_routes: IModelRoute = {
    user: all_models_and_routes['user'],
    auth: all_models_and_routes['auth'],
    email_tpl: all_models_and_routes['email_tpl']
};

process.env['NO_SAMPLE_DATA'] = 'true';
const user_mocks_subset: IUserBase[] = user_mocks.successes.slice(30, 40);

describe('EmailTpl::routes', () => {
    let sdk: EmailTplTestSDK;
    let auth_sdk: IAuthSdk;
    let app: Server;

    before('tearDownConnections', done => tearDownConnections(c.connections, done));

    before('strapFramework', done => strapFramework(Object.assign({}, strapFrameworkKwargs, {
        models_and_routes,
        createSampleData: false,
        start_app: false,
        use_redis: true,
        app_name: 'test-email-tpl-api',
        callback: (err, _app, _connections: Connection[], _collections: Collection[]) => {
            if (err) return done(err);
            c.connections = _connections;
            c.collections = _collections;
            app = _app;
            sdk = new EmailTplTestSDK(app);
            auth_sdk = new AuthTestSDK(app);
            return done();
        }
    })));

    before('Create & auth users', done => create_and_auth_users(user_mocks_subset, auth_sdk, done));

    // Deregister database adapter connections
    after('unregister all users', done => auth_sdk.unregister_all(user_mocks_subset, done));
    after('tearDownConnections', done => tearDownConnections(c.connections, done));

    describe('/api/email_tpl', () => {
        afterEach('deleteEmailTpl', done =>
            sdk.destroy(user_mocks_subset[0].access_token, email_tpl_mocks.successes[0], done));

        it('POST should create EmailTpl', done =>
            sdk.create(user_mocks_subset[0].access_token, email_tpl_mocks.successes[0], done)
        );
    });

    describe('/api/email_tpl/:createdAt', () => {
        before('createEmailTpl', done =>
            sdk.create(user_mocks_subset[0].access_token, email_tpl_mocks.successes[1], _ => done()));
        after('deleteEmailTpl', done =>
            sdk.destroy(user_mocks_subset[0].access_token, email_tpl_mocks.successes[1], done));

        it('GET should retrieve EmailTpl', done =>
            sdk.get(user_mocks_subset[0].access_token, email_tpl_mocks.successes[1], done)
        );

        it('PUT should update EmailTpl', done =>
            sdk.update(user_mocks_subset[0].access_token, email_tpl_mocks.successes[1],
                {tpl: 'foo', createdAt: email_tpl_mocks.successes[1].createdAt} as IEmailTpl, done)
        );

        it('DELETE should destroy EmailTpl', done =>
            sdk.destroy(user_mocks_subset[0].access_token, email_tpl_mocks.successes[1], done)
        );
    });
});
