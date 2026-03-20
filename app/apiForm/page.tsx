"use client";

import React, { useState } from "react";
import { Input, Select, message } from "antd";
import { useTranslation } from "react-i18next";
import LLButton from "../components/LLButton";
import { platformListData } from "../components/Home/PlatformList";
import { LeftOutlined, CheckOutlined, LockOutlined } from "@ant-design/icons";
import './page.scss'
import Image from "next/image";
import rightIcon2 from "@/app/images/agent/right.svg";
import rightGary from "@/app/images/agent/rightGary.svg";
import { useRouter } from "next/navigation";
import { add_userapikey } from "../api/agent_c";

const Page = () => {
  const router = useRouter();
  // 判断是否需要显示 Passphrase 字段
  const [list] = useState(platformListData.map(item => {
    return {
      ...item,
      disabled: item.name === 'Binance' ? false : true
    }
  }))
  const [selectedExchange, setSelectedExchange] = useState(platformListData[0].name);
  const needsPassphrase = selectedExchange === "OKX" || selectedExchange === "Bitget";
  const { t } = useTranslation();
  // 表单状态
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    // 校验必填字段
    if (!selectedExchange) {
      message.error(t('apiForm.cexNameRequired'));
      return;
    }

    if (!apiKey.trim()) {
      message.error(t('apiForm.apiKeyRequired'));
      return;
    }

    if (!secretKey.trim()) {
      message.error(t('apiForm.secretKeyRequired'));
      return;
    }

    if (needsPassphrase && !passphrase.trim()) {
      message.error(t('apiForm.passphraseRequired'));
      return;
    }

    console.log({
      exchange: selectedExchange,
      apiKey,
      secretKey,
      passphrase: needsPassphrase ? passphrase : undefined
    });
    try {
      setLoading(true)
     await add_userapikey({
      apikey: apiKey,
      secretkey: secretKey,
      passphrase: needsPassphrase ? passphrase : undefined,
      cex_name: selectedExchange.toLowerCase()
    })

    message.success(t('apiForm.submitSuccess'));
    router.replace('/');
    }finally{
    setLoading(false)

    }
  }

  const [tab, setTab] = useState(1);
  const handleTab = (index: number) => {
    setTab(index);
  }

  const handleTo = (item: typeof platformListData[0]) => {
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const docLink = isMobile ? (item.doc_mobile ? item.doc_mobile : item.doc_pc) : item.doc_pc;
    if (docLink) {
      window.open(docLink, "_blank");
    }
  };

  return (
    <div className="page-agent w-[100%] h-auto lg:h-[83vh] lg:border-solid lg:border-black lg:border-2 bg-white rounded-[8px] flex flex-col page-home-inner">

      <div className="h-[40px] lg:h-[4vh] bg-[#cf0] rounded-t-[8px] hidden lg:flex items-center px-[14px] cursor-pointer select-none" onClick={() => router.push('/')}>
        <LeftOutlined></LeftOutlined> <span className="text-[16px] ml-[4px] font-bold" >{t('common.back')}</span>
      </div>
      <div className="flex lg:hidden text-[18px] font-bold rounded-[8px] h-[44px] lg:h-[5vh] cursor-pointer">
        <div onClick={() => handleTab(1)} className={`home-btn flex-1 flex items-center justify-center bg-black text-white gap-2  border-[2px] border-black border-solid rounded-l-[8px] ${tab === 1 && 'selected'}`}>{t('apiForm.uploadApi')}</div>
        <div onClick={() => handleTab(2)} className={`home-btn flex-1 flex items-center justify-center gap-2 border-[2px] border-black border-solid rounded-r-[8px] ${tab === 2 && 'selected'}`}>{t('apiForm.apiGuide')}</div>
      </div>
      <div className="flex gap-[14px] justify-between h-[100%] py-[14px] lg:px-[20px] lg:h-[74vh]">
        <div className="hidden lg:flex w-[100%] justify-between gap-[14px]">
          <div className="w-[40%] h-[100%] bg-[#F1F1F1] rounded-[8px] p-[14px] hidden lg:flex flex-col justify-between">
            <div>
              <div className="text-[18px] font-bold">{t('home.readOnlyApiTitle')}</div>
              <div className="text-[14px] mt-[2vh]">
                {t('home.readOnlyApiDesc')}
              </div>
            </div>
            <div className="overflow-y-scroll h-[55vh] hide-scrollbar">
              {
                list.map((item, index) => (
                  <div key={index} className="flex items-center justify-between mt-[10px] p-[10px] bg-white rounded-[8px]">
                    <div className="flex items-center gap-3">
                      <Image src={item.imgA} alt={item.name} className="w-[28px] h-[28px] object-contain" />
                      <div className="font-bold text-[13px]">{item.name} {t('apiForm.readOnlyApiDocs')}</div>
                    </div>
                    <div className="text-[#007AFF] text-[14px] cursor-pointer">
                      {
                        !item.doc_pc ? <Image src={rightGary} alt="Right" className="inline-block w-[18px] h-[18px] mr-[4px] cursor-not-allowed" /> : <Image src={rightIcon2} alt="Right" className="inline-block w-[2vh] h-[2vh] mr-[4px]" onClick={() => handleTo(item)} />
                      }
                      
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          <div className="flex-1 h-[100%] lg:bg-[#F1F1F1] rounded-[8px] lg:p-[20px]">
            <form onSubmit={handleSubmit} className="h-[100%] flex flex-col">
              <div className="text-[20px] font-bold mb-[16px] lg:mb-[3vh]">{t('apiForm.title')}</div>

              {/* Exchange 下拉菜单 */}
              <div className="mb-[18px] lg:mb-[2.5vh]">
                <label className="block text-[14px] font-bold mb-[6px] lg:mb-[1vh]">{t('apiForm.exchange')} <span className="text-red-500">*</span></label>
                <Select
                  value={selectedExchange}
                  onChange={(value) => setSelectedExchange(value)}
                  className="w-[100%] exchange-select"
                  size="large"
                  optionLabelProp="label"
                  style={{
                    width: '100%',
                    height: '48px'
                  }}
                >
                  {list.map((platform, index) => (
                    <Select.Option
                      key={index}
                      value={platform.name}
                      disabled={platform.disabled}
                      label={
                        <div className="flex items-center gap-2">
                          <Image
                            src={platform.imgA}
                            alt={platform.name}
                            className={`w-[20px] h-[20px] object-contain ${platform.disabled ? 'grayscale' : ''}`}
                          />
                          <span>{platform.name}</span>
                        </div>
                      }
                    >
                      <div className={`flex items-center justify-between gap-2 ${platform.disabled ? 'text-gray-400' : ''}`}>
                        <div className="flex items-center gap-2">
                          <Image
                            src={platform.imgA}
                            alt={platform.name}
                            className={`w-[20px] h-[20px] object-contain ${platform.disabled ? 'grayscale' : ''}`}
                          />
                          <span>{platform.name}</span>
                        </div>
                        {platform.disabled ? (
                          <LockOutlined className="text-gray-400" />
                        ) : selectedExchange === platform.name ? (
                          <CheckOutlined />
                        ) : null}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* ApiKey 输入框 */}
              <div className="mb-[18px] lg:mb-[2.5vh]">
                <label className="block text-[14px] font-bold mb-[6px] lg:mb-[1vh]">{t('apiForm.apiKey')} <span className="text-red-500">*</span></label>
                <Input.Password
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('apiForm.apiKeyPlaceholder')}
                  className="api-input"
                  style={{ height: '48px' }}
                />
              </div>

              {/* SecretKey 输入框 */}
              <div className="mb-[18px] lg:mb-[2.5vh]">
                <label className="block text-[14px] font-bold mb-[6px] lg:mb-[1vh]">{t('apiForm.secretKey')} <span className="text-red-500">*</span></label>
                <Input.Password
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder={t('apiForm.secretKeyPlaceholder')}
                  className="api-input"
                  style={{ height: '48px' }}
                />
              </div>

              {/* Passphrase 输入框 (仅 OKX 和 Bitget 显示) */}
              {needsPassphrase && (
                <div className="mb-[18px] lg:mb-[2.5vh]">
                  <label className="block text-[14px] font-bold mb-[6px] lg:mb-[1vh]">{t('apiForm.passphrase')} <span className="text-red-500">*</span></label>
                  <Input.Password
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder={t('apiForm.passphrasePlaceholder')}
                    className="api-input"
                    style={{ height: '48px' }}
                  />
                </div>
              )}

              {/* 提交按钮 */}
              <div className="mt-[20px] lg:mt-[4vh]">
                <LLButton
                  className="bg-white h-[50px] lg:h-[5vh]"
                  style={{
                    background: '#cf0'
                  }}
                  loading={loading}
                  onClick={handleSubmit}
                >
                  {t('apiForm.submitApiKeys')}
                </LLButton>
              </div>
            </form>
          </div>
        </div>
        <div className="flex lg:hidden w-[100%] justify-between">
          {
            tab === 2 && <div className="w-[100%] h-[100%] bg-[#F1F1F1] rounded-[8px] p-[14px] flex flex-col justify-between">
              <div>
                <div className="text-[16px] font-bold">{t('home.readOnlyApiTitle')}</div>
                <div className="text-[12px] mt-[6px]">
                  {t('home.readOnlyApiDesc')}
                </div>
              </div>
              <div className="overflow-y-scroll h-auto hide-scrollbar">
                {
                  list.map((item, index) => (
                    <div key={index} className="flex items-center justify-between mt-[10px] p-[10px] bg-white rounded-[8px]">
                      <div className="flex items-center gap-3">
                        <Image src={item.imgA} alt={item.name} className="w-[28px] h-[28px] object-contain" />
                        <div className="font-bold text-[13px]">{item.name} {t('apiForm.readOnlyApiDocs')}</div>
                      </div>
                      <div className="text-[#007AFF] text-[14px] cursor-pointer">
                          {
                            !item.doc_pc ? <Image src={rightGary} alt="Right" className="inline-block w-[18px] h-[18px] mr-[4px] cursor-not-allowed" /> : <Image src={rightIcon2} alt="Right" className="inline-block w-[18px] h-[18px] mr-[4px]" onClick={() => handleTo(item)} />
                          }
                      
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          }
          {
            tab === 1 && <div className="flex-1 h-[100%] lg:bg-[#F1F1F1] rounded-[8px] lg:p-[20px]">
              <form onSubmit={handleSubmit} className="h-[100%] flex flex-col">
                <div className="text-[20px] font-bold mb-[16px] lg:mb-[3vh]">{t('apiForm.title')}</div>

                {/* Exchange 下拉菜单 */}
                <div className="mb-[18px] lg:mb-[2.5vh]">
                  <label className="block text-[14px] font-bold mb-[6px] lg:mb-[1vh]">{t('apiForm.exchange')} <span className="text-red-500">*</span></label>
                  <Select
                    value={selectedExchange}
                    onChange={(value) => setSelectedExchange(value)}
                    className="w-[100%] exchange-select"
                    size="large"
                    optionLabelProp="label"
                    style={{
                      width: '100%',
                      height: '48px'
                    }}
                  >
                 {list.map((platform, index) => (
                    <Select.Option
                      key={index}
                      value={platform.name}
                      disabled={platform.disabled}
                      label={
                        <div className="flex items-center gap-2">
                          <Image
                            src={platform.imgA}
                            alt={platform.name}
                            className={`w-[20px] h-[20px] object-contain ${platform.disabled ? 'grayscale' : ''}`}
                          />
                          <span>{platform.name}</span>
                        </div>
                      }
                    >
                      <div className={`flex items-center justify-between gap-2 ${platform.disabled ? 'text-gray-400' : ''}`}>
                        <div className="flex items-center gap-2">
                          <Image
                            src={platform.imgA}
                            alt={platform.name}
                            className={`w-[20px] h-[20px] object-contain ${platform.disabled ? 'grayscale' : ''}`}
                          />
                          <span>{platform.name}</span>
                        </div>
                        {platform.disabled ? (
                          <LockOutlined className="text-gray-400" />
                        ) : selectedExchange === platform.name ? (
                          <CheckOutlined />
                        ) : null}
                      </div>
                    </Select.Option>
                  ))}
                  </Select>
                </div>

                {/* ApiKey 输入框 */}
                <div className="mb-[18px] lg:mb-[2.5vh]">
                  <label className="block text-[14px] font-bold mb-[6px] lg:mb-[1vh]">{t('apiForm.apiKey')} <span className="text-red-500">*</span></label>
                  <Input.Password
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={t('apiForm.apiKeyPlaceholder')}
                    className="api-input"
                    style={{ height: '48px' }}
                  />
                </div>

                {/* SecretKey 输入框 */}
                <div className="mb-[18px] lg:mb-[2.5vh]">
                  <label className="block text-[14px] font-bold mb-[6px] lg:mb-[1vh]">{t('apiForm.secretKey')} <span className="text-red-500">*</span></label>
                  <Input.Password
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder={t('apiForm.secretKeyPlaceholder')}
                    className="api-input"
                    style={{ height: '48px' }}
                  />
                </div>

                {/* Passphrase 输入框 (仅 OKX 和 Bitget 显示) */}
                {needsPassphrase && (
                  <div className="mb-[18px] lg:mb-[2.5vh]">
                    <label className="block text-[14px] font-bold mb-[6px] lg:mb-[1vh]">{t('apiForm.passphrase')} <span className="text-red-500">*</span></label>
                    <Input.Password
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder={t('apiForm.passphrasePlaceholder')}
                      className="api-input"
                      style={{ height: '48px' }}
                    />
                  </div>
                )}

                {/* 提交按钮 */}
                <div className="mt-[20px] lg:mt-[4vh]">
                  <LLButton
                    className="bg-white h-[50px] lg:h-[5vh]"
                    style={{
                      background: '#cf0'
                    }}
                    onClick={handleSubmit}
                  >
                    {t('apiForm.submitApiKeys')}
                  </LLButton>
                </div>
              </form>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default Page;
