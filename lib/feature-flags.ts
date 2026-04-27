export const flags = {
  get resendEnabled(): boolean {
    return process.env.RESEND_ENABLED === 'true';
  },
};
