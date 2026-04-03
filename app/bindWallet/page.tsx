'use client';

import { useEffect, useState } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { bind_web3address } from '../api/agent_c';
import Link from 'next/link';
import { useAppKit } from '@reown/appkit/react';

function Page() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isClient, setIsClient] = useState(false);
  const { signMessage } = useSignMessage();
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      bind_web3address(address)
        .then(() => {
        })
        .catch((error) => {
          console.error('Failed to bind address:', error);
        });
    } else {
      open()
    }
  }, [isConnected, address]);
  const [sign, setSign] = useState('');
  const handleSign = async() => {
    // Implement your sign handling logic here
   
   performSignature()
    
  };

  const performSignature = async () => {
    try {
      // Ensure wallet is connected
      if (!isConnected || !address) {
        throw new Error('Wallet not connected. Please connect your wallet first.')
      }
      // Create signature message
      const sigMsg = `LinkLayer AI Agent Wallet Binding Address: ${address}`
      // Use Promise to handle Wagmi callback mode
      return new Promise<void>((resolve, reject) => {
        signMessage(
          { message: sigMsg },
          {
            onSuccess: async (signature) => {
              try {
                  // Call binding API
                  setSign(signature)
                  resolve()
                } catch (error) {
                  console.error('API call failed:', error)
                  reject(error)
                }
              },
              onError: (error) => {
                console.error('Signature failed:', error)
                reject(error)
              }
            }
          )
 
      })
      
    } catch (error) {
      console.error('Signature setup failed:', error)
      throw error
    }
  }

  if (!isClient) {
    return <div>isClient</div>;
  }

  if (isConnected) {
    return (
      <div>
        <Link href="/">Back Home</Link>
        <p>Connected with address: {address}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
        <div>sign: {sign}</div>
        <button onClick={handleSign}>to Sign</button>
      </div>
    );
  }

  return (
    <div>

    </div>
  );
}

export default Page;