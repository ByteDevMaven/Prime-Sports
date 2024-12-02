# taken from http://www.piware.de/2011/01/creating-an-https-server-in-python/
# generate server.xml with the following command:
#    openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
# run as follows:
#    python simple-https-server.py
# then in your browser, visit:
#    https://localhost:90

#import BaseHTTPServer, SimpleHTTPServer
from http.server import HTTPServer, SimpleHTTPRequestHandler
import ssl
import logging

log_formatter = logging.Formatter('%(asctime)s - %(message)s')
log_file = 'server_requests.log'

file_handler = logging.FileHandler(log_file)
file_handler.setFormatter(log_formatter)

console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)

logger = logging.getLogger('http_logger')
logger.setLevel(logging.INFO)  # Set the minimum logging level to INFO
logger.addHandler(file_handler)
logger.addHandler(console_handler)

class LoggingHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        message = f"{self.client_address[0]} - {format % args}"
        logger.info(message)

# Define the server address and handler
server_address = ('0.0.0.0', 90)
httpd = HTTPServer(server_address, LoggingHandler)

# Create an SSL context
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)

# Load the certificate and key files
ssl_context.load_cert_chain(certfile='./server.pem')

# Wrap the server socket with the SSL context
httpd.socket = ssl_context.wrap_socket(httpd.socket, server_side=True)

# Start the server
print("Serving on https://localhost:90")
httpd.serve_forever()
