'use client'

import { MDXProvider } from '@mdx-js/react'
import { MDXComponents } from './MDXComponents'

interface MDXProviderWrapperProps {
  children: React.ReactNode
}

export function MDXProviderWrapper({ children }: MDXProviderWrapperProps) {
  return (
    <MDXProvider components={MDXComponents}>
      {children}
    </MDXProvider>
  )
}
