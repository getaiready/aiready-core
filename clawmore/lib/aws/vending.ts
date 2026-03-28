import {
  OrganizationsClient,
  CreateAccountCommand,
  DescribeCreateAccountStatusCommand,
  ListAccountsCommand,
  ListTagsForResourceCommand,
  TagResourceCommand,
} from '@aws-sdk/client-organizations';
import {
  STSClient,
  AssumeRoleCommand,
  GetCallerIdentityCommand,
} from '@aws-sdk/client-sts';
import {
  IAMClient,
  CreateRoleCommand,
  AttachRolePolicyCommand,
} from '@aws-sdk/client-iam';

const orgClient = new OrganizationsClient({ region: 'us-east-1' }); // Organizations API is only in us-east-1
const stsClient = new STSClient({});

/**
 * Initiates the creation of a new AWS account specialized for a ClawMore Managed node.
 * Uses an address-tagged email to create unique accounts linked to a single owner email.
 *
 * @param userEmail - The owner's email address (will be sanitized for uniqueness).
 * @param userName - Friendly name for the account owner, used in the AccountName.
 * @param userId - Unique ID for the user to include in the account name.
 * @returns The CreateAccount request id which can be polled for completion.
 * @throws When the Organizations API fails to initiate account creation.
 */
export async function createManagedAccount(
  userEmail: string,
  userName: string,
  userId?: string,
  isWarmPool: boolean = false
): Promise<string> {
  const sanitizedEmail = isWarmPool
    ? userEmail.replace('@', `+clawpool-${Date.now().toString(36)}@`)
    : userEmail.replace('@', '+clawmore@');

  const shortId = userId ? userId.substring(0, 8).toUpperCase() : 'WARM';
  const accountName = isWarmPool
    ? `Claw-WarmPool-${Date.now().toString(36)}`
    : `Claw-${shortId} (${userName})`;

  const tags = [
    { Key: 'Project', Value: 'ClawMore' },
    { Key: 'Type', Value: 'ManagedNode' },
    { Key: 'Status', Value: isWarmPool ? 'Available' : 'Active' },
  ];

  if (!isWarmPool) {
    tags.push({ Key: 'Owner', Value: userEmail });
    if (userId) tags.push({ Key: 'UserId', Value: userId });
  }

  const command = new CreateAccountCommand({
    Email: sanitizedEmail,
    AccountName: accountName,
    RoleName: 'OrganizationAccountAccessRole',
    Tags: tags,
  });

  const response = await orgClient.send(command);

  if (!response.CreateAccountStatus?.Id) {
    throw new Error('Failed to initiate account creation');
  }

  return response.CreateAccountStatus.Id;
}

/**
 * Polls AWS until the account creation is complete and returns the new Account ID.
 *
 * @param requestId - The CreateAccount request id returned by `createManagedAccount`.
 * @param maxRetries - Maximum number of polling iterations (defaults to 20).
 * @returns The created AWS Account ID once creation succeeds.
 * @throws On failure state or when polling times out.
 */
export async function waitForAccountCreation(
  requestId: string,
  maxRetries = 20
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const command = new DescribeCreateAccountStatusCommand({
      CreateAccountRequestId: requestId,
    });

    const response = await orgClient.send(command);
    const status = response.CreateAccountStatus?.State;

    if (status === 'SUCCEEDED' && response.CreateAccountStatus?.AccountId) {
      return response.CreateAccountStatus.AccountId;
    }

    if (status === 'FAILED') {
      throw new Error(
        `Account creation failed: ${response.CreateAccountStatus?.FailureReason}`
      );
    }

    // Wait 5 seconds before polling again
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error('Timeout waiting for account creation');
}

/**
 * Scans the AWS Organization for an account tagged as available for vending.
 *
 * @returns The account id of an available account, or `null` when none found.
 */
export async function findAvailableAccountInPool(): Promise<string | null> {
  const listCommand = new ListAccountsCommand({});
  const response = await orgClient.send(listCommand);

  if (!response.Accounts) return null;

  for (const account of response.Accounts) {
    if (account.Status !== 'ACTIVE') continue;

    try {
      const tagsCommand = new ListTagsForResourceCommand({
        ResourceId: account.Id!,
      });
      const tagsResponse = await orgClient.send(tagsCommand);

      const statusTag = tagsResponse.Tags?.find((t) => t.Key === 'Status');
      if (statusTag?.Value === 'Available') {
        return account.Id!;
      }
    } catch (_e) {
      // Skip accounts where we can't read tags (e.g. Master account)
      continue;
    }
  }

  return null;
}

/**
 * Re-tags an account from the pool to a specific owner and project.
 *
 * @param accountId - The AWS Account Id to tag.
 * @param email - Owner email to assign to the account.
 * @param repo - Project/repository name to set on the account tags.
 * @returns Promise that resolves when tagging completes.
 */
export async function assignAccountToOwner(
  accountId: string,
  email: string,
  repo: string
) {
  const tagCommand = new TagResourceCommand({
    ResourceId: accountId,
    Tags: [
      { Key: 'Status', Value: 'Active' },
      { Key: 'Owner', Value: email },
      { Key: 'Project', Value: repo },
      { Key: 'VendedAt', Value: new Date().toISOString() },
    ],
  });

  await orgClient.send(tagCommand);
}

/**
 * Assumes the OrganizationAccountAccessRole in the sub-account and returns temporary credentials.
 * Includes a retry loop to handle propagation delay after account creation.
 *
 * @param accountId - The AWS Account Id of the sub-account to assume into.
 * @returns Temporary credentials object `{ accessKeyId, secretAccessKey, sessionToken }`.
 * @throws When the STS assume-role call does not return credentials after retries.
 */
export async function assumeSubAccountRole(accountId: string) {
  const roleArn = `arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`;
  const maxRetries = 10;
  const delayMs = 15000; // 15 seconds between retries

  for (let i = 0; i < maxRetries; i++) {
    try {
      const command = new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: 'ClawMoreBootstrapSession',
        DurationSeconds: 3600, // 1 hour
      });

      const response = await stsClient.send(command);

      if (!response.Credentials) {
        throw new Error('Failed to assume sub-account role: No credentials');
      }

      return {
        accessKeyId: response.Credentials.AccessKeyId!,
        secretAccessKey: response.Credentials.SecretAccessKey!,
        sessionToken: response.Credentials.SessionToken!,
      };
    } catch (error: any) {
      if (
        error.name === 'AccessDenied' ||
        error.name === 'InvalidIdentityToken'
      ) {
        console.log(
          `[AWS] Role ${roleArn} not yet assume-able (attempt ${i + 1}/${maxRetries}). Waiting...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    `Failed to assume sub-account role ${roleArn} after ${maxRetries} attempts`
  );
}

/**
 * Bootstraps a newly created managed account with a restricted management role.
 *
 * This creates a role in the sub-account that the main account can assume to perform
 * initial platform setup and attaches an administrative policy for bootstrap purposes.
 *
 * @param accountId - The AWS Account Id of the managed account to bootstrap.
 * @returns The ARN of the created bootstrap role in the sub-account.
 */
export async function bootstrapManagedAccount(accountId: string) {
  const credentials = await assumeSubAccountRole(accountId);
  const iamClient = new IAMClient({
    region: 'us-east-1',
    credentials,
  });

  const stsClientMain = new STSClient({});
  const identity = await stsClientMain.send(new GetCallerIdentityCommand({}));
  const mainAccountId = identity.Account!;

  const roleName = 'ClawMore-Bootstrap-Role';

  // 1. Create Role
  try {
    await iamClient.send(
      new CreateRoleCommand({
        RoleName: roleName,
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                AWS: `arn:aws:iam::${mainAccountId}:root`,
              },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
        Description:
          'Management role for ClawMore Platform to deploy resources.',
      })
    );
  } catch (error: any) {
    if (error.name !== 'EntityAlreadyExists') throw error;
  }

  // 2. Attach AdministratorAccess for now (can be restricted later)
  await iamClient.send(
    new AttachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn: 'arn:aws:iam::aws:policy/AdministratorAccess',
    })
  );

  return `arn:aws:iam::${accountId}:role/${roleName}`;
}
