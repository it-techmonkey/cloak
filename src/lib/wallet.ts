export type WalletConfig = {
  appleEnabled: boolean;
  googleEnabled: boolean;
};

export function getWalletConfig(): WalletConfig {
  return {
    appleEnabled: !!(
      process.env.APPLE_PASS_TYPE_ID &&
      process.env.APPLE_TEAM_ID &&
      process.env.APPLE_PASS_CERT_PEM &&
      process.env.APPLE_PASS_KEY_PEM &&
      process.env.APPLE_WWDR_PEM
    ),
    googleEnabled: !!(
      process.env.GOOGLE_WALLET_ISSUER_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ),
  };
}
