"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ValorSymbol({ className }: { className?: string }) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }
  
  const currentTheme = theme === 'system' ? systemTheme : theme
  const color = currentTheme === "dark" ? "#ffffff" : "#231f20"

  return (
    <svg 
      viewBox="0 0 436.35 377.89" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-colors duration-300`}
      style={{
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
        imageRendering: 'auto'
      }}
    >
      <g 
        fill="none" 
        stroke={color}
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {/* Main triangle outline */}
        <path 
          strokeWidth="18"
          d="M4.33,2.5L218.17,372.89L432,2.5Z"
        />
        {/* Inner diagonal lines */}
        <path 
          strokeWidth="18"
          d="M39.33,62.91l145.36-0.72l0.11,252.68L39.33,62.91Z M251.69,62.19L397,62.91l-145.47,252L251.69,62.19z"
        />
        {/* Small decorative elements */}
        <path 
          strokeWidth="6"
          d="M367.61,112.55L367.61,116.55L326.99,116.55L326.99,116.51L329.28,112.55Z
             M134.41,131.74L134.38,62.74L94.74,62.74Z
             M278.98,192.38L278.98,192.4L277.83,194.37L276.65,196.38L253.58,196.38L253.58,192.38Z"
        />
      </g>
    </svg>
  )
}