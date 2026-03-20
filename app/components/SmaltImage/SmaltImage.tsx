"use client"
import React, { useState } from 'react';
import { Skeleton, Empty } from 'antd';
import Image, { ImageProps } from 'next/image';

interface SmaltImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  loadingPlaceholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
}

export default function SmaltImage(props: SmaltImageProps) {
  const {
    src,
    alt,
    width,
    height,
    className,
    style,
    loadingPlaceholder,
    errorPlaceholder,
    ...rest
  } = props;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const placeholderContainerStyle: React.CSSProperties = {
    width,
    height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  const defaultLoadingPlaceholder = <Skeleton.Image active={true} style={{ width, height }} />;
  const defaultErrorPlaceholder = <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />;

  if (error) {
    return (
      <div style={placeholderContainerStyle} className={className}>
        {errorPlaceholder || defaultErrorPlaceholder}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: width || 'auto', height: height || 'auto' }}>
      {loading && (
        <div style={{ ...placeholderContainerStyle, position: 'absolute', top: 0, left: 0, zIndex: 1 }} className={className}>
          {loadingPlaceholder || defaultLoadingPlaceholder}
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{
          height: width || 'auto',
          width: height || 'auto',
          ...style,
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        {...rest}
      />
    </div>
  );
}
