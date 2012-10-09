#!/usr/bin/env python

import bottle
import requests
from wsgiref.simple_server import make_server

go_host = "ci.tools"
go_port = 8153

app = bottle.Bottle()

@app.route("<path:re:.*>")
def proxy(path):
    url = "http://{go_host}:{go_port}{path}".format(
            go_host = go_host,
            go_port = str(go_port),
            path = path)
    response = requests.get(url)
    bottle.response.set_header("Content-Type", "application/xml")
    bottle.response.set_header("Access-Control-Allow-Origin", "*")
    return response.content

def main():
    http_server = make_server("", int(go_port), app)
    http_server.serve_forever()

if __name__ == "__main__":
    main()
