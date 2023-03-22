import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const cedric2PubKey = "STM7s8Ww49SwkCspGJEsq7r9jGYP9kgnmKCwhbkjSzR6wYNij9XBq";
const cedric3PubKey = "STM5VJzEog2gH576KsVnjPYwLqPY6yNuNejVa5sPjaNjWd8eP3YPK";

const getVoteTransaction = () => {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  return {
    expiration: date,
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
};

const socket = io.connect("http://localhost:5001");

const App = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState(null);
  const [socketIoId, setSocketIoId] = useState(null);
  const [keychainDetected, setKeychainDetected] = useState(false);
  const [usedPubKey, setUsedPubKey] = useState({});
  const [signatureRequest, setSignatureRequest] = useState();

  const checkKeychain = () => {
    console.log("check keychain");
    setKeychainDetected(!!window.hive_keychain);
  };

  useEffect(() => {
    if (isConnected) return;
    console.log("hello", socket.connected);
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
      // console.log("signature requested for", signatureRequest, usedPubKey);
      setSignatureRequest(signatureRequest);
    });
  }, []);

  useEffect(() => {
    console.log("receivedSignatureRequest", signatureRequest);

    if (!signatureRequest) return;
    const signer = signatureRequest.signers.find(
      (s) => s.publicKey === usedPubKey.key
    );

    const totalWeight = signatureRequest.signers.reduce((total, signer) => {
      return total + signer.weight;
    }, 0);
    console.log(totalWeight);
    // Lock request on backend to be able to broadcast
    socket.emit("request_lock", signatureRequest.id, (response) => {
      console.log(response);
      if (response) {
      } else {
        console.log("already locked");
      }
    });

    let shouldBroadcast = false;
    if (totalWeight + signer.weight >= signatureRequest.threshold) {
      window.hive_keychain.requestVerifyKey(
        usedPubKey.username,
        signer.encryptedTransaction,
        signatureRequest.keyType,
        (response) => {
          console.log(response);
          window.hive_keychain.requestSignTx(
            usedPubKey.username,
            JSON.parse(response.result.replace("#", "")),
            signatureRequest.keyType,
            (res) => {
              console.log(res);
              const signedTransaction = res.result;
              if (shouldBroadcast) {
                // broadcast signed transaction
                // notifiy backend
              } else {
                // return signature to backend
              }
            }
          );
        }
      );
    }
  }, [signatureRequest]);

  const sendPing = () => {
    console.log("send ping");

    try {
      socket.emit("ping");
    } catch (err) {
      console.log(err);
    }
  };

  const sendSignerConnectMessage = (username, publicKey) => {
    socket.emit("signer_connect", [publicKey], (pendingSignatureRequests) => {
      console.log("pending signature requests", pendingSignatureRequests);
    });
    setUsedPubKey({ username: username, key: publicKey });
  };

  const sendRequestSignatureMessage = (encodedTransaction) => {
    socket.emit("request_signature", {
      expirationDate: getVoteTransaction().expiration,
      threshold: 2,
      keyType: "Posting",
      signers: [
        {
          encryptedTransaction: encodedTransaction,
          publicKey: cedric3PubKey,
          weight: 1,
        },
      ],
    });
  };

  const initMultisigTransaction = () => {
    window.hive_keychain.requestSignTx(
      "cedric.tests",
      getVoteTransaction(),
      "Posting",
      (response) => {
        if (response.result) {
          // Retrieve other signers public key
          window.hive_keychain.requestEncodeMessage(
            "cedric.tests2",
            "cedric.tests3",
            `#${JSON.stringify(response.result)}`,
            "Posting",
            (res) => {
              sendRequestSignatureMessage(res.result);
            }
          );
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
        <p>Using: {JSON.stringify(usedPubKey)}</p>
      </div>
      <button onClick={sendPing}>Send Ping</button>
      <br />
      <button
        onClick={() => sendSignerConnectMessage("cedric.tests2", cedric2PubKey)}
      >
        Send connect message cedric.tests2
      </button>
      <button
        onClick={() => sendSignerConnectMessage("cedric.tests3", cedric3PubKey)}
      >
        Send connect message cedric.tests3
      </button>
      <button onClick={() => initMultisigTransaction()}>
        Initialize transaction (with cedric2)
      </button>
    </div>
  );
};

export default App;
