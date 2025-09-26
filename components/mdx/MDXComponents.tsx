import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export const MDXComponents = {
  h1: ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
    <h1 
      className={cn("text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100", className)} 
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
    <h2 
      className={cn("text-3xl font-semibold mb-4 mt-8 text-gray-900 dark:text-gray-100", className)} 
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
    <h3 
      className={cn("text-2xl font-semibold mb-3 mt-6 text-gray-900 dark:text-gray-100", className)} 
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
    <h4 
      className={cn("text-xl font-semibold mb-2 mt-4 text-gray-900 dark:text-gray-100", className)} 
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, className, ...props }: React.HTMLProps<HTMLParagraphElement>) => (
    <p 
      className={cn("mb-4 text-gray-700 dark:text-gray-300 leading-relaxed", className)} 
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, className, ...props }: React.HTMLProps<HTMLUListElement>) => (
    <ul 
      className={cn("mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300", className)} 
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, className, ...props }: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol 
      className={cn("mb-4 ml-6 list-decimal space-y-2 text-gray-700 dark:text-gray-300", className)} 
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, className, ...props }: React.HTMLProps<HTMLLIElement>) => (
    <li 
      className={cn("text-gray-700 dark:text-gray-300", className)} 
      {...props}
    >
      {children}
    </li>
  ),
  blockquote: ({ children, className, ...props }: React.HTMLProps<HTMLQuoteElement>) => (
    <blockquote 
      className={cn("border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 dark:bg-blue-900/20 italic text-gray-700 dark:text-gray-300", className)} 
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }: React.HTMLProps<HTMLElement>) => (
    <code 
      className={cn("bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200", className)} 
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, className, ...props }: React.HTMLProps<HTMLPreElement>) => (
    <pre 
      className={cn("bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm", className)} 
      {...props}
    >
      {children}
    </pre>
  ),
  a: ({ children, className, href, ...props }: React.HTMLProps<HTMLAnchorElement>) => (
    <a 
      href={href}
      className={cn("text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline", className)} 
      {...props}
    >
      {children}
    </a>
  ),
  img: ({ src, alt, className }: React.HTMLProps<HTMLImageElement>) => (
    <Image 
      src={src || ''}
      alt={alt || ''}
      width={800}
      height={600}
      className={cn("max-w-full h-auto rounded-lg shadow-md mb-4", className)} 
    />
  ),
  table: ({ children, className, ...props }: React.HTMLProps<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-4">
      <table 
        className={cn("min-w-full border-collapse border border-gray-300 dark:border-gray-600", className)} 
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, className, ...props }: React.HTMLProps<HTMLTableSectionElement>) => (
    <thead 
      className={cn("bg-gray-50 dark:bg-gray-800", className)} 
      {...props}
    >
      {children}
    </thead>
  ),
  tbody: ({ children, className, ...props }: React.HTMLProps<HTMLTableSectionElement>) => (
    <tbody 
      className={cn("bg-white dark:bg-gray-900", className)} 
      {...props}
    >
      {children}
    </tbody>
  ),
  tr: ({ children, className, ...props }: React.HTMLProps<HTMLTableRowElement>) => (
    <tr 
      className={cn("border-b border-gray-200 dark:border-gray-700", className)} 
      {...props}
    >
      {children}
    </tr>
  ),
  th: ({ children, className, ...props }: React.HTMLProps<HTMLTableCellElement>) => (
    <th 
      className={cn("px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-600", className)} 
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, className, ...props }: React.HTMLProps<HTMLTableCellElement>) => (
    <td 
      className={cn("px-4 py-2 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600", className)} 
      {...props}
    >
      {children}
    </td>
  ),
  hr: ({ className, ...props }: React.HTMLProps<HTMLHRElement>) => (
    <hr 
      className={cn("my-8 border-gray-300 dark:border-gray-600", className)} 
      {...props}
    />
  ),
  strong: ({ children, className, ...props }: React.HTMLProps<HTMLElement>) => (
    <strong 
      className={cn("font-semibold text-gray-900 dark:text-gray-100", className)} 
      {...props}
    >
      {children}
    </strong>
  ),
  em: ({ children, className, ...props }: React.HTMLProps<HTMLElement>) => (
    <em 
      className={cn("italic text-gray-700 dark:text-gray-300", className)} 
      {...props}
    >
      {children}
    </em>
  ),
}
