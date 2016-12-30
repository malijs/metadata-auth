import test from 'ava'
import path from 'path'
import caller from 'grpc-caller'
import Mali from 'mali'
import grpc from 'grpc'
import pMap from 'p-map'
import create from 'create-grpc-error'

import auth from '../'

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getHostport (port) {
  return '0.0.0.0:'.concat(port || getRandomInt(1000, 60000))
}

const PROTO_PATH = path.resolve(__dirname, './auth.proto')
const DYNAMIC_HOST = getHostport()
const apps = []
let client

test.before('should dynamically create service', t => {
  function handler (ctx) {
    ctx.res = { message: ctx.req.message.toUpperCase() }
  }

  async function auth1 (val, ctx, next) {
    if (val !== '1111') throw new Error('Wrong value')
    await next()
  }

  async function auth2 (val, ctx, next) {
    if (val !== '2222') throw new Error('Wrong value')
    await next()
  }

  const errMetadata = { code: 'AUTH_ERROR' }
  async function auth3 (key, ctx, next) {
    if (key !== '3333') throw create('Not Authorized', errMetadata)
    await next()
  }

  const errMetadata2 = { type: 'AUTH' }
  async function auth4 (key, ctx, next) {
    if (key !== '4444') throw create('Unauthorized 4', 4004, errMetadata2)
    await next()
  }

  const app = new Mali(PROTO_PATH, 'AuthService')
  apps.push(app)

  app.use('fn1', auth(auth1), handler)
  app.use('fn2', auth({ error: 'Unauthorized' }, auth2), handler)
  app.use('fn3', auth({ error: { metadata: errMetadata } }, auth3), handler)
  app.use('fn4', auth({ error: () => create('Unauthorized', 4000, errMetadata2) }, auth4), handler)
  app.start(DYNAMIC_HOST)

  client = caller(DYNAMIC_HOST, PROTO_PATH, 'AuthService')
})

test('Should fail with fn1 withouth metadata', async t => {
  t.plan(2)

  const error = await t.throws(client.fn1({ message: 'hello' }))
  t.is(error.message, 'Not Authorized')
})

test('Should fail with fn1 without authorization', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('foo', 'bar')
  const error = await t.throws(client.fn1({ message: 'hello' }, meta))
  t.is(error.message, 'Not Authorized')
})

test('Should fail with fn1 without correct authorization', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'bar')
  const error = await t.throws(client.fn1({ message: 'hello' }, meta))
  t.is(error.message, 'Wrong value')
})

test('Should work with fn1 with correct authorization', async t => {
  t.plan(1)
  const meta = new grpc.Metadata()
  meta.add('Authorization', '1111')
  const response = await client.fn1({ message: 'hello' }, meta)
  t.is(response.message, 'HELLO')
})

test('Should work with fn1 with correct authorization 2', async t => {
  t.plan(1)
  const meta = new grpc.Metadata()
  meta.add('authoRiZaTion', '1111')
  const response = await client.fn1({ message: 'hello' }, meta)
  t.is(response.message, 'HELLO')
})

// fn2 -----

test('Should fail with fn2 withouth metadata', async t => {
  t.plan(2)
  const error = await t.throws(client.fn2({ message: 'hello' }))
  t.is(error.message, 'Unauthorized')
})

test('Should fail with fn2 without authorization', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('foo', 'bar')
  const error = await t.throws(client.fn2({ message: 'hello' }, meta))
  t.is(error.message, 'Unauthorized')
})

test('Should fail with fn2 without correct authorization', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'bar')
  const error = await t.throws(client.fn2({ message: 'hello' }, meta))
  t.is(error.message, 'Wrong value')
})

test('Should work with fn2 with correct authorization', async t => {
  t.plan(1)
  const meta = new grpc.Metadata()
  meta.add('Authorization', '2222')
  const response = await client.fn2({ message: 'hello' }, meta)
  t.is(response.message, 'HELLO')
})

test('Should work with fn2 with correct authorization 2', async t => {
  t.plan(1)
  const meta = new grpc.Metadata()
  meta.add('authoRiZaTion', '2222')
  const response = await client.fn2({ message: 'hello' }, meta)
  t.is(response.message, 'HELLO')
})

// fn3 -----

test('Should fail with fn3 withouth metadata', async t => {
  t.plan(5)
  const error = await t.throws(client.fn3({ message: 'hello' }))
  t.is(error.message, 'Not Authorized')
  t.truthy(error.metadata)
  t.true(error.metadata instanceof grpc.Metadata)
  const md = error.metadata.getMap()
  t.is(md.code, 'AUTH_ERROR')
})

test('Should fail with fn3 without authorization', async t => {
  t.plan(5)
  const meta = new grpc.Metadata()
  meta.add('foo', 'bar')
  const error = await t.throws(client.fn3({ message: 'hello' }, meta))
  t.is(error.message, 'Not Authorized')
  t.truthy(error.metadata)
  t.true(error.metadata instanceof grpc.Metadata)
  const md = error.metadata.getMap()
  t.is(md.code, 'AUTH_ERROR')
})

test('Should fail with fn3 without correct authorization', async t => {
  t.plan(5)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'bar')
  const error = await t.throws(client.fn3({ message: 'hello' }, meta))
  t.is(error.message, 'Not Authorized')
  t.truthy(error.metadata)
  t.true(error.metadata instanceof grpc.Metadata)
  const md = error.metadata.getMap()
  t.is(md.code, 'AUTH_ERROR')
})

test('Should work with fn3 with correct authorization', async t => {
  t.plan(1)
  const meta = new grpc.Metadata()
  meta.add('Authorization', '3333')
  const response = await client.fn3({ message: 'hello' }, meta)
  t.is(response.message, 'HELLO')
})

test('Should work with fn3 with correct authorization 2', async t => {
  t.plan(1)
  const meta = new grpc.Metadata()
  meta.add('authoRiZaTion', '3333')
  const response = await client.fn3({ message: 'hello' }, meta)
  t.is(response.message, 'HELLO')
})

// fn4 -----

test('Should fail with fn4 withouth metadata', async t => {
  t.plan(6)
  const error = await t.throws(client.fn4({ message: 'hello' }))
  t.is(error.message, 'Unauthorized')
  t.truthy(error.metadata)
  t.true(error.metadata instanceof grpc.Metadata)
  t.is(error.code, 4000)
  const md = error.metadata.getMap()
  t.is(md.type, 'AUTH')
})

test('Should fail with fn4 without authorization', async t => {
  t.plan(6)
  const meta = new grpc.Metadata()
  meta.add('foo', 'bar')
  const error = await t.throws(client.fn4({ message: 'hello' }, meta))
  t.is(error.message, 'Unauthorized')
  t.truthy(error.metadata)
  t.true(error.metadata instanceof grpc.Metadata)
  t.is(error.code, 4000)
  const md = error.metadata.getMap()
  t.is(md.type, 'AUTH')
})

test('Should fail with fn4 without correct authorization', async t => {
  t.plan(6)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'bar')
  const error = await t.throws(client.fn4({ message: 'hello' }, meta))
  t.is(error.message, 'Unauthorized 4')
  t.truthy(error.metadata)
  t.true(error.metadata instanceof grpc.Metadata)
  t.is(error.code, 4004)
  const md = error.metadata.getMap()
  t.is(md.type, 'AUTH')
})

test('Should work with fn4 with correct authorization', async t => {
  t.plan(1)
  const meta = new grpc.Metadata()
  meta.add('Authorization', '4444')
  const response = await client.fn4({ message: 'hello' }, meta)
  t.is(response.message, 'HELLO')
})

test('Should work with fn4 with correct authorization 2', async t => {
  t.plan(1)
  const meta = new grpc.Metadata()
  meta.add('authoRiZaTion', '4444')
  const response = await client.fn4({ message: 'hello' }, meta)
  t.is(response.message, 'HELLO')
})

test.after.always('cleanup', async t => {
  await pMap(apps, app => app.close())
})
