const fs = require('fs');
const path = require('path');

const files = [
  'app/api/agent_c.ts',
  'app/api/proxy/[...path]/route.ts',
  'app/api/request.ts',
  'app/api/stream/route.ts',
  'app/apiForm/CopyGroup.tsx',
  'app/apiForm/page.tsx',
  'app/bindWallet/page.tsx',
  'app/components/Alpha/Alpha.tsx',
  'app/components/ChatMessageView/ChatMessageView.tsx',
  'app/components/CoinsList/CoinsList.tsx',
  'app/components/Connect.tsx',
  'app/components/ConnectorDebug.tsx',
  'app/components/Home/Home.tsx',
  'app/components/LoginButton.tsx',
  'app/components/RouteTransition.tsx',
  'app/components/SendStatus.tsx',
  'app/components/SetLang.tsx',
  'app/components/SwapBox/SwapBox.tsx',
  'app/components/Typewriter.tsx',
  'app/components/TypewriterNode.tsx',
  'app/crypto-analysis/[symbol]/page.tsx',
  'app/hooks/useStrategies.ts',
  'app/hooks/useWalletLogin.ts',
  'app/insight/page.tsx',
  'app/piloter/page.tsx',
  'app/position-analysis/[symbol]/page.tsx',
  'app/subscribe/Subscribe.tsx',
  'app/toDapp/page.tsx',
  'app/utils/connectionRecovery.ts',
  'app/utils/sessionErrorHandler.ts',
  'app/utils/tgAuth.ts',
  'app/utils/walletConnect.ts',
  'app/utils/walletConnectFix.ts',
  'app/utils/walletDebug.ts'
];

function removeConsoleLogs(content) {
  let lines = content.split('\n');
  let result = [];
  let inMultilineComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track multiline comments
    if (trimmed.includes('/*')) {
      inMultilineComment = true;
    }
    if (trimmed.includes('*/')) {
      inMultilineComment = false;
      result.push(line);
      continue;
    }
    if (inMultilineComment) {
      result.push(line);
      continue;
    }

    // Skip single line comments
    if (trimmed.startsWith('//')) {
      result.push(line);
      continue;
    }

    // Remove console.log and console.warn lines (but not console.error)
    // This handles both single-line and multi-line statements
    if (/^\s*console\.(log|warn)\(/.test(line)) {
      // Check if it's a multi-line statement
      if (!line.includes(')') || line.match(/\).*;/)) {
        continue; // Skip this line completely
      } else {
        // Multi-line statement, keep it for now but remove the console call
        // This is a simple approach - more complex cases might need AST parsing
        const indent = line.match(/^(\s*)/)[1];
        result.push(indent + '// ' + line.trim());
      }
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

function processFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const newContent = removeConsoleLogs(content);

    if (content !== newContent) {
      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log(`Processed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process all files
console.log('Removing console.log and console.warn from TypeScript files...\n');
let processedCount = 0;

files.forEach(file => {
  if (processFile(file)) {
    processedCount++;
  }
});

console.log(`\n✓ Processed ${processedCount} files`);
