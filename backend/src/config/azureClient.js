const { AIProjectClient } = require("@azure/ai-projects");
const { DefaultAzureCredential } = require("@azure/identity");

const client = new AIProjectClient(
  process.env.AZURE_PROJECT_ENDPOINT,
  new DefaultAzureCredential()
);

module.exports = client;