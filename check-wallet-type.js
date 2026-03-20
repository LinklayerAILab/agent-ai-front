/**
 * 检查钱包地址类型工具
 * 用于诊断社交登录和 EOA 钱包的签名差异问题
 */

const { ethers } = require('ethers');

// Sepolia 测试网 RPC
const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

/**
 * 检查地址是否是智能合约
 */
async function checkWalletType(address, rpcUrl = SEPOLIA_RPC) {
  console.log('\n=== 检查钱包类型 ===');
  console.log('地址:', address);
  console.log('网络:', rpcUrl);
  console.log('');

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // 1. 获取合约代码
    console.log('1. 检查合约代码...');
    const code = await provider.getCode(address);

    const isContract = code !== '0x' && code !== '0x0';

    console.log('   合约代码长度:', code.length);
    console.log('   是否是合约:', isContract ? '✅ 是' : '❌ 否');

    if (isContract) {
      console.log('   合约代码预览:', code.substring(0, 100) + '...');
    }

    // 2. 获取余额
    console.log('\n2. 检查账户余额...');
    const balance = await provider.getBalance(address);
    console.log('   余额:', ethers.formatEther(balance), 'ETH');

    // 3. 获取交易数量
    console.log('\n3. 检查交易数量...');
    const txCount = await provider.getTransactionCount(address);
    console.log('   Nonce:', txCount);

    // 4. 如果是合约,尝试检查 EIP-1271 支持
    if (isContract) {
      console.log('\n4. 检查 EIP-1271 支持...');
      try {
        const eip1271Interface = new ethers.Interface([
          'function isValidSignature(bytes32 _hash, bytes _signature) view returns (bytes4)'
        ]);

        const contract = new ethers.Contract(address, eip1271Interface, provider);

        // 尝试调用 isValidSignature (会失败,但能确认方法是否存在)
        const testHash = ethers.id('test');
        const testSig = '0x' + '00'.repeat(65);

        try {
          await contract.isValidSignature.staticCall(testHash, testSig);
          console.log('   EIP-1271 支持: ✅ 支持');
        } catch (error) {
          if (error.message.includes('function selector was not recognized')) {
            console.log('   EIP-1271 支持: ❌ 不支持 (方法不存在)');
          } else {
            console.log('   EIP-1271 支持: ⚠️ 可能支持 (调用失败但方法存在)');
            console.log('   错误信息:', error.message.substring(0, 100));
          }
        }
      } catch (error) {
        console.log('   EIP-1271 检查失败:', error.message);
      }
    }

    // 5. 结论
    console.log('\n=== 结论 ===');
    if (isContract) {
      console.log('📜 这是一个智能合约钱包');
      console.log('   - 签名方式: 可能使用 EIP-1271');
      console.log('   - 验证方式: 需要调用合约的 isValidSignature 方法');
      console.log('   - 后端需要: RPC 节点 + EIP-1271 验证逻辑');
    } else {
      console.log('📄 这是一个 EOA (外部拥有账户) 钱包');
      console.log('   - 签名方式: personal_sign (ECDSA)');
      console.log('   - 验证方式: ecrecover 恢复地址');
      console.log('   - 后端需要: 标准签名验证即可');
    }

    return {
      address,
      isContract,
      code: code.substring(0, 100),
      balance: ethers.formatEther(balance),
      txCount,
    };

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    throw error;
  }
}

/**
 * 比较两个地址的签名方式
 */
async function compareSignatures(eoaAddress, socialAddress) {
  console.log('\n\n╔════════════════════════════════════════════════════╗');
  console.log('║     签名差异诊断工具                              ║');
  console.log('╚════════════════════════════════════════════════════╝');

  console.log('\n--- EOA 钱包地址 ---');
  const eoaInfo = await checkWalletType(eoaAddress);

  console.log('\n--- 社交登录地址 ---');
  const socialInfo = await checkWalletType(socialAddress);

  console.log('\n\n=== 签名差异分析 ===');

  if (eoaInfo.isContract === socialInfo.isContract) {
    console.log('⚠️ 两个地址类型相同!');
    console.log('   问题可能不在钱包类型,而在签名格式或消息内容上');
  } else {
    console.log('✅ 找到差异!');
    console.log('\nEOA 钱包:');
    console.log('  - 类型: EOA');
    console.log('  - 签名: personal_sign');
    console.log('  - V 值: 27/28 或 0/1');
    console.log('  - 后端验证: ecrecover');

    console.log('\n社交登录钱包:');
    if (socialInfo.isContract) {
      console.log('  - 类型: 智能合约钱包');
      console.log('  - 签名: EIP-1271');
      console.log('  - 格式: 可能包含额外数据');
      console.log('  - 后端验证: 调用 isValidSignature');
    } else {
      console.log('  - 类型: EOA (意外!)');
      console.log('  - 可能问题: 签名消息格式不同');
    }
  }

  console.log('\n=== 建议的解决方案 ===');
  console.log('1. 后端实现双重验证:');
  console.log('   - 先尝试 EOA 验证 (ecrecover)');
  console.log('   - 失败后尝试 EIP-1271 验证');
  console.log('');
  console.log('2. 前端获取钱包类型:');
  console.log('   - 使用 provider.getCode(address) 检查');
  console.log('   - 传递钱包类型到后端');
  console.log('');
  console.log('3. 使用现成的库:');
  console.log('   - Go: github.com/storyicon/sigverify');
  console.log('   - Node.js: siwe 库已支持 EIP-1271');
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法:');
    console.log('  node check-wallet-type.js <address>');
    console.log('  node check-wallet-type.js <eoa-address> <social-address>');
    console.log('');
    console.log('示例:');
    console.log('  node check-wallet-type.js 0x265a81cEb74A4526dabCf356401d0b049abb7378');
    process.exit(1);
  }

  if (args.length === 1) {
    await checkWalletType(args[0]);
  } else {
    await compareSignatures(args[0], args[1]);
  }
}

// 如果直接运行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkWalletType, compareSignatures };
