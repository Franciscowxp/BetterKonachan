import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import * as assets from 'koa-static';
import * as views from 'koa-views';
import * as path from 'path';
import * as websockify from 'koa-websocket';
//tslint:disable no-import-side-effect
import 'reflect-metadata';

import { fileInit } from '~controller/file';
import { PORT } from '~config';

import { router, ws } from '~route/index';

fileInit();
const app: websockify.App = websockify(new Koa());
const viewConf: Koa.Middleware = views(
    path.resolve(__dirname, './assets/dist/'),
    {
        map: {
            html: 'swig'
        }
    }
);

//@ts-ignore
app.ws.use(ws.routes())
    .use(ws.allowedMethods());

app.use(logger())
    .use(bodyParser())
    .use(viewConf)
    .use(assets('.'))
    .use(router())
    .listen(PORT);
