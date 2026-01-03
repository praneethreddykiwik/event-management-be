// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({
  region: "ap-south-1",
});

const loadSecretsSM = async () => {
  const secret_name = process.env.SECRET_NAME;
  console.log("loadSecretsSM From SM Start", { secret_name });

  try {
    const command = new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    });
    const response = await client.send(command);

    if (!response.SecretString) {
      console.log("loadSecretsSM Failed; SecretString not exists", response);
      // throw new Error("SecretString is empty");
    }

    console.log("loadSecretsSM From SM Success");
    return JSON.parse(response.SecretString);
  } catch (error) {
    console.error("loadSecretsSM From SM Error", error);
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    // throw error;
  }
};

// move this to AWS credential manager
const loadEnvSecrets = () => {
  try {
    const secretManagement = loadSecretsSM();
    console.log("secretManagement secrets success", secretManagement);
  } catch (error) {
    console.log("secretManagement secrets Error", error);
  }

  return {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
  };
};

module.exports = {
  loadSecretsSM,
  loadEnvSecrets,
};
