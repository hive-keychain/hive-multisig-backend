import { Client } from "@hiveio/dhive";
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
        "transfer",
        {
          from: "cedric.tests",
          to: "tshiuan89",
          amount: "0.001 HIVE",
          memo: "",
        },
      ],
    ],
    ref_block_num: 64310,
    ref_block_prefix: 216731410,
  };
};

const socket = io.connect("http://localhost:5001");
const client = new Client("https://api.deathwing.me");

const App = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState(null);
  const [socketIoId, setSocketIoId] = useState(null);
  const [keychainDetected, setKeychainDetected] = useState(false);
  const [usedPubKey, setUsedPubKey] = useState({});
  const [signatureRequest, setSignatureRequest] = useState();
  const [pendingSignatureRequests, setPendingSignatureRequests] = useState([]);

  const checkKeychain = () => {
    console.log("check keychain");
    setKeychainDetected(!!window.hive_keychain);
  };

  useEffect(() => {
    if (isConnected) return;
    checkKeychain();

    socket.on("connect", () => {
      setSocketIoId(socket.id);
      setIsConnected(true);
    });

    socket.on("transaction_broadcasted_notification", (signatureRequest) => {
      console.log(signatureRequest, "was broadcasted");
      alert(`signature request ${signatureRequest.id} was broadcasted`);
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

    window.hive_keychain.requestVerifyKey(
      usedPubKey.username,
      signer.encryptedTransaction,
      signatureRequest.keyType,
      (response) => {
        const transaction = JSON.parse(response.result.replace("#", ""));
        window.hive_keychain.requestSignTx(
          usedPubKey.username,
          transaction,
          signatureRequest.keyType,
          (res) => {
            const signedTransaction = res.result;
            console.log(signedTransaction);
            socket.emit(
              "sign_transaction",
              {
                signature:
                  signedTransaction.signatures[
                    signedTransaction.signatures.length - 1
                  ],
                signerId: signer.id,
                signatureRequestId: signatureRequest.id,
              },
              async (signatures) => {
                // Broadcast
                console.log("should broadcast", signatures);
                transaction.signatures = signatures;
                // await client.broadcast.send(transaction);
                socket.emit(
                  "notify_transaction_broadcasted",
                  { signatureRequestId: signatureRequest.id },
                  () => {
                    console.log("backend notified of broadcast");
                  }
                );
              }
            );
          }
        );
      }
    );

    // Lock request on backend to be able to broadcast
  }, [signatureRequest]);

  const sendPing = () => {
    console.log("send ping");

    try {
      socket.emit("ping");
    } catch (err) {
      console.log(err);
    }
  };

  const sendSignerConnectMessage = (username) => {
    window.hive_keychain.requestSignBuffer(
      username,
      username,
      "posting",
      (signBufferResponse) => {
        if (signBufferResponse.error) {
          console.log("error while signing buffer");
          return;
        } else {
          console.log(signBufferResponse);
          socket.emit(
            "signer_connect",
            [
              {
                publicKey: signBufferResponse.publicKey,
                message: signBufferResponse.result,
                username: signBufferResponse.data.username,
              },
            ],
            (loginResponse) => {
              if (loginResponse.error) {
                console.log("login rejected");
              } else {
                console.log("pending signature requests", loginResponse.result);
                setPendingSignatureRequests(loginResponse[username]);
                setUsedPubKey({
                  username: username,
                  key: signBufferResponse.publicKey,
                });
              }
            }
          );
        }
      }
    );
  };

  const sendRequestSignatureMessage = (
    encodedTransaction,
    signature,
    username
  ) => {
    socket.emit(
      "request_signature",
      {
        signatureRequest: {
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
        },
        initialSigner: {
          publicKey: cedric2PubKey,
          signature: signature,
          username: username,
          weight: 1,
        },
      },
      () => {
        console.log("signature requested");
      }
    );
  };

  const initMultisigTransaction = () => {
    window.hive_keychain.requestSignTx(
      "cedric.tests",
      getVoteTransaction(),
      "Posting",
      (response) => {
        const signedTransaction = response.result;
        if (signedTransaction) {
          // Retrieve other signers public key
          window.hive_keychain.requestEncodeMessage(
            "cedric.tests2",
            "cedric.tests3",
            `#${JSON.stringify(response.result)}`,
            "Posting",
            (res) => {
              if (res.result) {
                sendRequestSignatureMessage(
                  res.result,
                  signedTransaction.signatures[0],
                  "cedric.tests2"
                );
              }
            }
          );
        }
      }
    );
  };

  const signPending = (p) => {
    console.log(p);
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
      {navigator.userAgentData.brands.some((b) =>
        b.brand.includes("Brave")
      ) && (
        <>
          <button onClick={() => sendSignerConnectMessage("cedric.tests2")}>
            Send connect message cedric.tests2
          </button>
          <button onClick={() => initMultisigTransaction()}>
            Initialize transaction (with cedric2)
          </button>
        </>
      )}
      {!navigator.userAgentData.brands.some((b) =>
        b.brand.includes("Brave")
      ) && (
        <button onClick={() => sendSignerConnectMessage("cedric.tests3")}>
          Send connect message cedric.tests3
        </button>
      )}
      <br /> <br /> <br /> <br />
      {/* {pendingSignatureRequests.length > 0 && (
        <div style={{ display: "flex", flexDirection: "row", rowGap: 8 }}>
          {pendingSignatureRequests.map((p, i) => (
            <div key={i}>
              signature {i} <button onClick={signPending(p)}></button>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
};

export default App;
