module.exports ={
  HOSTNAME: 'localhost', // Host to listen on
  APP_PORT: 3000, // Port for webapp
  ENV: 'development', // Note: NODE_ENV variable will override this
  
  useJsonPretty: true, // Disables pretty-printing
  useEtags: false, // ETag support for Koa responses using etag. (https://github.com/jshttp/etag)



  useHelmet: true,
  helmetOptions:{
    noCache: true,  // Sets the `Cache-Control` headers to prevent caching
    frameguard: {
      action: 'deny' // Set the `X-Frame-Options' header to be `DENY`
    }
  },

  useCompress: true,
  compressOptions:{
    threshold: 2048 // Sets the threshold to Gzip responses at 2k (2048 bytes)
  },

  useCors: true,
  corsOptions:{
    origin: '*' // Set the `Access-Control-Allow-Origin` header to be `*`
  },
}