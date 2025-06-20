"use client"

import { YoutubeIcon } from './youtubeIcon';
import { FacebookIcon } from './facebookIcon';
import { TwitterIcon } from './twitterIcon';
import { LinkedinIcon } from './linkedinIcon';
import { TelegramIcon } from './telegramIcon';
import { DiscordIcon } from './discordIcon';
import { RedditIcon } from './redditIcon';

export function Footer() {
  return (
    <footer className="border-t border-gray-200/20 dark:border-gray-800/20 bg-white/50 dark:bg-[#0A0B0D]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>Open Sourced by <a href="https://valortraders.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Valortraders</a>. All rights reserved. © 2025 </p>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com/valoralgo"
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a 
                href="https://facebook.com/valoralgo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com/company/valoralgo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a 
                href="https://youtube.com/@valoralgo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <YoutubeIcon className="h-5 w-5" />
              </a>
              <a 
                href="https://t.me/valoralgo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <TelegramIcon className="h-5 w-5" />
              </a>
              <a 
                href="https://discord.gg/valortraders" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <DiscordIcon className="h-5 w-5" />
              </a>
              <a 
                href="https://reddit.com/r/valoralgo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <RedditIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}