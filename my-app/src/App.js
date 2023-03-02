import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io.connect("http://localhost:5001");

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState(null);
  const [socketIoId, setSocketIoId] = useState(null);
  const [keychainDetected, setKeychainDetected] = useState(false);

  const checkKeychain = () => {
    setKeychainDetected(!!window.hive_keychain);
  };

  useEffect(() => {
    checkKeychain();

    socket.on("connect", () => {
      console.log("connect", socket);
      setSocketIoId(socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("pong", () => {
      setLastPong(new Date().toISOString());
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("pong");
    };
  }, []);

  const sendPing = () => {
    console.log("send ping");

    try {
      socket.emit("ping");
    } catch (err) {
      console.log(err);
    }
  };

  const sendSignerConnectMessage = () => {};

  return (
    <div className="App">
      <div>
        <p>Connected: {"" + isConnected}</p>
        <p>Last pong: {lastPong || "-"}</p>
        <p>Socket IO id: {socketIoId || "-"}</p>
        <p>Keychain detected: {keychainDetected}</p>
      </div>
      <button onClick={sendPing}>Send Ping</button>
      <button onClick={sendSignerConnectMessage}>Send connect message</button>
    </div>
  );
}

export default App;
