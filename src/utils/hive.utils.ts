import { Client } from "@hiveio/dhive";

let hiveClient: Client;

const getClient = () => {
  if (!hiveClient)
    hiveClient = new Client([
      "https://api.deathwing.me",
      "https://api.hive.blog",
    ]);
  return hiveClient;
};

export const HiveUtils = {
  getClient,
};
