import { getAwsConnectionConfig } from "@/lib/config";
import { isJson } from "@/lib/utils/common";
import { SecretsManagerClient, CreateSecretCommand, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const credentials = getAwsConnectionConfig()
const secretsClient = new SecretsManagerClient(credentials);

/**
 * Creates a new secret in AWS Secrets Manager.
 *
 * @param {string} key - The unique name for the secret.
 * @param {string | object} secret - The secret value, either as a string or an object.
 * 
 * @returns {Promise<void>} Resolves when the secret is successfully created.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */
export async function createSecret(key: string, secret: String | Object): Promise<void> {
  try {
    const command = new CreateSecretCommand({
      Name: key,
      SecretString: "object" === typeof secret ? JSON.stringify(secret) : String(secret).trim(),
    });

    await secretsClient.send(command);
  } catch (error) {
    console.error("Error creating secret:", error);
  }
}

/**
 * Retrieves a secret from AWS Secrets Manager.
 *
 * @template T - The expected return type of the secret.
 * @param {string} key - The unique name of the secret to retrieve.
 * 
 * @returns {Promise<T | null>} Resolves with the secret if found, otherwise `null`.
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 */
export async function getSecret<T>(key: string): Promise<T | null> {
  try {
    const command = new GetSecretValueCommand({ SecretId: key });
    const response = await secretsClient.send(command);

    if (response.SecretString) {
      if (isJson(response.SecretString)) {
        return JSON.parse(response.SecretString) as T;
      } else {
        return response.SecretString as unknown as T;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching secret:", error);
    return null;
  }
}