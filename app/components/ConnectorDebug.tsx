'use client'

import { useEffect } from 'react'
import { useConnect } from 'wagmi'

/**
 * 调试组件 - 打印所有 connector 的信息
 * 使用方式：将此组件添加到页面中，打开浏览器控制台查看输出
 */
export default function ConnectorDebug() {
  const { connectors } = useConnect()

  useEffect(() => {
    console.log('=== Wagmi Connectors Debug Info ===')
    connectors.forEach((connector, index) => {
      console.log(`Connector ${index + 1}:`, {
        id: connector.id,
        name: connector.name,
        type: connector.type,
        uid: connector.uid,
        icon: connector.icon,
      })
    })
    console.log('===================================')
  }, [connectors])

  return null // 不渲染任何内容
}
