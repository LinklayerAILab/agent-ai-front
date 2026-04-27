import { type SIWEConfig } from '@reown/appkit-siwe';
import { SiweMessage } from 'siwe';
import { getSiweNonce, verifySiweMessage } from '../api/user';
import { setUserInfo, syncPoints, logout, setOtherInfo } from '../store/userSlice';
import { get_user_info } from '../api/agent_c';
import { CHAIN_ID } from '../enum';
import { store } from '../store';

const SIWE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
const INVITE_CODE_KEY = 'invite_code';

export const siweConfig: SIWEConfig = {
  async getNonce(_address?: string): Promise<string> {
    void _address;
    const { data } = await getSiweNonce();
    return data.nonce;
  },

  async getMessageParams() {
    return {
      domain: process.env.NEXT_PUBLIC_SIWE_DOMAIN || window.location.host,
      uri: window.location.origin,
      chains: [CHAIN_ID],
      statement: 'Sign in with Ethereum to LinkLayer AI Agent',
      exp: new Date(Date.now() + SIWE_EXPIRATION_MS).toISOString(),
      iat: new Date().toISOString(),
    };
  },

  createMessage(args) {
    // Extract raw address from CAIP-10 format (eip155:56:0x...) if needed
    const rawAddress = args.address.includes(':')
      ? args.address.split(':').pop()!
      : args.address;

    const siweMessage = new SiweMessage({
      domain: args.domain,
      address: rawAddress,
      statement: args.statement,
      uri: args.uri,
      version: args.version,
      chainId: args.chainId,
      nonce: args.nonce,
      issuedAt: args.iat,
      expirationTime: args.exp,
    });
    return siweMessage.prepareMessage();
  },

  async verifyMessage({ message, signature }): Promise<boolean> {
    try {
      const invite_code = localStorage.getItem(INVITE_CODE_KEY) || '';
      const result = await verifySiweMessage({ message, signature, invite_code });
      if (result.data?.access_token) {
        localStorage.setItem('access_token', result.data.access_token);
        localStorage.setItem('address', result.data.address);
        // Sync Redux via store dispatch (SIWE callbacks run outside React)
        store.dispatch(setUserInfo(result.data));
        store.dispatch(syncPoints());
        get_user_info().then((res: { data: unknown }) => {
          if (res) {
            store.dispatch(setOtherInfo(res.data));
          }
        });
        window.dispatchEvent(
          new CustomEvent('addressChanged', {
            detail: { address: result.data.address },
          }),
        );
      }
      return true;
    } catch {
      return false;
    }
  },

  async getSession() {
    const access_token = localStorage.getItem('access_token');
    const address = localStorage.getItem('address');
    if (access_token && address) {
      return { address, chainId: CHAIN_ID };
    }
    return null;
  },

  async signOut() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('address');
    store.dispatch(logout());
    return true;
  },

  onSignIn(_session) {
    void _session;
    // Redux and token storage already handled in verifyMessage
  },

  onSignOut() {
    // Handled by signOut()
  },

  enabled: true,
  required: false,
  nonceRefetchIntervalMs: 300_000, // 5 minutes, matches backend Redis TTL
  sessionRefetchIntervalMs: 300_000,
  signOutOnDisconnect: true,
  signOutOnAccountChange: true,
  signOutOnNetworkChange: true,
};
