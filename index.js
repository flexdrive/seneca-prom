const Prometheus = require('prom-client')
const fastify = require('fastify')()

const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_PORT = 19999

function Monitor(options) {
  const seneca = this
  const host = options.host || DEFAULT_HOST
  const port = options.port || DEFAULT_PORT
  const log = options.log || seneca.log

  const defaultMetrics = Prometheus.collectDefaultMetrics()

  function expose(port, host) {
    fastify.get('/metrics', function(request, reply) {
      reply
        .header('Content-Type', Prometheus.register.contentType)
        .send(Prometheus.register.metrics())
    })

    fastify.listen(port, host, function(err) {
      if (err) throw err
      log.info(`server listening on ${fastify.server.address().port}`)
    })
  }

  expose(port, host)

  process.on('SIGTERM', () => {
    clearInterval(defaultMetrics)
    fastify.close()
  })
}

module.exports = Monitor
