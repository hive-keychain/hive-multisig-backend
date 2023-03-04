import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io.connect("http://localhost:5001");

const cedric2PubKey = "STM7s8Ww49SwkCspGJEsq7r9jGYP9kgnmKCwhbkjSzR6wYNij9XBq";
const cedric3PubKey = "STM5VJzEog2gH576KsVnjPYwLqPY6yNuNejVa5sPjaNjWd8eP3YPK";

const voteTransaction = {
  expiration: "2023-03-04T04:17:36",
  extensions: [],
  operations: [
    [
      "vote",
      {
        voter: "cedric.tests",
        author: "\tcedricguillas",
        permlink: "introducing-my-new-witness",
        weight: 10000,
      },
    ],
  ],
  ref_block_num: 64310,
  ref_block_prefix: 216731410,
};

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
      setSocketIoId(socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("pong", () => {
      setLastPong(new Date().toISOString());
    });

    socket.on("request_sign_transaction", (signatureRequest) => {
      console.log("signature requested for", signatureRequest);
    });

    socket.on("sign_transaction_response", () => {
      console.log("ack signature requested");
    });

    socket.on("signer_connect_ack", () => {
      console.log("ack connected signer");
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

  const sendSignerConnectMessage = (publicKey) => {
    socket.emit("signer_connect", [publicKey]);
  };

  const sendRequestSignatureMessage = (encodedTransaction) => {
    socket.emit("request_signature", {
      expirationDate: voteTransaction.expiration,
      threshold: 2,
      keyType: "Posting",
      signers: [
        {
          encryptedTransaction: encodedTransaction,
          publicKey: cedric2PubKey,
          weight: 1,
        },
      ],
    });
  };

  const initMultisigTransaction = () => {
    window.hive_keychain.requestSignTx(
      "cedric.tests",
      voteTransaction,
      "Posting",
      (response) => {
        console.log(response);
        if (response.result) {
          // Retrieve other signers public key
          window.hive_keychain.requestEncodeMessage(
            "cedric.tests2",
            "cedric.tests3",
            `#${JSON.stringify(response.result)}`,
            "Posting",
            (res) => {
              console.log(res);
              sendRequestSignatureMessage(res.result);
            }
          );

          // send Message
        }
      }
    );
  };

  return (
    <div className="App">
      <div>
        <p>Connected: {"" + isConnected}</p>
        <p>Last pong: {lastPong || "-"}</p>
        <p>Socket IO id: {socketIoId || "-"}</p>
        <p>Keychain detected: {keychainDetected}</p>
      </div>
      <button onClick={sendPing}>Send Ping</button>
      <br />
      <button onClick={() => sendSignerConnectMessage(cedric2PubKey)}>
        Send connect message cedric.tests2
      </button>
      <button onClick={() => sendSignerConnectMessage(cedric3PubKey)}>
        Send connect message cedric.tests3
      </button>
      <button onClick={() => initMultisigTransaction()}>
        Initialize transaction (with cedric2)
      </button>
    </div>
  );
}

export default App;
