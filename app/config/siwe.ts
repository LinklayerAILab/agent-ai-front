import { type SIWEConfig } from '@reown/appkit-siwe';
import { SiweMessage } from 'siwe';
import { getSiweNonce, verifySiweMessage } from '../api/user';
import { setUserInfo, syncPoints, logout, setOtherInfo } from '../store/userSlice';
import { get_user_info } from '../api/agent_c';
import { CHAIN_ID } from '../enum';
import { store } from '../store';
import { getAddress, isAddress } from 'viem';
import { formatMessage } from '@reown/appkit-siwe';

const SIWE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
const INVITE_CODE_KEY = 'invite_code';

const getTextLength = (value: unknown): number =>
  typeof value === 'string' ? value.length : 0;

const logSiweStep = (step: string, payload?: Record<string, unknown>) => {
  console.info(`[SIWE] ${step}`, payload || {});
};

const normalizeSiweAddress = (input: unknown): string | null => {
  if (typeof input !== 'string') return null;

  const raw = input.trim().replace(/^['"]|['"]$/g, '');
  const decoded = (() => {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();

  const candidates = [raw, decoded];
  if (decoded.includes(':')) {
    candidates.push(decoded.split(':').pop() || '');
  }
  if (raw.includes(':')) {
    candidates.push(raw.split(':').pop() || '');
  }

  for (const candidate of candidates) {
    const c = candidate.trim();
    if (isAddress(c, { strict: false })) {
      return getAddress(c);
    }
    const matched = c.match(/0x[a-fA-F0-9]{40}/);
    if (matched && isAddress(matched[0], { strict: false })) {
      return getAddress(matched[0]);
    }
  }

  return null;
};

const isPlaceholderAddress = (input: unknown): boolean =>
  typeof input === 'string' && input.includes('<<AccountAddress>>');

const extractSiweErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') {
    return 'Unknown SIWE verification error';
  }

  const err = error as {
    message?: unknown;
    data?: { message?: unknown; code?: unknown };
    response?: { data?: { message?: unknown; code?: unknown } };
  };

  if (typeof err.data?.message === 'string' && err.data.message) {
    return err.data.message;
  }

  if (
    typeof err.response?.data?.message === 'string' &&
    err.response.data.message
  ) {
    return err.response.data.message;
  }

  if (typeof err.message === 'string' && err.message) {
    return err.message;
  }

  return 'Unknown SIWE verification error';
};

export const siweConfig: SIWEConfig = {
  async getNonce(_address?: string): Promise<string> {
    void _address;
    logSiweStep('getNonce:start', { address: _address || null });
    const { data } = await getSiweNonce();
    logSiweStep('getNonce:success', {
      nonceLength: getTextLength(data?.nonce),
    });
    return data.nonce;
  },

  async getMessageParams() {
    const params = {
      domain: process.env.NEXT_PUBLIC_SIWE_DOMAIN || window.location.host,
      uri: window.location.origin,
      chains: [CHAIN_ID],
      statement: 'Sign in with Ethereum to LinkLayer AI Agent',
      exp: new Date(Date.now() + SIWE_EXPIRATION_MS).toISOString(),
      iat: new Date().toISOString(),
    };
    logSiweStep('getMessageParams', {
      domain: params.domain,
      uri: params.uri,
      chains: params.chains,
      chainIdIsFinite: Number.isFinite(CHAIN_ID),
    });
    return params;
  },

  createMessage(args) {
    try {
      logSiweStep('createMessage:start', {
        hasAddress: Boolean(args.address),
        addressSample:
          typeof args.address === 'string' ? args.address.slice(0, 24) : null,
        chainId: args.chainId,
        domain: args.domain,
      });

      if (isPlaceholderAddress(args.address)) {
        const iss = `did:pkh:eip155:${Number(args.chainId)}:${String(args.address)}`;
        const placeholderMessage = formatMessage(
          {
            domain: args.domain,
            aud: args.uri,
            version: args.version,
            nonce: args.nonce,
            iat: args.iat || new Date().toISOString(),
            nbf: args.nbf,
            exp: args.exp,
            statement: args.statement,
            requestId: args.requestId,
            resources: args.resources,
          },
          iss,
        );
        logSiweStep('createMessage:placeholder', {
          iss,
          messageLength: getTextLength(placeholderMessage),
        });
        return placeholderMessage;
      }

      const normalizedAddress = normalizeSiweAddress(args.address);
      if (!normalizedAddress) {
        throw new Error(`Invalid SIWE address: ${String(args.address)}`);
      }

      const siweMessage = new SiweMessage({
        domain: args.domain,
        address: normalizedAddress,
        statement: args.statement,
        uri: args.uri,
        version: args.version,
        chainId: Number(args.chainId),
        nonce: args.nonce,
        issuedAt: args.iat,
        expirationTime: args.exp,
      });

      const prepared = siweMessage.prepareMessage();
      logSiweStep('createMessage:success', {
        messageLength: getTextLength(prepared),
        rawAddressSample: `${normalizedAddress.slice(0, 8)}...${normalizedAddress.slice(-4)}`,
      });
      return prepared;
    } catch (error) {
      console.error('[SIWE] createMessage failed', {
        reason: extractSiweErrorMessage(error),
        args,
        error,
      });
      throw error;
    }
  },

  async verifyMessage({ message, signature, cacao }): Promise<boolean> {
    try {
      logSiweStep('verifyMessage:start', {
        hasCacao: Boolean(cacao),
        messageLength: getTextLength(message),
        signatureLength: getTextLength(signature),
      });

      const invite_code = localStorage.getItem(INVITE_CODE_KEY) || '';
      const result = await verifySiweMessage({
        message,
        signature,
        invite_code,
        ...(cacao ? { cacao } : {}),
      });

      if (!result.data?.access_token) {
        console.error('[SIWE] verifyMessage succeeded without access_token', {
          hasCacao: Boolean(cacao),
          messageLength: getTextLength(message),
          signatureLength: getTextLength(signature),
          response: result,
        });
        return false;
      }

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

      logSiweStep('verifyMessage:success', {
        address: result.data.address,
      });
      return true;
    } catch (error) {
      console.error('[SIWE] verifyMessage failed', {
        reason: extractSiweErrorMessage(error),
        hasCacao: Boolean(cacao),
        messageLength: getTextLength(message),
        signatureLength: getTextLength(signature),
        error,
      });
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
