import { getDeepLink } from '@binance/w3w-utils'
import bnb from '@/app/images/logos/binan.svg'
import coinbase from '@/app/images/logos/coinbase2.svg'
import okx from '@/app/images/logos/okx.svg'
import bitget from '@/app/images/logos/bitget.svg'
import metamask from '@/app/images/logos/metamask2.svg'
import trustwallet from '@/app/images/logos/trust2.svg'
import { useTranslation } from 'react-i18next'

export const useToDapp = (toUrl: string) => {
    const { t } = useTranslation();

    const list = [
        { title: t('toDapp.loginViaBinance'), label: "Binance", link: "bnc://app.binance.com/web3/dapp?chainId=56&url=", icon: bnb, id: 1 },
        { title: t('toDapp.loginViaCoinbase'), label: "Coinbase", link: "https://go.cb-w.com/dapp?cb_url=", icon: coinbase, id: 2 },
        { title: t('toDapp.loginViaOKX'), label: "OKX", link: "okx://wallet/dapp/url?dappUrl=", icon: okx, id: 3 },
        { title: t('toDapp.loginViaBitget'), label: "Bitget", link: "https://bkcode.vip?action=dapp&url=", icon: bitget, id: 4 },
        { title: t('toDapp.loginViaMetamask'), label: "Metamask", link: "https://metamask.app.link/dapp/", icon: metamask, id: 5 },
        { title: t('toDapp.loginViaTrustWallet'), label: "TrustWallet", link: `trust://open_url?coin_id=${process.env.NEXT_PUBLIC_COIN_ID}&url=`, icon: trustwallet, id: 6 },
    ]

    const handleUrl = (url: string) => {
        return url + encodeURIComponent(toUrl);
    }
    const getInviteCode = (): string | '' => {
       return localStorage.getItem("invite_code") || '';
    };
    const handleTo = (link: string, id: number) => {
        if (id === 1) {
            const chainId = 56 // BSC mainnet chain ID
            const deepLink = getDeepLink(toUrl, chainId);
            window.location.href = deepLink.bnc
        } else if (id === 5) {
            const finalUrl = `${link}${location.host}?invite_code=${getInviteCode()}`;
            window.location.href = finalUrl;
        } else {
            const finalUrl = handleUrl(link);
            window.location.href = finalUrl;
        }
    }

    return {
        list,
        handleUrl,
        handleTo
    }
}
