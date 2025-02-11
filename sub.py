from flask import Flask, render_template
from flask_socketio import SocketIO
import paho.mqtt.client as mqtt
import time

# MQTT Configuration
BROKER = "3.109.19.112"
PORT = 1883
TOPICS = [("sensor/gas", 0), ("sensor/fire", 0)]

# Flask App & WebSocket
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# MQTT Callbacks
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker!")
        client.subscribe(TOPICS)
    else:
        print(f"❌ Connection failed with error code {rc}")

def on_message(client, userdata, msg):
    message = f"📩 {msg.topic}: {msg.payload.decode()}"
    print(message)  # Debug log
    time.sleep(1)
    print(f"Emitting message to WebSocket: {msg.topic} - {msg.payload.decode()}")  # Debug log
    socketio.emit("mqtt_message", {"topic": msg.topic, "message": msg.payload.decode()})

# Initialize MQTT Client
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(BROKER, PORT, 60)

# Run MQTT in Background
def mqtt_loop():
    mqtt_client.loop_forever()

# Serve HTML Page
@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    import threading
    mqtt_thread = threading.Thread(target=mqtt_loop, daemon=True)
    mqtt_thread.start()
    socketio.run(app, host="0.0.0.0", port=8000, debug=True)
